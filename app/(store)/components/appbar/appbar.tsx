"use client";

import React from "react";
import { useScrollDirection } from "@/hook/use-scroll-direction";
import clsx from "clsx";

export const AppBar = ({ children }: { children: React.ReactNode }) => {
  const direction = useScrollDirection();
  return (
    <div
      className={clsx(
        "fixed z-[9]  left-1/2 -translate-x-1/2 w-full flex  justify-center transition-all items-center gap-2 max-w-max",
        direction === "down" ? "-bottom-full" : "bottom-8"
      )}
    >
      {children}
    </div>
  );
};
