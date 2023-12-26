"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order";
import { activeOrderStatuses, finishedOrderStatuses } from "@/config/global";
import { extractDataFromPagination } from "@/utils/extract-data";
import { InfiniteLoader } from "@/components/infinite-loader";
import { Empty } from "@/components/empty";
import { useTranslation } from "react-i18next";
import { OrderCard } from "./components/order-card";

const Orders = () => {
  const { t } = useTranslation();
  const {
    data: activeOrders,
    hasNextPage: activeOrderHasNextPage,
    isFetchingNextPage: isActiveOrderFetchingNextPage,
    fetchNextPage: fetchNextActiveOrders,
  } = useInfiniteQuery(
    ["activeOrders"],
    ({ pageParam }) => orderService.getAll({ statuses: activeOrderStatuses, page: pageParam }),
    {
      suspense: true,
      getNextPageParam: (lastPage) => lastPage.links.next && lastPage.meta.current_page + 1,
      refetchOnWindowFocus: true,
    }
  );
  const {
    data: orderHistory,
    hasNextPage: orderHistoryHasNextPage,
    isFetchingNextPage: isOrderHistoryFetchingNextPage,
    fetchNextPage: fetchNextOrderHistories,
  } = useInfiniteQuery(
    ["orderHistory"],
    ({ pageParam }) => orderService.getAll({ statuses: finishedOrderStatuses, page: pageParam }),
    {
      suspense: true,
      getNextPageParam: (lastPage) => lastPage.links.next && lastPage.meta.current_page + 1,
      refetchOnWindowFocus: true,
    }
  );
  const activeOrderList = extractDataFromPagination(activeOrders?.pages);
  const orderHistoryList = extractDataFromPagination(orderHistory?.pages);
  return (
    <div className="flex flex-col gap-7 w-full">
      <div className="border border-gray-inputBorder rounded-2xl overflow-x-hidden max-h-screen overflow-y-auto relative">
        <div className="p-5 sticky top-0 bg-white dark:bg-darkBg z-[2]">
          <h6 className="text-lg font-semibold">{t("active.orders")}</h6>
        </div>
        <InfiniteLoader
          loadMore={fetchNextActiveOrders}
          hasMore={activeOrderHasNextPage}
          loading={isActiveOrderFetchingNextPage}
        >
          {activeOrderList && activeOrderList.length > 0 ? (
            activeOrderList?.map((order) => <OrderCard key={order.id} data={order} active />)
          ) : (
            <Empty text="no.active.orders" />
          )}
        </InfiniteLoader>
      </div>
      <div className="border border-gray-inputBorder rounded-2xl overflow-x-hidden max-h-screen overflow-y-auto relative">
        <div className="p-5 sticky top-0 bg-white dark:bg-darkBg z-[2]">
          <h6 className="text-lg font-semibold">{t("completed.orders")}</h6>
        </div>
        <InfiniteLoader
          loadMore={fetchNextOrderHistories}
          hasMore={orderHistoryHasNextPage}
          loading={isOrderHistoryFetchingNextPage}
        >
          {orderHistoryList && orderHistoryList.length > 0 ? (
            orderHistoryList?.map((order) => <OrderCard data={order} key={order.id} />)
          ) : (
            <Empty text="no.order.history" />
          )}
        </InfiniteLoader>
      </div>
    </div>
  );
};

export default Orders;
