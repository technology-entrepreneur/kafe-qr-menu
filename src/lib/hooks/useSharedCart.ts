'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CartItem {
  id: string;
  session_id: string;
  added_by_user_id: string | null;
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  custom_notes: string;
  status: 'pending' | 'ordered' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_nickname: string;
  avatar_color?: string;
  is_host: boolean;
  has_paid: boolean;
  amount_paid: number;
  joined_at?: string;
}

export interface UserContribution {
  participant: SessionParticipant;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export interface UseSharedCartOptions {
  sessionId: string;
  initialNickname?: string;
  tableNumber?: string;
  venueId?: string;
}

const AVATAR_COLORS = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0284C7', // Sky
];

export function useSharedCart({
  sessionId,
  initialNickname,
  tableNumber,
  venueId,
}: UseSharedCartOptions) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<SessionParticipant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const participantStorageKey = `aura_participant_${sessionId}`;

  // 1. Participant Registration / Retrieval
  const registerParticipant = useCallback(
    async (nickname: string, isHost = false): Promise<SessionParticipant | null> => {
      const supabase = getSupabaseClient();
      const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

      if (!supabase) {
        // Fallback for offline / demo mode
        const mockParticipant: SessionParticipant = {
          id: `local_user_${Date.now()}`,
          session_id: sessionId,
          user_nickname: nickname,
          avatar_color: randomColor,
          is_host: isHost,
          has_paid: false,
          amount_paid: 0,
        };
        setCurrentParticipant(mockParticipant);
        setParticipants((prev) => [...prev.filter((p) => p.id !== mockParticipant.id), mockParticipant]);
        localStorage.setItem(participantStorageKey, JSON.stringify(mockParticipant));
        return mockParticipant;
      }

      try {
        const { data, error: insertError } = await supabase
          .from('session_participants')
          .insert({
            session_id: sessionId,
            user_nickname: nickname.trim(),
            avatar_color: randomColor,
            is_host: isHost,
            has_paid: false,
            amount_paid: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const participant: SessionParticipant = data;
        setCurrentParticipant(participant);
        localStorage.setItem(participantStorageKey, JSON.stringify(participant));
        return participant;
      } catch (err: any) {
        console.error('[SharedCart] Error registering participant:', err);
        setError(err.message || 'Failed to join table session');
        return null;
      }
    },
    [sessionId, participantStorageKey]
  );

  // 2. Fetch Initial Session Data
  const fetchSessionData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !sessionId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch cart items
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (cartError) throw cartError;
      setItems((cartData as CartItem[]) || []);

      // Fetch participants
      const { data: partData, error: partError } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (partError) throw partError;
      setParticipants((partData as SessionParticipant[]) || []);

      // Check stored current participant
      const stored = localStorage.getItem(participantStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const activeMatch = (partData || []).find((p) => p.id === parsed.id);
          if (activeMatch) {
            setCurrentParticipant(activeMatch);
          } else {
            setCurrentParticipant(parsed);
          }
        } catch {}
      }
    } catch (err: any) {
      console.error('[SharedCart] Initial fetch failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, participantStorageKey]);

  // 3. Supabase Realtime WebSocket Subscription
  useEffect(() => {
    if (!sessionId) return;
    const supabase = getSupabaseClient();

    fetchSessionData();

    if (!supabase) {
      setIsConnected(false);
      return;
    }

    const channelName = `session_realtime_${sessionId}`;
    const channel = supabase.channel(channelName);

    // Listen to live Cart Items mutations
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as CartItem;
            setItems((prev) => {
              // 1. If item already exists with exact DB id, update it
              if (prev.some((item) => item.id === newItem.id)) {
                return prev.map((item) => (item.id === newItem.id ? newItem : item));
              }
              // 2. Reconcile optimistic item created locally
              const matchingOptIndex = prev.findIndex(
                (item) =>
                  item.id.startsWith('opt_') &&
                  item.item_id === newItem.item_id &&
                  item.added_by_user_id === newItem.added_by_user_id
              );
              if (matchingOptIndex !== -1) {
                const reconciled = [...prev];
                reconciled[matchingOptIndex] = newItem;
                return reconciled;
              }
              // 3. New item from another table participant
              return [...prev, newItem];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as CartItem;
            setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setItems((prev) => prev.filter((item) => item.id !== oldId));
          }
        }
      )
      // Listen to live Session Participants mutations
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newParticipant = payload.new as SessionParticipant;
            setParticipants((prev) => {
              if (prev.some((p) => p.id === newParticipant.id)) return prev;
              return [...prev, newParticipant];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as SessionParticipant;
            setParticipants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            if (currentParticipant?.id === updated.id) {
              setCurrentParticipant(updated);
            }
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setParticipants((prev) => prev.filter((p) => p.id !== oldId));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [sessionId, fetchSessionData, currentParticipant?.id]);

  // Auto-register if nickname provided and not registered
  useEffect(() => {
    if (initialNickname && !currentParticipant && !isLoading) {
      registerParticipant(initialNickname);
    }
  }, [initialNickname, currentParticipant, isLoading, registerParticipant]);

  // 4. Cart Mutation Actions (Optimistic + Backend)
  const addItem = useCallback(
    async (itemData: {
      itemId: string;
      itemName: string;
      price: number;
      quantity?: number;
      customNotes?: string;
    }) => {
      const supabase = getSupabaseClient();
      const qty = itemData.quantity || 1;
      const notes = itemData.customNotes || '';

      const optimisticId = `opt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const optimisticItem: CartItem = {
        id: optimisticId,
        session_id: sessionId,
        added_by_user_id: currentParticipant?.id || null,
        item_id: itemData.itemId,
        item_name: itemData.itemName,
        price: Number(itemData.price),
        quantity: qty,
        custom_notes: notes,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      // Optimistic state update
      setItems((prev) => [...prev, optimisticItem]);

      if (!supabase) return optimisticItem;

      try {
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            session_id: sessionId,
            added_by_user_id: currentParticipant?.id || null,
            item_id: itemData.itemId,
            item_name: itemData.itemName,
            price: Number(itemData.price),
            quantity: qty,
            custom_notes: notes,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        // Replace optimistic ID with database ID safely
        const savedItem = data as CartItem;
        setItems((prev) => {
          if (prev.some((item) => item.id === savedItem.id)) {
            return prev.filter((item) => item.id !== optimisticId);
          }
          return prev.map((item) => (item.id === optimisticId ? savedItem : item));
        });
        return savedItem;
      } catch (err: any) {
        console.error('[SharedCart] Error adding item:', err);
        // Rollback optimistic item on failure
        setItems((prev) => prev.filter((item) => item.id !== optimisticId));
        setError(err.message);
        return null;
      }
    },
    [sessionId, currentParticipant]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      const supabase = getSupabaseClient();

      if (newQuantity <= 0) {
        return removeItem(cartItemId);
      }

      // Optimistic update
      setItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
      );

      if (!supabase) return;

      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', cartItemId);

        if (error) throw error;
      } catch (err: any) {
        console.error('[SharedCart] Error updating quantity:', err);
        fetchSessionData();
      }
    },
    [fetchSessionData]
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      const supabase = getSupabaseClient();

      // Optimistic removal
      setItems((prev) => prev.filter((item) => item.id !== cartItemId));

      if (!supabase) return;

      try {
        const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
        if (error) throw error;
      } catch (err: any) {
        console.error('[SharedCart] Error removing item:', err);
        fetchSessionData();
      }
    },
    [fetchSessionData]
  );

  const updateNotes = useCallback(
    async (cartItemId: string, notes: string) => {
      const supabase = getSupabaseClient();
      setItems((prev) =>
        prev.map((item) => (item.id === cartItemId ? { ...item, custom_notes: notes } : item))
      );

      if (!supabase) return;

      try {
        const { error } = await supabase
          .from('cart_items')
          .update({ custom_notes: notes })
          .eq('id', cartItemId);

        if (error) throw error;
      } catch (err: any) {
        console.error('[SharedCart] Error updating notes:', err);
      }
    },
    []
  );

  const markAsOrdered = useCallback(async () => {
    const supabase = getSupabaseClient();
    setItems((prev) => prev.map((item) => ({ ...item, status: 'ordered' })));

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ status: 'ordered' })
        .eq('session_id', sessionId)
        .eq('status', 'pending');

      if (error) throw error;
    } catch (err: any) {
      console.error('[SharedCart] Error ordering cart:', err);
    }
  }, [sessionId]);

  const clearCart = useCallback(async () => {
    const supabase = getSupabaseClient();
    setItems([]);

    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
    } catch (err: any) {
      console.error('[SharedCart] Error clearing cart:', err);
    }
  }, [sessionId]);

  // 5. Computed Real-Time Table Analytics
  const totalTableItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const totalTableAmount = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  }, [items]);

  const userContributions = useMemo(() => {
    const map: Record<string, UserContribution> = {};

    // Initialize all participants
    participants.forEach((p) => {
      map[p.id] = {
        participant: p,
        items: [],
        itemCount: 0,
        subtotal: 0,
      };
    });

    // Unassigned bucket for items without specific user
    const unassignedId = 'unassigned';
    map[unassignedId] = {
      participant: {
        id: unassignedId,
        session_id: sessionId,
        user_nickname: 'Shared / Table Item',
        avatar_color: '#9CA3AF',
        is_host: false,
        has_paid: false,
        amount_paid: 0,
      },
      items: [],
      itemCount: 0,
      subtotal: 0,
    };

    items.forEach((item) => {
      const userId = item.added_by_user_id || unassignedId;
      if (!map[userId]) {
        map[userId] = {
          participant: {
            id: userId,
            session_id: sessionId,
            user_nickname: 'Guest',
            avatar_color: '#6B7280',
            is_host: false,
            has_paid: false,
            amount_paid: 0,
          },
          items: [],
          itemCount: 0,
          subtotal: 0,
        };
      }
      map[userId].items.push(item);
      map[userId].itemCount += item.quantity;
      map[userId].subtotal += Number(item.price) * item.quantity;
    });

    return map;
  }, [items, participants, sessionId]);

  return {
    items,
    participants,
    currentParticipant,
    totalTableItems,
    totalTableAmount,
    userContributions,
    isLoading,
    isConnected,
    error,
    actions: {
      addItem,
      updateQuantity,
      removeItem,
      updateNotes,
      registerParticipant,
      markAsOrdered,
      clearCart,
      refetch: fetchSessionData,
    },
  };
}

