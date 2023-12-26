import React from "react";
import { ProductCardUi1Loading } from "@/components/product-card/product-card-ui-1";

const SingleShopLoading = () => (
  <main className="xl:container px-2 md:px-4 animate-pulse">
    <div className="relative h-[350px] rounded-3xl overflow-hidden bg-gray-300" />
    <div className="h-6 rounded-full w-[25%] mt-7 bg-gray-300" />
    <div className="grid grid-cols-6 gap-7 mt-2">
      {Array.from(Array(6).keys()).map((item) => (
        <ProductCardUi1Loading key={item} />
      ))}
    </div>
  </main>
);

export default SingleShopLoading;
