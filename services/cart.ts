import fetcher from "@/lib/fetcher";
import { DefaultResponse, ParamsType } from "@/types/global";
import { Cart, CartCalculateBody, CartCalculateRes, InsertCartPayload } from "@/types/cart";
import { buildUrlQueryParams } from "@/utils/build-url-query-params";

export const cartService = {
  insert: async (data: InsertCartPayload) =>
    fetcher.post<DefaultResponse<Cart>>("v1/dashboard/user/cart/insert-product", {
      body: data,
    }),
  delete: async (data: Record<string, number>) =>
    fetcher(buildUrlQueryParams("v1/dashboard/user/cart/product/delete", data), {
      method: "DELETE",
    }),
  clearAll: async () => fetcher.delete("v1/dashboard/user/cart/my-delete"),
  calculate: async (id: number | undefined, data: CartCalculateBody) =>
    fetcher.post<DefaultResponse<CartCalculateRes>>(`v1/dashboard/user/cart/calculate/${id}`, {
      body: data,
    }),
  get: (params: ParamsType) =>
    fetcher<DefaultResponse<Cart>>(buildUrlQueryParams("v1/dashboard/user/cart", params)),
  restCalculate: async (params?: ParamsType) =>
    fetcher<DefaultResponse<CartCalculateRes>>(
      buildUrlQueryParams("v1/rest/order/products/calculate", params)
    ),
};
