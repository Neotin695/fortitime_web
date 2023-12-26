"use client";

import dynamic from "next/dynamic";
import useUserStore from "@/global-store/user";

const AuthorizedCart = dynamic(() => import("./authorized-cart"));
const UnAuthorizedCart = dynamic(() => import("./unauthorized-cart"));

const CartPage = () => {
  const user = useUserStore((state) => state.user);
  if (user) {
    return <AuthorizedCart />;
  }

  return <UnAuthorizedCart />;
};
export default CartPage;
