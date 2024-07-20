import { FC, Key, ReactNode, useContext, useState } from "react";
import { IItem } from "../../db/models/item";
import { BsTrash3 } from "react-icons/bs";
import { useMutation } from "../../hooks/useMutation";
import { ActiveContext } from "../../pages/contextProvider";
import { QuantitySelector } from "../quantitySelector/QuantitySelector";
import { ObjectId } from "mongoose";

interface CartItemProps {
  key?: Key;
  item: IItem;
  cartUpdatedState?: any;
  quantity?: number;
}

export const CartItem: FC<CartItemProps> = ({
  item,
  cartUpdatedState,
  quantity
}): ReactNode => {
  const { fn: removeItemFromCart } = useMutation({
    url: "/api/cart/removeFromCart",
    method: "POST"
  });

  const { setActive } = useContext(ActiveContext);

  const [productQuantity, setProductQuantity] = useState<number>(
    quantity ? quantity : 1
  );

  return (
    <div className="flex h-[70px] w-[70vw] items-center rounded-sm bg-zinc-800 bg-opacity-60 px-5 py-5 text-white">
      <img
        src={item.imageLinks![0]}
        className="aspect-square h-[50px] w-[50px] object-cover"
      />
      <div>
        <h1 className="pl-5">{item.name}</h1>
        <h1 className="pl-5">
          <span className={item.salePrice ? "line-through" : ""}>
            {item.price as String}
          </span>
          {item.salePrice && (
            <span className="pl-2">{item.salePrice as String}</span>
          )}
        </h1>
      </div>
      <div className="ml-auto flex gap-5">
        <QuantitySelector
          wrapperClasses="after:bg-white"
          setProductQuantity={setProductQuantity}
          productQuantity={productQuantity}
          updateCart={true}
          itemId={item._id ? (item._id as ObjectId) : null}
        />
        <button
          className="ml-auto"
          onClick={() => {
            removeItemFromCart({
              productToRemove: item._id,
              fullyRemove: true
            }).then(() => {
              cartUpdatedState(true);
              setActive("itemAddedToCart");
            });
          }}
        >
          <BsTrash3 />
        </button>
      </div>
    </div>
  );
};
