"use client";

import React, { useState, useTransition } from "react";
import { BackButton } from "@/app/(store)/components/back-button";
import { useServerCart } from "@/hook/use-server-cart";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/button";
import { cartService } from "@/services/cart";
import useSettingsStore from "@/global-store/settings";
import { Price } from "@/components/price";
import dynamic from "next/dynamic";
import useCartStore from "@/global-store/cart";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CartCalculateBody } from "@/types/cart";
import { Modal } from "@/components/modal";
import { LoadingCard } from "@/components/loading";
import { CartTotal } from "@/components/cart-total";
import LoadingIcon from "@/assets/icons/loading-icon";
import { useRouter } from "next/navigation";
import useAddressStore from "@/global-store/address";
import { Coupon } from "@/types/product";
import TrashIcon from "@/assets/icons/trash";
import { useModal } from "@/hook/use-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import NetworkError from "@/utils/network-error";
import { error } from "@/components/alert";
import { queryClient } from "@/lib/query-client";
import { Types } from "./components/checkout/checkout.reducer";
import CartProduct from "./components/cart-product";
import { CouponCheck } from "./components/coupon-check";
import { useCheckout } from "./components/checkout/checkout.context";

const Checkout = dynamic(() => import("./components/checkout"), {
  ssr: false,
  loading: () => <LoadingCard />,
});
const Empty = dynamic(() =>
  import("@/components/empty").then((component) => ({ default: component.Empty }))
);

