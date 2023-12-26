import React from "react";
import dynamic from "next/dynamic";
import { AppBar } from "../components/appbar";
import { Navigation } from "../components/navigation";

const CartIndicator = dynamic(() => import("../components/cart-indicator"), { ssr: false });
const LooksDrawer = dynamic(() => import("../components/looks-detail"), { ssr: false });

const NavigationLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="pb-4">
    {children}
    <AppBar>
      <Navigation />
      <CartIndicator />
    </AppBar>
    <LooksDrawer />
  </main>
);

export default NavigationLayout;
