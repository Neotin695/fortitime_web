import useCartStore from "@/global-store/cart";
import useAddressStore from "@/global-store/address";
import useSettingsStore from "@/global-store/settings";
import { useQuery } from "@tanstack/react-query";
import { cartService } from "@/services/cart";

export const useServerCart = (enabled = true, suspense = false) => {
  const updateLocalCart = useCartStore((state) => state.updateList);
  const language = useSettingsStore((state) => state.selectedLanguage);
  const country = useAddressStore((state) => state.country);
  const city = useAddressStore((state) => state.city);
  const params = {
    region_id: country?.region_id,
    country_id: country?.id,
    city_id: city?.id,
    lang: language?.locale,
  };
  return useQuery({
    queryKey: ["cart", params],
    queryFn: () => cartService.get(params),

    onSuccess: (res) => {
      const products = res.data?.user_carts?.[0]?.cartDetails
        .flatMap((details) => details.cartDetailProducts)
        .map((product) => ({ stockId: product.stock.id, quantity: product.quantity }));

      updateLocalCart(products || []);
    },

    onError: () => {
      updateLocalCart([]);
    },
    enabled: !!country && enabled,
    retry: false,
    suspense,
    refetchOnMount: "always",
  });
};
