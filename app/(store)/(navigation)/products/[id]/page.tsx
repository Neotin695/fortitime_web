import { ProductDetail } from "@/app/(store)/components/product-detail";
import fetcher from "@/lib/fetcher";
import { DefaultResponse } from "@/types/global";
import { ProductFull } from "@/types/product";
import { Metadata } from "next";
import React from "react";
import { cookies } from "next/headers";
import { buildUrlQueryParams } from "@/utils/build-url-query-params";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> => {
  const lang = cookies().get("lang")?.value;
  const currencyId = cookies().get("currency_id")?.value;
  const { data } = await fetcher<DefaultResponse<ProductFull>>(
    buildUrlQueryParams(`v1/rest/products/${params.id}`, { lang, currency_id: currencyId }),
    { redirectOnError: true }
  );
  return {
    title: data.translation?.title,
    description: data.translation?.description,
    keywords: data.keywords,
    openGraph: {
      images: {
        url: data.img,
      },
      title: data.translation?.title,
      description: data.translation?.description,
    },
    appLinks: {
      ios: {
        url: `https://uzmart.org/producuts/${data.uuid}`,
        app_store_id: "com.gshop",
      },
      android: {
        package: "com.gshop",
        app_name: "com.gshop",
      },
      web: {
        url: "https://uzmart.vercel.app/main",
        should_fallback: false,
      },
    },
  };
};

const ProductDetailPage = async ({ params }: { params: { id: string } }) => {
  const lang = cookies().get("lang")?.value;
  const currencyId = cookies().get("currency_id")?.value;
  const data = await fetcher<DefaultResponse<ProductFull>>(
    buildUrlQueryParams(`v1/rest/products/${params.id}`, { lang, currency_id: currencyId })
  );
  return <ProductDetail fullPage data={data?.data} />;
};

export default ProductDetailPage;
