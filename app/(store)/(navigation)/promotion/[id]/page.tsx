import ProductList from "@/app/(store)/components/product-list";
import { adsService } from "@/services/ads";
import { cookies } from "next/headers";

const PromotionPage = async ({ params }: { params: { id: string } }) => {
  const lang = cookies().get("lang")?.value;
  const currencyId = cookies().get("currency_id")?.value;
  const ad = await adsService.get(
    params.id,
    { lang, currency_id: currencyId },
    { cache: "no-store" }
  );
  return (
    <div className="xl:container px-2 md:px-4">
      <ProductList
        title={ad.data.translation?.title}
        products={
          ad?.data?.shop_ads_packages
            ?.flatMap((pack) => pack?.shop_ads_products)
            .map((adProduct) => adProduct?.product) || []
        }
      />
    </div>
  );
};

export default PromotionPage;
