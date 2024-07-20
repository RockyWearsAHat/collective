import { FC, useContext, useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useMutation } from "../../hooks/useMutation";
import { ObjectId } from "mongoose";
import { ActiveContext } from "../../pages/contextProvider";
import { cartUpdatingDelay } from "../../server/serverConfig";

interface QuantitySelectorProps {
  productQuantity: number | null;
  setProductQuantity: (quantity: number) => void;
  wrapperClasses?: string;
  updateCart?: boolean | null;
  itemId?: ObjectId | null;
}

export const QuantitySelector: FC<QuantitySelectorProps> = ({
  productQuantity,
  setProductQuantity,
  wrapperClasses,
  updateCart = false,
  itemId = null
}) => {
  const [updatingCart, setUpdatingCart] = useState<boolean>(false);

  const { setActive } = useContext(ActiveContext);

  const { fn: updateQuantity } = useMutation({
    url: "/api/cart/updateQuantity",
    method: "POST",
    credentials: "same-origin"
  });

  const updatingCartDelay = cartUpdatingDelay;

  return (
    <div
      className={`relative flex w-[fit-content] items-center justify-around after:absolute after:left-0 after:top-[95%] after:h-[2px] after:w-full after:bg-black${" " + wrapperClasses}`}
    >
      <button
        disabled={updatingCart}
        onClick={async () => {
          if (productQuantity !== null && productQuantity > 1) {
            const newQuantity = productQuantity - 1;
            setProductQuantity(newQuantity);

            if (updateCart && itemId) {
              setUpdatingCart(true);
              await updateQuantity({
                productToUpdate: itemId,
                quantity: newQuantity
              });
              setActive("itemAddedToCart");
              setTimeout(() => {
                setUpdatingCart(false);
              }, updatingCartDelay);
            }
          }
        }}
      >
        <FiMinus />
      </button>
      <span
        id="quantityInput"
        className="mx-2 w-[fit-content] text-center"
        role="textbox"
        inputMode="numeric"
        contentEditable
        suppressContentEditableWarning
        onKeyDown={e => {
          console.log(e);
          if (e.code == "Enter") {
            e.preventDefault();
            (e.target as HTMLElement).blur();
          }
        }}
        onBlur={async e => {
          if (
            e.target.innerHTML == null ||
            e.target.innerHTML == "" ||
            Number.isNaN(parseInt(e.target.innerHTML))
          ) {
            setProductQuantity(1);
            e.target.blur();

            if (updateCart && itemId) {
              setUpdatingCart(true);
              await updateQuantity({
                productToUpdate: itemId,
                quantity: 1
              });
              setActive("itemAddedToCart");
              setTimeout(() => {
                setUpdatingCart(false);
              }, updatingCartDelay);
            }
          } else {
            e.target.blur();
            let parsed = parseInt(e.target.innerHTML);
            if (Number.isNaN(parsed) || parsed < 1) {
              parsed = 1;
              setProductQuantity(1);
            } else {
              setProductQuantity(parseInt(e.target.innerHTML));
            }

            if (updateCart && itemId) {
              setUpdatingCart(true);
              await updateQuantity({
                productToUpdate: itemId,
                quantity: parsed
              });
              setActive("itemAddedToCart");
              setTimeout(() => {
                setUpdatingCart(false);
              }, updatingCartDelay);
            }
          }
        }}
      >
        {productQuantity}
      </span>
      <button
        disabled={updatingCart}
        onClick={async () => {
          const newQuantity = productQuantity ? productQuantity + 1 : 1;
          setProductQuantity(newQuantity);

          if (updateCart && itemId) {
            setUpdatingCart(true);
            await updateQuantity({
              productToUpdate: itemId,
              quantity: newQuantity
            });
            setActive("itemAddedToCart");
            setTimeout(() => {
              setUpdatingCart(false);
            }, updatingCartDelay);
          }
        }}
      >
        <FiPlus />
      </button>
    </div>
  );
};
