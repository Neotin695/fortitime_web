import React from "react";
import { ProductCardUi1Loading } from "@/components/product-card/product-card-ui-1";

const DiscountPageLoading = () => (
  <div className="xl:container px-2 md:px-4 grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-7">
    {Array.from(Array(6).keys()).map((item) => (
      <ProductCardUi1Loading key={item} />
    ))}
  </div>
);

export default DiscountPageLoading;
