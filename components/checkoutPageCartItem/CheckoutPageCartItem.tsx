import { FC, Key, ReactNode } from "react";
import { IItem } from "../../db/models/item";

interface CheckoutPageCartItemProps {
  key?: Key;
  item: IItem;
  quantity?: number;
}

export const CheckoutPageCartItem: FC<CheckoutPageCartItemProps> = ({ item, quantity }): ReactNode => {
  return (
    <div className="relative mb-4 flex h-auto items-center overflow-x-hidden bg-[#30313D] text-white">
      <div className="flex h-[80px] w-[50px] items-center justify-center bg-[#21222a] px-4">
        <h1 className="text-white">{quantity}x</h1>
      </div>
      <img
        src={item.imageLinks && item.imageLinks.length > 0 ? item.imageLinks[0] : ""}
        className="aspect-square size-[80px] object-cover"
      />
      <div className="flex-shrink flex-grow overflow-hidden">
        <h1 className="truncate pl-2 pr-2">{item.name}</h1>
        <h1 className="pl-2">
          <span className={item.salePrice ? "line-through" : ""}>{item.price as String}</span>
          {item.salePrice && <span className="pl-2">{item.salePrice as String}</span>}
        </h1>
      </div>
    </div>
  );
};
