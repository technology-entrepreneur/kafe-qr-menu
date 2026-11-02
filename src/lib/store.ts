import { create } from "zustand";
import { ProductItem, ProductExtraOptionItem, SelectedExtraOption, CartItem } from "./types";
import { calculateItemUnitPrice } from "./cartMath";

interface MenuStoreState {
  // Modal / Bottom Sheet Durumu
  selectedProduct: ProductItem | null;
  isProductModalOpen: boolean;
  selectedOptions: SelectedExtraOption[];
  
  // Fırsat / Kampanya Seçimi
  selectedCampaignId: string | null;

  // Sepet / Tepsi Durumu
  cart: CartItem[];
  isCartOpen: boolean;

  // Eylemler (Actions)
  openProductModal: (product: ProductItem) => void;
  closeProductModal: () => void;
  toggleExtraOption: (
    groupId: string,
    groupTitle: string,
    option: ProductExtraOptionItem,
    maxSelect: number
  ) => void;
  setSelectedCampaignId: (campaignId: string | null) => void;
  
  // Sepet Eylemleri
  addToCart: (product: ProductItem, options?: SelectedExtraOption[], qty?: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
}

export const useMenuStore = create<MenuStoreState>((set, get) => ({
  selectedProduct: null,
  isProductModalOpen: false,
  selectedOptions: [],
  selectedCampaignId: null,
  cart: [],
  isCartOpen: false,

  openProductModal: (product: ProductItem) => {
    // Varsayılan zorunlu seçenekleri (varsa ilki) otomatik seç
    const initialOptions: SelectedExtraOption[] = [];
    if (product.extraGroups) {
      for (const group of product.extraGroups) {
        if (group.isRequired && group.options.length > 0) {
          const firstOpt = group.options[0];
          initialOptions.push({
            groupId: group.id,
            groupTitle: group.title,
            optionId: firstOpt.id,
            name: firstOpt.name,
            price: firstOpt.price,
          });
        }
      }
    }

    set({
      selectedProduct: product,
      isProductModalOpen: true,
      selectedOptions: initialOptions,
    });
  },

  closeProductModal: () => {
    set({
      selectedProduct: null,
      isProductModalOpen: false,
      selectedOptions: [],
    });
  },

  toggleExtraOption: (groupId, groupTitle, option, maxSelect) => {
    const current = get().selectedOptions;
    const isAlreadySelected = current.some((o) => o.optionId === option.id);

    if (isAlreadySelected) {
      // Seçimi kaldır
      set({
        selectedOptions: current.filter((o) => o.optionId !== option.id),
      });
      return;
    }

    if (maxSelect === 1) {
      // Tekli seçim (Radyo butonu mantığı): Aynı gruptaki diğer seçimi kaldır, yenisini ekle
      const filtered = current.filter((o) => o.groupId !== groupId);
      set({
        selectedOptions: [
          ...filtered,
          {
            groupId,
            groupTitle,
            optionId: option.id,
            name: option.name,
            price: option.price,
          },
        ],
      });
    } else {
      // Çoklu seçim: Gruptaki seçim sayısı maxSelect'ten küçükse ekle
      const groupCount = current.filter((o) => o.groupId === groupId).length;
      if (groupCount < maxSelect) {
        set({
          selectedOptions: [
            ...current,
            {
              groupId,
              groupTitle,
              optionId: option.id,
              name: option.name,
              price: option.price,
            },
          ],
        });
      }
    }
  },

  setSelectedCampaignId: (campaignId) => set({ selectedCampaignId: campaignId }),

  addToCart: (product: ProductItem, options?: SelectedExtraOption[], qty?: number) => {
    const selectedOptions = options !== undefined ? options : get().selectedOptions;
    const quantity = qty && qty > 0 ? qty : 1;
    const unitPrice = calculateItemUnitPrice(product.price, selectedOptions);

    // Aynı ürün ve birebir aynı ekstralara sahip mevcut kalemi bul
    const currentCart = get().cart;
    const sortedOptIds = (opts: SelectedExtraOption[]) =>
      opts.map((o) => o.optionId).sort().join(",");
    const targetOptKey = sortedOptIds(selectedOptions);

    const existingIndex = currentCart.findIndex(
      (item) =>
        item.product.id === product.id &&
        sortedOptIds(item.selectedOptions) === targetOptKey
    );

    if (existingIndex !== -1) {
      // Mevcut kalemin adetini artır
      const updatedCart = [...currentCart];
      const existing = updatedCart[existingIndex];
      const newQty = existing.quantity + quantity;
      updatedCart[existingIndex] = {
        ...existing,
        quantity: newQty,
        totalPrice: unitPrice * newQty,
      };

      set({
        cart: updatedCart,
        selectedProduct: null,
        isProductModalOpen: false,
        selectedOptions: [],
      });
      return;
    }

    // Yeni satır olarak ekle
    const newItem: CartItem = {
      product,
      quantity,
      selectedOptions: [...selectedOptions],
      totalPrice: unitPrice * quantity,
    };

    set((state) => ({
      cart: [...state.cart, newItem],
      selectedProduct: null,
      isProductModalOpen: false,
      selectedOptions: [],
    }));
  },

  updateQuantity: (index: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(index);
      return;
    }
    set((state) => {
      const updated = [...state.cart];
      const item = updated[index];
      if (!item) return state;
      const unitPrice = calculateItemUnitPrice(item.product.price, item.selectedOptions);
      updated[index] = {
        ...item,
        quantity,
        totalPrice: unitPrice * quantity,
      };
      return { cart: updated };
    });
  },

  removeFromCart: (index: number) => {
    set((state) => ({
      cart: state.cart.filter((_, i) => i !== index),
    }));
  },

  clearCart: () => set({ cart: [] }),
  setIsCartOpen: (open: boolean) => set({ isCartOpen: open }),
}));
