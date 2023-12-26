import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order";
import { useTranslation } from "react-i18next";
import { Price } from "@/components/price";
import dayjs from "dayjs";
import clsx from "clsx";
import React, { useState } from "react";
import { CartTotal } from "@/components/cart-total";
import CheckDoubleFillIcon from "remixicon-react/CheckDoubleFillIcon";
import RestaurantFillIcon from "remixicon-react/RestaurantFillIcon";
import RunFillIcon from "remixicon-react/RunFillIcon";
import FlagFillIcon from "remixicon-react/FlagFillIcon";
import CrossIcon from "@/assets/icons/cross";
import MapPinRangeLineIcon from "remixicon-react/MapPinRangeLineIcon";
import useSettingsStore from "@/global-store/settings";
import { Modal } from "@/components/modal";
import dynamic from "next/dynamic";
import { Button } from "@/components/button";
import { useModal } from "@/hook/use-modal";
import NetworkError from "@/utils/network-error";
import { error, success } from "@/components/alert";
import { ConfirmModal } from "@/components/confirm-modal";
import Image from "next/image";
import { IconButton } from "@/components/icon-button";
import PhoneFillIcon from "remixicon-react/PhoneFillIcon";
import Chat1FillIcon from "remixicon-react/Chat1FillIcon";
import { cartService } from "@/services/cart";
import { InsertCartPayload } from "@/types/cart";
import useAddressStore from "@/global-store/address";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import { LoadingCard } from "@/components/loading";
import { CheckoutProduct } from "../checkout-product";
import { ProfilePlaceholder } from "../profile-placeholder";

const OrderAddres = dynamic(() =>
  import("./order-address").then((component) => ({ default: component.OrderAddress }))
);
const OrderRefund = dynamic(() =>
  import("./order-refund").then((component) => ({ default: component.OrderRefund }))
);
const DeliverymanReview = dynamic(
  () =>
    import("./deliveryman-review").then((component) => ({ default: component.DeliverymanReview })),
  {
    loading: () => <LoadingCard />,
  }
);

const orderProgress: Record<string, { step: number; icon: React.ReactElement }> = {
  new: {
    step: 1,
    icon: <CheckDoubleFillIcon />,
  },
  accepted: {
    step: 1,
    icon: <CheckDoubleFillIcon />,
  },
  ready: {
    step: 2,
    icon: <RestaurantFillIcon />,
  },
  on_a_way: {
    step: 3,
    icon: <RunFillIcon />,
  },
  delivered: {
    step: 4,
    icon: <FlagFillIcon />,
  },
  canceled: {
    step: 0,
    icon: <CrossIcon />,
  },
};

