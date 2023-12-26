"use client";

import { ProductDetail } from "@/app/(store)/components/product-detail";
import { Modal } from "@/components/modal";
import React from "react";
import { productService } from "@/services/product";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { ProductDetailLoading } from "@/app/(store)/components/product-detail/product-detail-loading";
import useSettingsStore from "@/global-store/settings";

const ProductModal = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const pathname = usePathname();
  const language = useSettingsStore((state) => state.selectedLanguage);
  const currency = useSettingsStore((state) => state.selectedCurrency);
  const { data, isLoading } = useQuery(["product", params.id], () =>
    productService.get(params.id, { lang: language?.locale, currency_id: currency?.id })
  );

  if (!pathname.includes("/products/")) {
    return null;
  }

  return (
    <Modal fixedButton size="large" onClose={() => router.back()} isOpen withCloseButton>
      {isLoading ? <ProductDetailLoading /> : <ProductDetail data={data?.data} />}
    </Modal>
  );
};

export default ProductModal;
