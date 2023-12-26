"use client";

import React from "react";
import { WorkingDay } from "@/types/shop";
import dayjs from "dayjs";
import StarIcon from "@/assets/icons/star";

interface ShopWorkingDayProps {
  workindDays?: WorkingDay[];
  avgRating?: number;
}

export const ShopWorkingDay = ({ workindDays, avgRating }: ShopWorkingDayProps) => {
  const today = workindDays?.find(
    (workingDay) => workingDay.day === dayjs().format("dddd").toLocaleLowerCase()
  );
  return (
    <div className="flex items-center gap-3 py-2 px-4 rounded-full bg-white bg-opacity-20 backdrop-blur-lg">
      <span className="text-base font-medium text-white whitespace-nowrap">
        {today?.from} — {today?.to}
      </span>
      <div className="flex items-start gap-1">
        <StarIcon />
        <span className="text-xs text-white font-semibold">{avgRating || 0}</span>
      </div>
    </div>
  );
};
