import { FC, useEffect, useState, useContext } from "react";
import { useMutation } from "../../hooks/useMutation";
import { CartItem } from "../../components/cartItem/CartItem";
import { ActiveContext } from "../contextProvider";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

let runningTotal = 0;

export const Cart: FC = () => {
  const [cart, setCart] = useState<any[]>([]);

  const [cartUpdated, setCartUpdated] = useState<boolean>(false);

  const [cartPrice, setCartPrice] = useState<number | string>(0);

  const navigate = useNavigate();

  const { active, setActive } = useContext(ActiveContext);

  const urlParams = new URLSearchParams(window.location.search);

  const [gettingCheckoutPage, _setGettingCheckoutPage] =
    useState<boolean>(false);

  const { fn: getCart } = useMutation({
    url: "/api/cart/getCart",
    method: "GET"
  });

  const { fn: createPaymentIntent } = useMutation({
    url: "/api/checkout/createPaymentIntent",
    method: "POST"
  });

  const { fn: updatePaymentIntent } = useMutation({
    url: "/api/checkout/updatePaymentIntent",
    method: "POST"
  });

  const { fn: removeItemFromCart } = useMutation({
    url: "/api/cart/removeFromCart",
    method: "POST"
  });

  const { fn: checkLoggedIn } = useMutation({
    url: "/api/user/checkLoggedIn",
    method: "GET"
  });

  const { fn: writeCartIdToUser } = useMutation({
    url: "/api/checkout/writeCartIdToUser",
    method: "POST"
  });

  const { fn: getCartIdFromUser } = useMutation({
    url: "/api/checkout/getCartIdFromUser",
    method: "GET"
  });

  const createPaymentIntentAndSetOptions = async () => {
    //If saved options and the cart has not been updated since the saved options were created, return
    if (
      localStorage.getItem("checkoutOptions") &&
      JSON.stringify(
        JSON.parse(localStorage.getItem("checkoutOptions")!).cart
      ) == JSON.stringify(cart)
    ) {
      return;
    }

    //Calculate the cart total
    let cartTotal = 0;
    for (let i = 0; i < cart.length; i++) {
      cartTotal += cart[i].salePrice
        ? Number.parseFloat(cart[i].salePrice.substring(1)) *
          Number.parseInt(cart[i].quantity)
        : Number.parseFloat(cart[i].price.substring(1)) *
          Number.parseInt(cart[i].quantity);
    }
    cartTotal = cartTotal * 100;

    //Create or update the payment intent
    let client_secret;

    try {
      if (
        localStorage.getItem("checkoutOptions") &&
        JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions
          .clientSecret
      ) {
        console.log("updating payment intent");
        const checkoutOptions = JSON.parse(
          localStorage.getItem("checkoutOptions")!
        ).checkoutOptions;

        console.log(checkoutOptions);
        const updatedPaymentIntent = await updatePaymentIntent({
          paymentIntentId: checkoutOptions.clientSecret.split("_secret_")[0],
          newTotal: cartTotal
        });

        client_secret = updatedPaymentIntent.paymentIntent.client_secret;
      } else {
        console.log("creating payment intent");
        const userLoggedIn = await checkLoggedIn();
        console.log(userLoggedIn);
        if (userLoggedIn) {
          const userCartId = await getCartIdFromUser();
          console.log(userCartId.id);
          if (userCartId && userCartId.id) {
            client_secret = userCartId.id;
          } else {
            const newPaymentIntent = await createPaymentIntent({
              total: cartTotal
            });
            client_secret = newPaymentIntent.client_secret;
          }
        } else {
          const newPaymentIntent = await createPaymentIntent({
            total: cartTotal
          });
          client_secret = newPaymentIntent.client_secret;
        }
      }
    } catch (err) {
      console.log(err);
      const newPaymentIntent = await createPaymentIntent({ total: cartTotal });
      client_secret = newPaymentIntent.paymentIntent.client_secret;
    }

    console.log(client_secret);

    const userLoggedIn = await checkLoggedIn();
    if (userLoggedIn) {
      await writeCartIdToUser({ cartId: client_secret });
    }

    const checkoutOptions = {
      clientSecret: client_secret,
      // Fully customizable with appearance API.
      appearance: {
        theme: "night", // or 'night', or 'flat'
        variables: {
          colorText: "#ffffff",
          borderRadius: "0px" // Adjusts the border radius
        }
      }
    };

    localStorage.setItem(
      "checkoutOptions",
      JSON.stringify({ checkoutOptions, cart })
    );
  };

  useEffect(() => {
    setCartUpdated(false);
    getCart().then(res => {
      runningTotal = 0;
      if (!(res instanceof Array) || res.length == 0) {
        setCart([]);

        setCartPrice(`$${runningTotal.toFixed(2)}`);

        return;
      }

      let cartItems: any[] = [];
      if (res && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
          let item = res[i];
          if (item.item.salePrice) {
            runningTotal +=
              Number.parseFloat(item.item.salePrice.substring(1)) *
              item.quantity;
          } else {
            runningTotal +=
              Number.parseFloat(item.item.price.substring(1)) * item.quantity;
          }
          cartItems.push(item.item);
          cartItems[i].quantity = item.quantity;
        }

        setCart(cartItems);

        setCartPrice(`$${runningTotal.toFixed(2)}`);
      }
    });
  }, [cartUpdated, active]);

  useEffect(() => {
    console.log(
      urlParams.get("payment_intent_client_secret"),
      localStorage.getItem("checkoutOptions")
    );
    if (
      urlParams.get("payment_intent_client_secret") &&
      localStorage.getItem("checkoutOptions")
    ) {
      if (
        JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions
          .clientSecret == urlParams.get("payment_intent_client_secret")
      ) {
        console.log(
          "payment intent and query params secret match, clearing local storage"
        );
        localStorage.removeItem("checkoutOptions");

        getCart().then(async res => {
          for (let i = 0; i < res.length; i++) {
            await Promise.all(
              await removeItemFromCart({
                productToRemove: res[i].item._id,
                fullyRemove: true
              })
            );
          }
          const userLoggedIn = await checkLoggedIn();
          if (userLoggedIn) {
            await writeCartIdToUser({ cartId: null });
          }
          setActive("itemAddedToCart");
          navigate("/cart");
        });
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>The Artist Collective | Cart</title>
      </Helmet>
      <div className="absolute top-0 flex min-h-screen w-screen flex-row gap-3 bg-slate-600 px-5 pb-5 pt-[3.75rem] first-line:left-0">
        <div className="flex grow flex-col gap-3">
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
        <div className="flex min-h-[calc(100vh-7.5rem)] min-w-[200px] max-w-[20vw] grow flex-col gap-3 rounded-md bg-zinc-800 bg-opacity-60 p-5 text-white">
          <h1>Subtotal: {cartPrice}</h1>
          <button
            disabled={gettingCheckoutPage}
            className="mt-5 w-[70%] self-center justify-self-center rounded-full bg-zinc-900 py-2 transition-all duration-200 ease-in-out hover:bg-zinc-500 active:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-300"
            onClick={async () => {
              if (cartPrice == "$0.00" || cartPrice == 0) return;
              await createPaymentIntentAndSetOptions();
              window.location.href = "/checkout";
            }}
          >
            Place Order
          </button>
        </div>
      </div>
    </>
  );
};
