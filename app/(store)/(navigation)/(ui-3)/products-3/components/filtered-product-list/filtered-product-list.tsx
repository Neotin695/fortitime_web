"use client";

import { ProductCard } from "@/components/product-card";
import useFilterStore from "@/global-store/filter";
import clsx from "clsx";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/services/product";
import { extractDataFromPagination } from "@/utils/extract-data";
import { InfiniteLoader } from "@/components/infinite-loader";
import { Button } from "@/components/button";
import FilterLineIcon from "remixicon-react/FilterLineIcon";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { Drawer } from "@/components/drawer";
import { useModal } from "@/hook/use-modal";
import useSettingsStore from "@/global-store/settings";
import useAddressStore from "@/global-store/address";

const listStyles = {
  "1": "lg:grid-cols-4 md:grid-cols-3 grid-cols-2",
  "2": "lg:grid-cols-2 grid-cols-1",
  "3": "grid-cols-1",
  "4": "lg:grid-cols-3 md:grid-cols-2 grid-cols-1",
};

const FilterList = dynamic(() =>
  import("../filters/filter-list").then((component) => ({ default: component.FilterList }))
);
const Empty = dynamic(() =>
  import("@/components/empty").then((component) => ({ default: component.Empty }))
);

const FilteredProductList = () => {
  const { t } = useTranslation();
  const [isFilterDrawerOpen, openFilterDrawer, closeFilterDrawer] = useModal();
  const searchParams = useSearchParams();
  const currency = useSettingsStore((state) => state.selectedCurrency);
  const language = useSettingsStore((state) => state.selectedLanguage);
  const settings = useSettingsStore((state) => state.settings);
  const country = useAddressStore((state) => state.country);
  const city = useAddressStore((state) => state.city);
  const params = {
    shop_ids: searchParams.getAll("shop_id"),
    category_ids: searchParams.getAll("categories"),
    brand_ids: searchParams.getAll("brands"),
    price_from: searchParams.get("priceFrom"),
    price_to: searchParams.get("priceTo"),
    column: searchParams.get("column"),
    sort: searchParams.get("sort"),
    extras: searchParams.getAll("extras"),
    has_discount: searchParams.get("has_discount"),
    currency_id: currency?.id,
    lang: language?.locale,
    banner_id: searchParams.get("bannerId"),
    country_id: country?.id,
    city_id: city?.id,
  };
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["products", params],
    queryFn: ({ pageParam }) => productService.getAll({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.links.next && lastPage.meta.current_page + 1,
  });
  const productList = extractDataFromPagination(data?.pages);

  const productVariant = useFilterStore((state) => state.productVariant);
  if (isLoading) {
    return (
      <div className="col-span-7">
        <div className={clsx("grid gap-7 ", listStyles[productVariant as keyof typeof listStyles])}>
          {Array.from(Array(10).keys()).map((product) => (
            <ProductCard.Loading variant={productVariant} key={product} />
          ))}
        </div>
      </div>
    );
  }
  if (productList && productList.length === 0) {
    return (
      <div className="col-span-7">
        <Empty text="no.products.found" />
      </div>
    );
  }
  return (
    <div className="col-span-7">
      <div className="xl:hidden mb-7 flex justify-end">
        <Button
          onClick={openFilterDrawer}
          size="xsmall"
          color="black"
          leftIcon={<FilterLineIcon />}
        >
          {t("filters")}
        </Button>
      </div>
      <InfiniteLoader loadMore={fetchNextPage} hasMore={hasNextPage} loading={isFetchingNextPage}>
        <div
          className={clsx(
            "grid lg:gap-7 gap-4 ",
            listStyles[productVariant as keyof typeof listStyles]
          )}
        >
          {productList?.map((product) => (
            <ProductCard
              roundedColors
              data={product}
              variant={settings?.ui_type === "3" && productVariant === "1" ? "5" : productVariant}
              key={product.id}
            />
          ))}
        </div>
      </InfiniteLoader>
      <Drawer open={isFilterDrawerOpen} onClose={closeFilterDrawer}>
        <FilterList onClose={closeFilterDrawer} />
      </Drawer>
    </div>
  );
};

export default FilteredProductList;
