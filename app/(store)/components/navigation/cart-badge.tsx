export const CartBadge = ({ quantity }: { quantity?: number }) => (
  <div className="absolute -right-2 -top-2 flex items-center justify-center px-1.5 bg-primary rounded-3xl">
    <span className="text-sm">{quantity && quantity > 99 ? `99+` : quantity}</span>
  </div>
);
