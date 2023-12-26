import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartProduct {
  stockId: number;
  quantity: number;
  image?: string;
}

interface CartState {
  list: CartProduct[];
  addProduct: (stockId: number, quantity?: number, image?: string) => void;
  increment: (stockId: number, quantity?: number) => void;
  decrement: (stockId: number) => void;
  delete: (stockId: number) => void;
  clear: () => void;
  updateList: (list: CartProduct[]) => void;
  updateCount: (stockId: number, quantity: number) => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      list: [],
      addProduct: (stockId, quantity = 1, image = undefined) =>
        set((oldState) => ({ list: [...oldState.list, { stockId, quantity, image }] })),
      increment: (stockId, quantity = 1) =>
        set((oldState) => ({
          list: oldState.list.map((cartProduct) => {
            if (cartProduct.stockId === stockId) {
              return { stockId: cartProduct.stockId, quantity: cartProduct.quantity + quantity };
            }
            return cartProduct;
          }),
        })),
      decrement: (stockId, quantity = 1) =>
        set((oldState) => ({
          list: oldState.list.map((cartProduct) => {
            if (cartProduct.stockId === stockId) {
              return { stockId: cartProduct.stockId, quantity: cartProduct.quantity - quantity };
            }
            return cartProduct;
          }),
        })),
      delete: (stockId) =>
        set((oldState) => ({
          list: oldState.list.filter((cartProduct) => cartProduct.stockId !== stockId),
        })),
      updateCount: (stockId, quantity) =>
        set((oldState) => ({
          list: oldState.list.map((product) => {
            if (product.stockId === stockId) {
              return { ...product, quantity };
            }
            return product;
          }),
        })),
      clear: () => set({ list: [] }),
      updateList: (products) => set({ list: products }),
    }),
    { name: "cart" }
  )
);

export default useCartStore;