const AuthorizedCart = () => {
  const router = useRouter();
  const { data, error: cartError, isFetching, isLoading } = useServerCart(true);
  const currency = useSettingsStore((state) => state.selectedCurrency);
  const country = useAddressStore((state) => state.country);
  const city = useAddressStore((state) => state.city);
  const clearCart = useCartStore((state) => state.clear);
  const { t } = useTranslation();
  const userCart = data?.data?.user_carts?.at(0);
  const [isPending, startTransition] = useTransition();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderCreateSuccess, setIsOrderCreateSuccess] = useState(false);
  const { dispatch } = useCheckout();
  const [isClearModalOpen, openClearModal, closeClearModal] = useModal();
  const cartDetailsLength = userCart?.cartDetails.flatMap(
    (detail) => detail.cartDetailProducts
  ).length;
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  const isEveryItemDigital = userCart?.cartDetails
    .flatMap((detail) => detail.cartDetailProducts)
    .every((product) => product.stock.product.digital);

  const {
    data: cartTotal,
    isFetching: isCalculating,
    isError,
  } = useQuery({
    queryKey: ["calculate", currency?.id, "delivery", userCart?.cartDetails, coupon?.name],
    queryFn: () => {
      const body: CartCalculateBody = {
        currency_id: currency?.id,
        type: isEveryItemDigital ? "digital" : "delivery",
        country_id: country?.id,
        city_id: city?.id,
      };
      if (coupon) {
        body.coupon = coupon.name;
      }
      return cartService.calculate(data?.data?.id, body);
    },
    enabled: !!currency && !!userCart,
    staleTime: Infinity,
    keepPreviousData: true,
    retry: false,
  });

  const { mutate: clearAll, isLoading: isClearing } = useMutation({
    mutationFn: () => cartService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"], { exact: false });
    },
    onSettled: () => {
      closeClearModal();
    },
    onError: (err: NetworkError) => {
      error(err.message);
    },
  });

  const handleClearCart = () => {
    clearAll();
  };

  const handleOrderCreateSuccess = (orderId: number) => {
    setIsOrderCreateSuccess(true);
    setIsCheckoutModalOpen(false);
    clearCart();
    router.push(`/orders/${orderId}`, { scroll: false });
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    dispatch({ type: Types.ClearState, payload: { all: false } });
  };

  if (isOrderCreateSuccess) {
    return (
      <section className="xl:container px-2 md:px-4">
        <BackButton title="order.detail" />
        <div className="flex items-center justify-center flex-col my-20">
          <Image src="/img/order-success.png" alt="empty_cart" width={400} height={400} />
          <strong className="text-xl font-bold">{t("congrats")}</strong>
          <span className="text-lg font-medium text-center ">{t("order.success.message")}</span>
        </div>
      </section>
    );
  }
  if (isLoading) {
    return (
      <section className="xl:container px-2 md:px-4">
        <div className="grid grid-cols-7">
          <div className="flex flex-col gap-7 col-span-5">
            <div className="flex gap-7 animate-pulse">
              <div className="relative overflow-hidden lg:h-[320px] md:h-56 h-40 rounded-3xl aspect-[250/320] bg-gray-300" />
              <div className="flex-1 my-5">
                <div className="h-[22px] rounded-full w-full bg-gray-300 line-clamp-1" />
                <div className="h-4 mt-5 rounded-full bg-gray-300 w-4/5" />
                <div className="h-4 mt-4 rounded-full bg-gray-300 w-3/5" />
              </div>
            </div>
            <div className="flex gap-7 animate-pulse">
              <div className="relative overflow-hidden lg:h-[320px] md:h-56 h-40 rounded-3xl aspect-[250/320] bg-gray-300" />
              <div className="flex-1 my-5">
                <div className="h-[22px] rounded-full w-full bg-gray-300 line-clamp-1" />
                <div className="h-4 mt-5 rounded-full bg-gray-300 w-4/5" />
                <div className="h-4 mt-4 rounded-full bg-gray-300 w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  if ((!userCart && !cartDetailsLength) || cartError || cartDetailsLength === 0) {
    return (
      <section className="xl:container px-2 md:px-4">
        <BackButton title="order.detail" />
        <Empty animated={false} text="your.cart.is.empty" />
      </section>
    );
  }
  return (
    <section className="xl:container px-2 md:px-4 mb-4">
      <div className="flex items-center justify-between">
        <BackButton title="order.detail" />
        <button onClick={openClearModal} className="flex items-center gap-2.5 text-red-600">
          <TrashIcon />
          {t("clear.all")}
        </button>
      </div>
      <div className="grid grid-cols-7 mt-7 gap-7 relative pb-24">
        {isFetching && (
          <div className="absolute left-0 w-full h-full min-h-60 bg-white dark:bg-dark dark:bg-opacity-10 bg-opacity-30 flex items-center justify-center z-10">
            <LoadingIcon size={80} />
          </div>
        )}
        <div className="flex flex-col lg:col-span-5 col-span-7 gap-7 ">
          {userCart?.cartDetails
            .flatMap((detail) => detail.cartDetailProducts)
            .map((product) => (
              <CartProduct key={product.id} data={product} isCalculating={isCalculating} />
            ))}
        </div>
        <div className="lg:col-span-2 col-span-7">
          <div className="sticky top-2">
            <CouponCheck onCouponCheckSuccess={(value) => setCoupon(value)} />
            <CartTotal totals={cartTotal?.data} />
            <Button
              loading={isPending || isCalculating}
              fullWidth
              disabled={isError}
              onClick={() => startTransition(() => setIsCheckoutModalOpen(true))}
            >
              {t("go.to.checkout")}
              {" - "}
              <Price number={cartTotal?.data?.total_price} />
            </Button>
          </div>
        </div>
      </div>
      <Modal withCloseButton onClose={handleCloseCheckoutModal} isOpen={isCheckoutModalOpen}>
        <Checkout
          everyItemDigital={isEveryItemDigital}
          coupon={coupon}
          onOrderCreateSuccess={handleOrderCreateSuccess}
        />
      </Modal>
      <ConfirmModal
        text="are.you.sure.want.to.clear.all.items.in.the.cart"
        onConfirm={handleClearCart}
        onCancel={closeClearModal}
        isOpen={isClearModalOpen}
        loading={isClearing}
      />
    </section>
  );
};

export default AuthorizedCart;
