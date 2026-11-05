// Sipariş API
// POST /api/orders — Yeni sipariş oluştur (müşteri veya garson)
// GET  /api/orders?sessionId=xxx — Oturuma ait siparişleri listele
// PATCH /api/orders/[id] — Sipariş durumunu güncelle (KDS)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastSSE } from "@/lib/sseBroadcast";
import { normalizeTableNumber } from "@/lib/tableUtils";

// ============================================================
// In-memory fallback
// ============================================================
const g = globalThis as any;
if (!g._orders) g._orders = new Map<string, any>();
const memOrders: Map<string, any> = g._orders;

if (!g._tableSessions) g._tableSessions = new Map<string, any>();
const memSessions: Map<string, any> = g._tableSessions;

function getMemSession(tableNumber: string) {
  const norm = normalizeTableNumber(tableNumber).toLowerCase();
  return Array.from(memSessions.values()).find(
    (s: any) => normalizeTableNumber(s.tableNumber).toLowerCase() === norm && s.status === "OPEN"
  ) || null;
}

// ============================================================
// GET — Oturuma ait siparişleri getir
// ============================================================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const rawTable = url.searchParams.get("tableNumber");
  const tableNumber = rawTable ? normalizeTableNumber(rawTable) : null;

  try {
    const orders = await prisma.order.findMany({
      where: {
        ...(sessionId ? { sessionId } : {}),
        ...(tableNumber
          ? {
              OR: [
                { tableNumber },
                { tableNumber: rawTable! },
                { tableNumber: `Masa ${tableNumber}` },
              ],
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ orders });
  } catch {
    const orders = Array.from(memOrders.values()).filter((o) => {
      if (sessionId) return o.sessionId === sessionId;
      if (tableNumber) {
        return normalizeTableNumber(o.tableNumber).toLowerCase() === tableNumber.toLowerCase();
      }
      return true;
    });
    return NextResponse.json({ orders });
  }
}

// ============================================================
// POST — Yeni sipariş oluştur
// Body: {
//   sessionId: string,
//   tableNumber: string,
//   source: "customer" | "waiter",
//   items: { productId, productName, productPrice, quantity, selectedOptions, unitPrice, totalPrice, kdsStation }[],
//   notes?: string,
//   totalAmount: number
// }
// ============================================================
export async function POST(req: Request) {
  const body = await req.json();
  const {
    sessionId,
    tableNumber: rawTable,
    source = "customer",
    items,
    notes,
    totalAmount,
  } = body;

  const tableNumber = normalizeTableNumber(rawTable) || rawTable;

  if (!sessionId || !tableNumber || !items || items.length === 0) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  // KDS istasyonu belirle — Mutfak, Bar veya Nargile istasyonu
  const kitchenItems = items.filter((i: any) => i.kdsStation === "kitchen");
  const barItems = items.filter((i: any) => i.kdsStation === "bar");
  const hookahItems = items.filter((i: any) => i.kdsStation === "hookah");
  const bothItems = items.filter((i: any) => !i.kdsStation || i.kdsStation === "both");

  const createdOrders: any[] = [];

  const createOrderInDB = async (
    orderItems: any[],
    kdsStation: string,
    amount: number
  ) => {
    try {
      const order = await prisma.order.create({
        data: {
          sessionId,
          tableNumber,
          source,
          status: "PENDING",
          kdsStation,
          totalAmount: amount,
          notes,
          items: {
            create: orderItems.map((item: any) => ({
              productId: item.productId?.startsWith("camp_") ? null : item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              quantity: item.quantity,
              selectedOptions: item.selectedOptions || [],
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              kdsStation,
              status: "PENDING",
            })),
          },
        },
        include: { items: true },
      });

      // Masa toplam tutarını güncelle
      await prisma.tableSession.update({
        where: { id: sessionId },
        data: { totalAmount: { increment: amount } },
      });

      return order;
    } catch {
      // In-memory fallback
      const order = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        sessionId,
        tableNumber,
        source,
        status: "PENDING",
        kdsStation,
        totalAmount: amount,
        notes,
        createdAt: new Date().toISOString(),
        items: orderItems.map((item: any, idx: number) => ({
          id: `item-${Date.now()}-${idx}`,
          productName: item.productName,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || [],
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: "PENDING",
          kdsStation,
        })),
      };
      memOrders.set(order.id, order);

      // Masa oturum tutarını güncelle
      let session = memSessions.get(sessionId) || getMemSession(tableNumber);
      if (!session) {
        session = {
          id: sessionId,
          tableNumber,
          sessionToken: Math.random().toString(36).slice(2),
          status: "OPEN",
          openedAt: new Date().toISOString(),
          totalAmount: 0,
          orders: [],
        };
        memSessions.set(session.id, session);
      }
      session.totalAmount = (session.totalAmount || 0) + amount;
      session.orders = session.orders || [];
      session.orders.push(order);

      return order;
    }
  };

  // Mutfak siparişi
  if (kitchenItems.length > 0 || bothItems.length > 0) {
    const kItems = [...kitchenItems, ...bothItems];
    const kAmount = kItems.reduce((s: number, i: any) => s + i.totalPrice, 0);
    const order = await createOrderInDB(kItems, "kitchen", kAmount);
    createdOrders.push(order);
  }

  // Bar siparişi
  if (barItems.length > 0) {
    const bAmount = barItems.reduce((s: number, i: any) => s + i.totalPrice, 0);
    const order = await createOrderInDB(barItems, "bar", bAmount);
    createdOrders.push(order);
  }

  // Nargile & Közhane siparişi
  if (hookahItems.length > 0) {
    const hAmount = hookahItems.reduce((s: number, i: any) => s + i.totalPrice, 0);
    const order = await createOrderInDB(hookahItems, "hookah", hAmount);
    createdOrders.push(order);
  }

  // Hiçbir istasyon ayrımı yoksa tek sipariş
  if (createdOrders.length === 0 && items.length > 0) {
    const order = await createOrderInDB(items, "kitchen", totalAmount);
    createdOrders.push(order);
  }

  // SSE Yayını — KDS, garson ve aynı masadaki müşteriler
  for (const order of createdOrders) {
    broadcastSSE(
      "new_order",
      {
        order,
        tableNumber,
        sessionId,
        source,
        kdsStation: order.kdsStation,
      },
      (client) =>
        client.role === "kds" ||
        client.role === "waiter" ||
        client.role === "admin" ||
        client.tableNumber === tableNumber
    );
  }

  return NextResponse.json({
    success: true,
    orders: createdOrders,
  });
}

