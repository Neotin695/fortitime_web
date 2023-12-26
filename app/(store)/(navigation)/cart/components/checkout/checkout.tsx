"use client";

import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import React, { useState, useTransition } from "react";
import { LoadingCard } from "@/components/loading";
import { Coupon } from "@/types/product";
import { CheckoutScreenProps } from "./types";
import { CheckoutProgress } from "./components/checkout-progress";

const screens: Record<string, React.ComponentType<CheckoutScreenProps>> = {
  shipping: dynamic(() => import("./shipping")),
  payment: dynamic(() => import("./payment"), {
    loading: () => <LoadingCard />,
  }),
  verify: dynamic(() => import("./verify"), {
    loading: () => <LoadingCard />,
  }),
};

interface CheckoutModalProps {
  onOrderCreateSuccess: (orderId: number) => void;
  coupon: Coupon | null;
  everyItemDigital?: boolean;
}

const Checkout = ({ onOrderCreateSuccess, coupon, everyItemDigital }: CheckoutModalProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(everyItemDigital ? 2 : 1);
  const CheckoutUi = screens[Object.keys(screens)[currentStep - 1]];
  const [isPageChanging, startTransition] = useTransition();

  const handleNext = () => {
    startTransition(() => setCurrentStep((oldStep) => oldStep + 1));
  };

  const handlePrev = () => {
    startTransition(() => setCurrentStep((oldStep) => oldStep - 1));
  };

  return (
    <div className="p-5">
      <h5 className="text-[22px] font-semibold">{t("checkout")}</h5>
      <div className="flex justify-center">
        <CheckoutProgress currentStep={currentStep} />
      </div>
      <CheckoutUi
        isPageChanging={isPageChanging}
        onOrderCreateSuccess={onOrderCreateSuccess}
        onNext={handleNext}
        onPrev={handlePrev}
        coupon={coupon}
        everyItemDigital={everyItemDigital}
      />
    </div>
  );
};

export default Checkout;
