import { FC, Key, ReactNode, useContext } from "react";
import { IItem } from "../../db/models/item";
import { BsTrash3 } from "react-icons/bs";
import { useMutation } from "../../hooks/useMutation";
import { ActiveContext } from "../../pages/contextProvider";

interface CartItemProps {
  key?: Key;
  item: IItem;
  cartUpdatedState?: any;
}

export const CartItem: FC<CartItemProps> = ({
  item,
  cartUpdatedState
}): ReactNode => {
  const { fn: removeItemFromCart } = useMutation({
    url: "/api/cart/removeFromCart",
    method: "POST"
  });

  const { setActive } = useContext(ActiveContext);

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
      <button
        className="ml-auto"
        onClick={() => {
          removeItemFromCart({ productToRemove: item._id }).then(() => {
            cartUpdatedState(true);
            setActive("itemAddedToCart");
          });
        }}
      >
        <BsTrash3 />
      </button>
    </div>
  );
};
