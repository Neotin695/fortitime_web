import { Coupon } from "@/types/product";

export interface CheckoutScreenProps {
  onNext: () => void;
  isPageChanging: boolean;
  onOrderCreateSuccess?: (orderId: number) => void;
  onPrev: () => void;
  coupon?: Coupon | null;
  everyItemDigital?: boolean;
}
