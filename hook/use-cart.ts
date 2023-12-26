"use client";

import useCartStore from "@/global-store/cart";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hook/use-debounce";
import useSettingsStore from "@/global-store/settings";
import { cartService } from "@/services/cart";
import useAddressStore from "@/global-store/address";
import { error } from "@/components/alert";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cart, InsertCartPayload } from "@/types/cart";
import { DefaultResponse } from "@/types/global";
import NetworkError from "@/utils/network-error";
import useUserStore from "@/global-store/user";
import { useRouter } from "next/navigation";

interface CartOptions {
  stockId: number;
  minQty: number;
  maxQty: number;
  onCounterClick: () => void;
  productQty: number;
  cartDetailId?: number;
  image?: string;
}

export const useCart = ({
  stockId,
  minQty = 1,
  maxQty = 1,
  onCounterClick,
  productQty = 0,
  cartDetailId,
  image,
}: Partial<CartOptions>) => {
  const { t } = useTranslation();
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();
  const localCartList = useCartStore((state) => state.list);
  const [isSent, setIsSent] = useState(false);
  const addToCartLocal = useCartStore((state) => state.addProduct);
  const incrementCartLocal = useCartStore((state) => state.increment);
  const decrementCartLocal = useCartStore((state) => state.decrement);
  const clearCartLocal = useCartStore((state) => state.clear);
  const updateCartLocal = useCartStore((state) => state.updateList);
  const deleteCartLocal = useCartStore((state) => state.delete);
  const country = useAddressStore((state) => state.country);
  const city = useAddressStore((state) => state.city);
  const router = useRouter();
  const { mutate: insertProductToServerCart, isLoading: isInserting } = useMutation({
    mutationFn: (data: InsertCartPayload) => cartService.insert(data),
    onError: (err: NetworkError) => error(err.message),
    onSuccess: (res) => {
      queryClient.setQueryData<DefaultResponse<Cart> | undefined>(["cart"], () => res);
    },
  });
  const { mutate: deleteProductsFromServerCart, isLoading: isDeleting } = useMutation({
    mutationFn: (data: Record<string, number>) => cartService.delete(data),
    onSuccess: onCounterClick,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const prevCart = queryClient.getQueryData<DefaultResponse<Cart>>(["cart"]);

      queryClient.setQueryData<DefaultResponse<Cart> | undefined>(["cart"], (old) => {
        if (!old) {
          return prevCart;
        }
        return {
          ...old,
          data: {
            ...old.data,
            user_carts: old.data.user_carts.map((userCart) => ({
              ...userCart,
              cartDetails: userCart.cartDetails.map((detial) => ({
                ...detial,
                cartDetailProducts: detial.cartDetailProducts.filter(
                  (product) => product.id !== cartDetailId
                ),
              })),
            })),
          },
        };
      });
      return { prevCart };
    },
    onError: (err: NetworkError, newTodo, context) => {
      queryClient.setQueryData(["cart"], context?.prevCart);
      error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"], exact: false });
    },
  });
  const currency = useSettingsStore((state) => state.selectedCurrency);
  const stockInLocalCart = localCartList?.find(
    (localCartProduct) => localCartProduct.stockId === stockId
  );
  const debouncedQuantity = useDebounce(stockInLocalCart?.quantity);

  const handleIncrement = useCallback(
    (quantity = 1) => {
      if (stockId) {
        if (
          stockInLocalCart &&
          stockInLocalCart.quantity < maxQty &&
          stockInLocalCart.quantity < productQty
        ) {
          if (user) {
            setIsSent(true);
          }
          incrementCartLocal(stockId, quantity);
        } else {
          error(`${t("you.cannot.add.more.than")} ${maxQty} ${t("products")}`);
        }
      }
    },
    [stockId, stockInLocalCart?.quantity, incrementCartLocal, maxQty, productQty]
  );

  const handleAddToCart = useCallback(() => {
    if (stockId) {
      if (stockInLocalCart) {
        handleIncrement();
        return;
      }
      if (user) {
        setIsSent(true);
      }

      addToCartLocal(stockId, minQty, image);
    }
  }, [stockId, stockInLocalCart]);

  const handleDelete = useCallback(async () => {
    if (stockId) {
      deleteCartLocal(stockId);

      if (cartDetailId && user) {
        deleteProductsFromServerCart({ "ids[0]": cartDetailId });
      }
    }
  }, []);

  const handleDecrement = useCallback(() => {
    if (stockId) {
      if (stockInLocalCart && stockInLocalCart.quantity > minQty) {
        if (user) {
          setIsSent(true);
        }
        decrementCartLocal(stockId);
        return;
      }
      handleDelete();
    }
  }, [stockId, stockInLocalCart]);
  const handleClearCart = useCallback(() => {
    clearCartLocal();
  }, []);

  const handleUpdateCart = useCallback((products: { stockId: number; quantity: number }[]) => {
    updateCartLocal(products);
  }, []);

  const handleBuyNow = useCallback(
    (callback: () => void) => {
      if (currency && country && stockId) {
        const body: InsertCartPayload = {
          currency_id: currency.id,
          rate: currency.rate,
          products: [{ stock_id: stockId, quantity: minQty }],
          region_id: country?.region_id,
          country_id: country?.id,
          city_id: city?.id,
        };
        if (image) {
          body.products[0].images = [image];
        }
        if (!user) {
          addToCartLocal(stockId, minQty);
          router.push("/cart");
          return;
        }

        insertProductToServerCart(body, {
          onSuccess: async (res) => {
            addToCartLocal(stockId, minQty);
            callback();
            queryClient.setQueryData<DefaultResponse<Cart> | undefined>(["cart"], () => res);
          },
        });
      }
    },
    [stockId]
  );

  useEffect(() => {
    if (debouncedQuantity && stockInLocalCart && currency && isSent && country) {
      const body: InsertCartPayload = {
        currency_id: currency.id,
        rate: currency.rate,
        products: [{ stock_id: stockInLocalCart.stockId, quantity: debouncedQuantity }],
        region_id: country?.region_id,
        country_id: country?.id,
        city_id: city?.id,
      };
      if (image) {
        body.products[0].images = [image];
      }
      insertProductToServerCart(body, {
        onSuccess: async () => {
          if (onCounterClick) {
            onCounterClick();
          }
        },
      });
    }
  }, [debouncedQuantity, currency?.id, currency?.rate, country?.id]);

  return {
    handleAddToCart,
    handleDecrement,
    handleIncrement,
    handleClearCart,
    handleUpdateCart,
    handleDelete,
    cartQuantity: stockInLocalCart?.quantity,
    isCounterLoading: isInserting || isDeleting,
    handleBuyNow,
  };
};
