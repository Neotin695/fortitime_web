"use client";

/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import MinusIcon from "@/assets/icons/minus";
import PlusIcon from "@/assets/icons/plus";
import TrashIcon from "@/assets/icons/trash";
import { Unit } from "@/types/product";
import { unitify } from "@/utils/unitify";
import clsx from "clsx";
import React from "react";

interface ProductCounterProps {
  onPlusClick: () => void;
  count?: number;
  onMinusClick: () => void;
  minQty?: number;
  unit?: Unit;
  interval?: number;
}

const ProductCounter = ({
  onMinusClick,
  onPlusClick,
  count,
  minQty = 1,
  unit,
  interval,
}: ProductCounterProps) => (
  <div
    className={clsx(
      "absolute bottom-4 right-4 z-[2]",
      !!count && count > 0 && "bottom-2.5 right-2.5"
    )}
  >
    <div
      className={clsx(
        "flex items-center gap-3 bg-dark bg-opacity-30 backdrop-blur-lg rounded-full",
        !!count && count > 0 && "p-1"
      )}
      onClick={(e) => e.preventDefault()}
    >
      {!!count && count > 0 && (
        <>
          <button
            onClick={onMinusClick}
            className=" w-10 h-10 inline-flex items-center justify-center bg-white bg-opacity-30 backdrop-blur-lg rounded-full hover:bg-opacity-10 active:scale-95 text-white disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-opacity-30"
            disabled={count <= minQty}
          >
            {count <= minQty ? <TrashIcon /> : <MinusIcon />}
          </button>
          <span className="text-base font-medium text-white">{unitify(count, interval, unit)}</span>
        </>
      )}
      <button
        onClick={onPlusClick}
        className={clsx(
          "w-10 h-10 inline-flex items-center justify-center rounded-full hover:bg-opacity-10 active:scale-95 text-white",
          !!count && count > 0 && "bg-white bg-opacity-30 backdrop-blur-lg"
        )}
      >
        <PlusIcon />
      </button>
    </div>
  </div>
);

export default ProductCounter;
