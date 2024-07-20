import { FC, useEffect, useState } from "react";
import { useMutation } from "../../hooks/useMutation";
import { CartItem } from "../../components/cartItem/CartItem";

export const Cart: FC = () => {
  const [cart, setCart] = useState<any[]>([]);

  const [cartUpdated, setCartUpdated] = useState<boolean>(false);

  const { fn: getCart } = useMutation({
    url: "/api/cart/getCart",
    method: "GET"
  });

  useEffect(() => {
    setCartUpdated(false);
    getCart().then(res => {
      if (!(res instanceof Array) || res.length == 0) {
        setCart([]);
        return;
      }

      let cartItems: any[] = [];
      if (res && res.length > 0) {
        res.forEach((item, i) => {
          cartItems.push(item.item);
          cartItems[i].quantity = item.quantity;
        });

        setCart(cartItems);
      }
    });
  }, [10, cartUpdated]);

  return (
    <div className="absolute left-0 top-0 flex min-h-[100vh] w-[100vw] flex-col gap-3 bg-slate-600 pb-5 pl-5 pt-[3.75rem]">
      {cart.map((item, index) => {
        return (
          <CartItem
            item={item}
            key={index}
            cartUpdatedState={setCartUpdated}
            quantity={item.quantity}
          />
        );
      })}
    </div>
  );
};
