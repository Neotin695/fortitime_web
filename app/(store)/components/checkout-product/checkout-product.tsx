import Image from "next/image";
import { CartDetailProduct } from "@/types/cart";
import { Price } from "@/components/price";
import clsx from "clsx";
import Link from "next/link";
import { unitify } from "@/utils/unitify";

export const CheckoutProduct = ({
  data,
  noteMode,
}: {
  data: CartDetailProduct;
  noteMode?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <Image
      src={data.galleries?.[0]?.path || data.stock?.product?.img}
      alt={data.stock?.product?.translation?.title || "product"}
      width={76}
      height={76}
      className="object-contain rounded-2xl w-14 h-14"
    />
    <div>
      <Link className="text-sm font-medium" href={`/products/${data.stock.product.uuid}`}>
        {data.stock?.product?.translation?.title}
      </Link>
      <div className="flex items-center gap-2">
        <strong className={clsx(noteMode ? "text-base" : "text-sm", "font-bold")}>
          <Price number={data?.price || data?.total_price} />
        </strong>
        {!noteMode && (
          <>
            x
            <strong className="text-sm font-bold">
              {unitify(data.quantity, data.stock.product.interval)}
            </strong>
          </>
        )}
      </div>
    </div>
  </div>
);
