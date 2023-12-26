"use client";

import { Input } from "@/components/input";
import { useTranslation } from "react-i18next";
import CouponIcon from "@/assets/icons/coupon";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hook/use-debounce";
import { useMutation } from "@tanstack/react-query";
import { orderService } from "@/services/order";
import CrossIcon from "@/assets/icons/cross";
import DoubleCheck from "@/assets/icons/double-check";
import { Coupon } from "@/types/product";

interface CouponCheckProps {
  onCouponCheckSuccess: (coupon: Coupon) => void;
}

export const CouponCheck = ({ onCouponCheckSuccess }: CouponCheckProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value);
  const {
    mutate: check,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: (body: string) => orderService.checkCoupon({ coupon: body }),
    onSuccess: (res) => {
      onCouponCheckSuccess(res.data);
    },
  });
  useEffect(() => {
    if (debouncedValue.length > 0) {
      check(debouncedValue);
    }
  }, [debouncedValue]);
  let icon = null;
  if (value.length < 1) {
    icon = null;
  } else if (isError) {
    icon = (
      <span className="text-red">
        <CrossIcon />
      </span>
    );
  } else if (isSuccess) {
    icon = (
      <span className="text-green">
        <DoubleCheck />
      </span>
    );
  }
  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      leftIcon={<CouponIcon />}
      fullWidth
      rightIcon={icon}
      label={t("coupon")}
    />
  );
};
