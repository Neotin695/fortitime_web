import { Category } from "@/types/category";
import clsx from "clsx";
import Image from "next/image";
import React from "react";
import Link from "next/link";

const sizes = {
  small: "px-5 py-4 gap-1",
  large: "px-7 py-8 gap-4",
} as const;

const fontSizes = {
  small: "text-sm",
  large: "text-xl",
};

interface CategoryCardProps {
  data: Category;
  size: keyof typeof sizes;
}

export const CategoryCard = ({ size = "small", data }: CategoryCardProps) => (
  <Link href={`/products?categories=${data.id}`}>
    <div
      className={clsx(
        sizes[size],
        "flex flex-col rounded-2xl bg-gray-card dark:bg-gray-inputBorder"
      )}
    >
      <div className="relative aspect-square">
        <Image
          src={data.img || ""}
          alt={data.translation?.title || "category"}
          fill
          className="object-contain"
        />
      </div>
      <span className={clsx(fontSizes[size], "font-medium text-center line-clamp-1")}>
        {data.translation?.title}
      </span>
    </div>
  </Link>
);
