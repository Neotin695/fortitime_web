"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/hook/use-cart";
import { Product, ProductExpandedGallery } from "@/types/product";
import { useParams, useSearchParams } from "next/navigation";

const variants = {
  "1": {
    card: dynamic(() => import("./product-card-ui-1")),
    loading: dynamic(() =>
      import("./product-card-ui-1").then((component) => ({
        default: component.ProductCardUi1Loading,
      }))
    ),
  },
  "2": {
    card: dynamic(() => import("./product-card-ui-2")),
    loading: dynamic(() =>
      import("./product-card-ui-2").then((res) => ({ default: res.ProductCardUi2Loading }))
    ),
  },
  "3": {
    card: dynamic(() => import("./product-card-ui-3")),
    loading: dynamic(() =>
      import("./product-card-ui-3").then((res) => ({ default: res.ProductCardUi3Loading }))
    ),
  },
  mini: {
    card: dynamic(() => import("./product-card-ui-mini")),
    loading: dynamic(() =>
      import("./product-card-ui-mini").then((res) => ({ default: res.ProductCardUiMiniLoading }))
    ),
  },
  "4": {
    card: dynamic(() => import("./product-card-ui-4")),
    loading: dynamic(() =>
      import("./product-card-ui-4").then((res) => ({ default: res.ProductCardUi4Loading }))
    ),
  },
  "5": {
    card: dynamic(() => import("./product-card-ui-5")),
    loading: dynamic(() =>
      import("./product-card-ui-5").then((res) => ({ default: res.ProductCardUi5Loading }))
    ),
  },
} as const;

interface ProductCardProps {
  variant?: string;
  data: Product;
  roundedColors?: boolean;
}

export const ProductCard = ({ data, variant = "1", roundedColors }: ProductCardProps) => {
  const ProductCardUi = variants[variant as keyof typeof variants].card;
  const defaultStock = data && data.stocks && data.stocks[0];
  const [selectedStock, setSelectedStock] = useState(defaultStock);
  const queryParams = useSearchParams();
  const params = useParams();
  const { handleAddToCart, handleDecrement, cartQuantity } = useCart({
    stockId: selectedStock?.id,
    minQty: data?.min_qty,
    maxQty: data?.max_qty,
    productQty: selectedStock?.quantity,
  });
  const stockGalleries: ProductExpandedGallery[] = [];
  data.stocks?.forEach((stock) => {
    if (stock.gallery) {
      stockGalleries.push({
        img: stock.gallery.path,
        stock,
        color: stock.extras.find((extra) => extra.group?.type === "color")?.value,
      });
    }
  });
  const defaultImage: ProductExpandedGallery[] = [
    {
      img: data.img,
      stock: defaultStock,
    },
  ];
  const gallery = defaultImage.concat(stockGalleries);
  const isSame = data.uuid === params.id;
  return (
    <ProductCardUi
      onDecrementProductCount={() => handleDecrement()}
      onIncrementProductCount={() => handleAddToCart()}
      cartQuantity={cartQuantity}
      data={data}
      isSame={isSame}
      params={queryParams.toString()}
      gallery={gallery}
      selectedStock={selectedStock}
      onColorClick={(stock) => setSelectedStock(stock)}
      roundedColors={roundedColors}
    />
  );
};

const ProductCardLoading = ({ variant = "1" }) => {
  const Ui = variants[variant as keyof typeof variants].loading;
  return <Ui />;
};
ProductCard.Loading = ProductCardLoading;
