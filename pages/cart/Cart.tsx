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
    console.log("getting cart");
    setCartUpdated(false);
    getCart().then(res => {
      if (!(res instanceof Array) || res.length == 0) {
        setCart([]);
        return;
      }

      let cartItems: any[] = [];
      if (res && res.length > 0) {
        res.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            cartItems.push(item.item);
          }
        });

        setCart(cartItems);
      }
    });
  }, [10, cartUpdated]);

  return (
    <div className="absolute left-0 top-0 flex min-h-[100vh] w-[100vw] flex-col gap-3 bg-slate-600 pb-5 pl-5 pt-[3.75rem]">
      {cart.map((item, index) => {
        return (
          <CartItem item={item} key={index} cartUpdatedState={setCartUpdated} />
        );
      })}
    </div>
  );
};
