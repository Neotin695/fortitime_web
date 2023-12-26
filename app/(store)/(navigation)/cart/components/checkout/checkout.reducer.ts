import { DeliveryPoint, DeliveryPrice, Payment } from "@/types/global";
import { Address } from "@/types/address";

export type InitialStateType = {
  deliveryType: string;
  deliveryPoint?: DeliveryPoint;
  paymentMethod?: Payment;
  deliveryDate: Date;
  deliveryAddress?: Address;
  deliveryPrice?: DeliveryPrice;
  notes: Record<number, string | undefined>;
};
type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum Types {
  UpdateDeliveryType = "UPDATE_DELIVERY_TYPE",
  UpdateDeliveryPoint = "UPDATE_DELIVERY_POINT",
  UpdatePaymentMethod = "UPDATE_PAYMENT_METHOD",
  UpdateDeliverDate = "UPDATE_DELIVERY_DATE",
  UpdateDeliveryAddress = "UPDATE_DELIVERY_ADDRESS",
  ClearState = "CLEAR_STATE",
  UpdateProductNote = "UPDATE_PRODUCT_NOTE",
}

type CheckoutActionPayload = {
  [Types.UpdateDeliveryType]: {
    type: string;
  };
  [Types.UpdateDeliveryPoint]: {
    point: DeliveryPoint;
  };
  [Types.UpdatePaymentMethod]: {
    paymentMethod: Payment;
  };
  [Types.UpdateDeliverDate]: {
    date: Date;
  };
  [Types.UpdateDeliveryAddress]: {
    address: Address;
    deliveryPrice?: DeliveryPrice;
  };
  [Types.ClearState]: {
    all: boolean;
  };
  [Types.UpdateProductNote]: {
    stockId: number;
    note?: string;
  };
};

export type CheckoutActions =
  ActionMap<CheckoutActionPayload>[keyof ActionMap<CheckoutActionPayload>];

export const checkoutReducer = (state: InitialStateType, action: CheckoutActions) => {
  switch (action.type) {
    case Types.UpdateDeliveryType:
      return { ...state, deliveryType: action.payload.type };
    case Types.UpdateDeliveryPoint:
      return { ...state, deliveryPoint: action.payload.point };
    case Types.UpdatePaymentMethod:
      return { ...state, paymentMethod: action.payload.paymentMethod };
    case Types.UpdateDeliverDate:
      return { ...state, deliveryDate: action.payload.date };
    case Types.UpdateDeliveryAddress:
      return {
        ...state,
        deliveryAddress: action.payload.address,
        deliveryPrice: action.payload.deliveryPrice,
      };
    case Types.UpdateProductNote: {
      return {
        ...state,
        notes: { ...state.notes, [action.payload.stockId]: action.payload.note },
      };
    }
    case Types.ClearState:
      return {
        deliveryType: "delivery",
        deliveryPoint: undefined,
        deliveryPrice: undefined,
        deliveryAddress: undefined,
        paymentMethod: undefined,
        deliveryDate: new Date(Date.now()),
        notes: action.payload.all ? {} : state.notes,
      };
    default:
      return state;
  }
};