const OrderDetail = ({ id, onRepeat }: { id?: number | null; onRepeat?: () => void }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const country = useAddressStore((state) => state.country);
  const city = useAddressStore((state) => state.city);
  const router = useRouter();
  const currency = useSettingsStore((state) => state.selectedCurrency);
  const [isAddressModalOpen, openAddressModal, closeAddressModal] = useModal();
  const [confirmModalOpen, openConfirmModal, closeConfirmModal] = useModal();
  const language = useSettingsStore((state) => state.selectedLanguage);
  const [isDownLoading, setIsDownLoading] = useState(false);
  const [reviewModalOpen, openReviewModal, closeReviewModal] = useModal();
  const { data, isRefetching, refetch } = useQuery(["order", id], () => orderService.get(id), {
    suspense: true,
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
  });
  const orderDetail = data?.data;
  const { mutate: insertProductToServerCart, isLoading: isInserting } = useMutation({
    mutationFn: (body: InsertCartPayload) => cartService.insert(body),
    onError: (err: NetworkError) => error(err.message),
  });
  const { mutate: cancelOrder, isLoading: isCanceling } = useMutation({
    mutationFn: () => orderService.cancel(data?.data.id),
    onError: (err: NetworkError) => error(err.message),
    onSuccess: () => {
      refetch();
      closeConfirmModal();
      queryClient.invalidateQueries(["activeOrders"]);
      queryClient.invalidateQueries(["orderHistory"]);
    },
  });

  const handleCancelOrder = () => {
    cancelOrder();
  };
  const canRefund = !data?.data.order_refunds?.some(
    (item) => item.status === "accepted" || item.status === "pending"
  );

  const handleRepeatOrder = () => {
    if (currency && country && city) {
      const products: { stock_id: number; quantity: number }[] = [];
      orderDetail?.details.forEach((detail) => {
        detail.products.forEach((product) => {
          if (!product.bonus) {
            products.push({
              stock_id: product.stock.id,
              quantity: product.quantity,
            });
          }
        });
      });
      insertProductToServerCart(
        {
          currency_id: currency.id,
          rate: currency.rate,
          products,
          region_id: country?.region_id,
          country_id: country?.id,
          city_id: city?.id,
        },
        {
          onSuccess: () => {
            success(t("successfully.added"));
            router.back();
            if (onRepeat) {
              onRepeat();
            }
          },
        }
      );
    }
  };

  const handleCloseReviewModal = () => {
    closeReviewModal();
  };

  const handleDownload = () => {
    setIsDownLoading(true);
    orderService
      .downloadInvoice(data?.data.id)
      .then(async (res) => {
        const stream = await res.blob();
        const blob = new Blob([stream], {
          type: "application/octet-stream",
        });
        const filename = "download.pdf";
        saveAs(blob, filename);
      })
      .catch(() => {
        error(t("cant.download.the.invoice"));
      })
      .finally(() => {
        setIsDownLoading(false);
      });
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2.5">
        <div className="text-xl font-bold">#{orderDetail?.id}</div>
        <div className="bg-primary rounded-full flex items-center">
          <span className="text-white text-xs px-2 py-0.5">{t(orderDetail?.status || "")}</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-[18px] bg-white bg-opacity-30 rounded-2xl mt-7 mb-2.5">
        <div className="text-sm font-semibold">
          <Price customCurrency={orderDetail?.currency} number={orderDetail?.total_price} />
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-field" />
        <span className="text-sm font-medium">{orderDetail?.delivery_type}</span>

        <div className="w-1 h-1 rounded-full bg-gray-field" />
        <span className="text-sm font-medium">
          {dayjs(orderDetail?.delivery_date).format("MMM DD, YYYY - HH:mm")}
        </span>
      </div>
      <div className="px-4 pt-[22px] pb-4 bg-white bg-opacity-30 rounded-2xl">
        <span className="text-base font-semibold">{t("process")}</span>
        <div className="bg-white dark:bg-dark rounded-2xl p-2.5 flex items-center gap-3">
          <div
            className={clsx(
              "flex items-center justify-center rounded-full drop-shadow-green text-white h-full aspect-square p-3",
              orderDetail?.status === "canceled" ? "bg-red" : "bg-green"
            )}
          >
            {orderDetail && orderProgress[orderDetail.status].icon}
          </div>
          <div className="flex flex-col flex-1 gap-2">
            <strong className="text-xs font-bold">
              {t(orderDetail?.status || "")} -{" "}
              {dayjs(orderDetail?.delivery_date).format("MMM DD, YYYY - HH:mm")}
            </strong>
            <div className="flex items-center justify-between gap-2">
              {Array.from(Array(4).keys()).map((progressItem) => (
                <div
                  key={progressItem}
                  className={clsx(
                    orderDetail &&
                      orderDetail.status !== "canceled" &&
                      orderProgress[orderDetail.status].step >= progressItem + 1
                      ? "bg-green"
                      : "bg-gray-progress",
                    orderDetail?.status === "canceled" && "bg-red",
                    "flex-1 rounded-full h-3"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {orderDetail?.deliveryman && (
        <div className=" mt-4">
          {data?.data.status === "delivered" && (
            <div className="flex justify-end">
              <button onClick={openReviewModal} className="text-blue-link text-sm my-1">
                {t("add.review")}
              </button>
            </div>
          )}
          <div className="p-2.5 bg-white bg-opacity-30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {orderDetail?.deliveryman.img ? (
                <Image
                  width={50}
                  height={50}
                  className="rounded-full aspect-square object-cover"
                  src={orderDetail?.deliveryman.img}
                  alt={orderDetail?.deliveryman?.firstname || "deliveryman"}
                />
              ) : (
                <ProfilePlaceholder size={50} name={orderDetail?.deliveryman?.firstname} />
              )}
              <div>
                <div className="text-lg font-semibold">
                  {orderDetail?.deliveryman.firstname} {orderDetail?.deliveryman.lastname}
                </div>
                <span className="text-gray-field">{t("driver")}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={`tel:${orderDetail?.deliveryman.phone}`}>
                <IconButton color="black" size="large" rounded>
                  <PhoneFillIcon />
                </IconButton>
              </a>
              <a href={`sms:${orderDetail?.deliveryman.phone}`}>
                <IconButton color="primary" size="large" rounded>
                  <Chat1FillIcon />
                </IconButton>
              </a>
            </div>
          </div>
        </div>
      )}
      {(!!orderDetail?.my_address || !!orderDetail?.delivery_point) && (
        <button
          onClick={() => openAddressModal()}
          className="px-2.5 py-4  bg-white bg-opacity-30 rounded-2xl flex items-center gap-2.5 my-4 w-full"
        >
          <div className="w-10 h-10 aspect-square text-white rounded-full bg-dark flex items-center justify-center">
            <MapPinRangeLineIcon />
          </div>
          <div className="text-start">
            <div className="text-sm font-semibold">
              {orderDetail?.my_address ? t("delivery.location") : t("delivery.point")}
            </div>
            <span className="text-xs line-clamp-1">
              {orderDetail?.my_address
                ? orderDetail.my_address.location?.address
                : orderDetail.delivery_point?.address?.[language?.locale || ""]}
            </span>
          </div>
        </button>
      )}
      <div className="flex items-center justify-between mt-10">
        <div className="text-base font-semibold">{t("your.order")}</div>
        <div className="flex items-center gap-2">
          {orderDetail?.status === "delivered" && canRefund && (
            <OrderRefund orderId={orderDetail?.id} />
          )}
          <button
            onClick={!isDownLoading ? handleDownload : undefined}
            className="inline-flex items-center gap-2.5 text-sm text-blue-link"
          >
            {isDownLoading ? t("downloading...") : t("download.invoice")}
          </button>
        </div>
      </div>
      <div className="my-5 flex flex-col gap-4 mb-3">
        {orderDetail?.details
          .flatMap((detail) => detail.products)
          .map((product) => (
            <CheckoutProduct data={product} key={product.id} />
          ))}
      </div>
      <span className="text-sm italic">{orderDetail?.note}</span>
      <CartTotal
        couponStyle={false}
        totals={{
          total_price: orderDetail?.total_price,
          price: orderDetail?.origin_price,
          total_shop_tax: orderDetail?.total_tax,
          total_discount: orderDetail?.total_discount,
          delivery_fee: orderDetail?.delivery_fee,
          service_fee: orderDetail?.service_fee,
          total_coupon_price: orderDetail?.coupon?.price,
        }}
      />
      {orderDetail?.status === "new" && (
        <Button
          className="mt-2"
          color="black"
          loading={isCanceling}
          disabled={isRefetching}
          onClick={openConfirmModal}
          fullWidth
        >
          {t("cancel")}
        </Button>
      )}
      {(orderDetail?.status === "delivered" || orderDetail?.status === "canceled") && (
        <div className="flex items-center mt-2 gap-2">
          <Button as="a" href={`tel:${orderDetail.user.phone}`} color="black" fullWidth>
            {t("support")}
          </Button>
          <Button onClick={handleRepeatOrder} loading={isInserting} fullWidth>
            {t("repeat.order")}
          </Button>
        </div>
      )}
      <ConfirmModal
        text="are.you.sure.want.to.cancel"
        onCancel={closeConfirmModal}
        onConfirm={handleCancelOrder}
        isOpen={confirmModalOpen}
        loading={isCanceling}
      />
      <Modal isOpen={isAddressModalOpen} withCloseButton onClose={closeAddressModal}>
        <div className="p-5">
          <div className=" mb-4 rtl:text-right">
            <span className="text-xl font-semibold">
              {orderDetail?.my_address ? t("delivery.location") : t("delivery.point")}
            </span>
          </div>
          <OrderAddres
            location={
              orderDetail?.my_address
                ? {
                    lat: Number(orderDetail.my_address.location?.latitude),
                    lng: Number(orderDetail.my_address.location?.longitude),
                  }
                : {
                    lat: Number(orderDetail?.delivery_point?.location.latitude),
                    lng: Number(orderDetail?.delivery_point?.location.longitude),
                  }
            }
          />
        </div>
      </Modal>
      <Modal isOpen={reviewModalOpen} withCloseButton onClose={handleCloseReviewModal}>
        <div className="md:px-5 py-5 px-2">
          <div className=" mb-4 rtl:text-right">
            <span className="text-xl font-semibold">{t("deliveryman.review")}</span>
          </div>
          {!!data?.data && (
            <DeliverymanReview onSuccess={handleCloseReviewModal} id={data?.data.id} />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
