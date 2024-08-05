import { FC, Key, ReactNode, useContext, useEffect, useState } from "react";
import { IItem } from "../../db/models/item";
import { BsCheck, BsTrash3 } from "react-icons/bs";
import { useMutation } from "../../hooks/useMutation";
import { ActiveContext } from "../../pages/contextProvider";
import { QuantitySelector } from "../quantitySelector/QuantitySelector";
import { ObjectId } from "mongoose";

interface CartItemProps {
  key?: Key;
  item: IItem;
  setCartUpdatedState?: any;
  quantity?: number;
}

export const CartItem: FC<CartItemProps> = ({
  item,
  setCartUpdatedState,
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

  const [confirmRemoveProduct, setConfirmRemoveProduct] =
    useState<boolean>(false);

  useEffect(() => {
    document.addEventListener("click", (e: Event) => {
      let target = e.target as HTMLElement;
      if (target.nodeName == "path") {
        target = target.parentElement as HTMLElement;
      }

      if (
        target.id == null ||
        (target.id != "trashBtn" && target.id != "confirmBtn")
      ) {
        setConfirmRemoveProduct(false);
      }
    });
  }, []);

  return (
    <div className="flex h-[100px] items-center rounded-md bg-zinc-800 bg-opacity-60 px-5 py-5 text-white">
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
          className="ml-auto flex h-[24px] w-[24px] items-center justify-center"
          onClick={async () => {
            if (confirmRemoveProduct) {
              await removeItemFromCart({
                productToRemove: item._id,
                fullyRemove: true
              });

              setActive("itemAddedToCart");
              setCartUpdatedState(true);
              setConfirmRemoveProduct(false);
            } else {
              setConfirmRemoveProduct(true);
            }
          }}
        >
          {!confirmRemoveProduct ? (
            <BsTrash3 id="trashBtn" />
          ) : (
            <BsCheck className="text-2xl" id="confirmBtn" />
          )}
        </button>
      </div>
    </div>
  );
};
