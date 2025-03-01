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

  const [gettingCheckoutPage, _setGettingCheckoutPage] = useState<boolean>(false);

  const { fn: getCart } = useMutation({
    url: "/api/cart/getCart",
    cache: "no-store",
    method: "POST"
  });

  const { fn: createPaymentIntent, loading: createPaymentLoading } = useMutation({
    url: "/api/checkout/createPaymentIntent",
    method: "POST"
  });

  const { fn: updatePaymentIntent, loading: updatePaymentLoading } = useMutation({
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

  const { fn: writeCheckoutSecretToUser } = useMutation({
    url: "/api/checkout/writeCheckoutSecretToUser",
    method: "POST"
  });

  const { fn: getCheckoutSecretFromUser } = useMutation({
    url: "/api/checkout/getCheckoutSecretFromUser",
    method: "GET"
  });

  const { fn: getCustomerId } = useMutation({
    url: "/api/user/getCustomerId",
    method: "GET"
  });

  const { fn: clearSessionCart } = useMutation({
    url: "/api/cart/clearSessionCart",
    method: "POST"
  });

  const createPaymentIntentAndSetOptions = async () => {
    //If saved options and the cart has not been updated since the saved options were created, return
    if (
      //If there are saved options
      localStorage.getItem("checkoutOptions") &&
      //And the cart has not been updated since the saved options were created
      JSON.stringify(JSON.parse(localStorage.getItem("checkoutOptions")!).cart) == JSON.stringify(cart) &&
      //And there is a client secret
      JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions.clientSecret
    ) {
      //Check if the use is logged in
      const userLoggedIn = await checkLoggedIn();
      if (userLoggedIn.loggedIn) {
        //If the user is logged in, check if the user has a checkout secret
        const loggedInUserCheckoutSecret = await getCheckoutSecretFromUser();
        if (loggedInUserCheckoutSecret && loggedInUserCheckoutSecret.id != null) {
          //If they do, return, no updates needed, local and saved client secret found
          return;
        }

        //If the user is logged in, but does not have a checkout secret, write the client secret to the user
        const locallySavedClientSecret = JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions
          .clientSecret;
        await writeCheckoutSecretToUser({
          checkoutClientSecret: locallySavedClientSecret
        });
      }
      //No need to write a new client secret, return
      return;
    }

    //Calculate the cart total
    let cartTotal = 0;
    for (let i = 0; i < cart.length; i++) {
      //Disgusting parsing because the sale price and price are stored as Decimal128s and outputted as strings
      cartTotal += cart[i].salePrice
        ? Number.parseFloat(cart[i].salePrice.substring(1)) * Number.parseInt(cart[i].quantity)
        : Number.parseFloat(cart[i].price.substring(1)) * Number.parseInt(cart[i].quantity);
    }
    cartTotal = Number.parseInt((cartTotal * 100).toFixed(0));

    //Create or update the payment intent
    let client_secret;

    //Get the cart with user info
    const cartWithUserInfo = await getCart({ populateUser: true });

    const { id: stripeCustomerId } = await getCustomerId();

    try {
      if (
        localStorage.getItem("checkoutOptions") &&
        JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions.clientSecret
      ) {
        const checkoutOptions = JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions;

        const updatedPaymentIntent = await updatePaymentIntent({
          paymentIntentId: checkoutOptions.clientSecret.split("_secret_")[0],
          newTotal: cartTotal,
          cart: cartWithUserInfo,
          customerId: stripeCustomerId || null
        });

        client_secret = updatedPaymentIntent.paymentIntent.client_secret;
      } else {
        const userLoggedIn = await checkLoggedIn();
        if (userLoggedIn) {
          const userCartId = await getCheckoutSecretFromUser();
          if (userCartId && userCartId.id) {
            const updatedPaymentIntent = await updatePaymentIntent({
              paymentIntentId: userCartId.id.split("_secret_")[0],
              newTotal: cartTotal,
              cart: cartWithUserInfo,
              customerId: stripeCustomerId || null
            });

            client_secret = updatedPaymentIntent.paymentIntent.client_secret;
          } else {
            const newPaymentIntent = await createPaymentIntent({
              total: cartTotal,
              cart: cartWithUserInfo,
              customerId: stripeCustomerId || null
            });

            client_secret = newPaymentIntent.client_secret;
          }
        } else {
          const newPaymentIntent = await createPaymentIntent({
            total: cartTotal,
            cart: cartWithUserInfo,
            customerId: stripeCustomerId || null
          });

          client_secret = newPaymentIntent.client_secret;
        }
      }
    } catch (err) {
      // console.log(err);
      const newPaymentIntent = await createPaymentIntent({
        total: cartTotal,
        cart: cartWithUserInfo,
        customerId: stripeCustomerId || null
      });

      client_secret = newPaymentIntent.client_secret;
    }

    const userLoggedIn = await checkLoggedIn();
    if (userLoggedIn) {
      // console.log("writing client secret to user");
      await writeCheckoutSecretToUser({ checkoutClientSecret: client_secret });
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

    localStorage.setItem("checkoutOptions", JSON.stringify({ checkoutOptions, cart }));
  };

  useEffect(() => {
    if (cartUpdated) {
      setCartUpdated(false);
    }

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
            runningTotal += Number.parseFloat(item.item.salePrice.substring(1)) * item.quantity;
          } else {
            runningTotal += Number.parseFloat(item.item.price.substring(1)) * item.quantity;
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
    if (urlParams.get("payment_intent_client_secret") && localStorage.getItem("checkoutOptions")) {
      if (
        JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions.clientSecret ==
        urlParams.get("payment_intent_client_secret")
      ) {
        localStorage.removeItem("checkoutOptions");

        getCart().then(async res => {
          if (!(res instanceof Array) || res.length == 0) return;
          res.forEach(async item => {
            await removeItemFromCart({
              productToRemove: item.item._id,
              fullyRemove: true
            });
          });
          const userLoggedIn = await checkLoggedIn();
          if (userLoggedIn) {
            // console.log("writing client secret to user");
            await writeCheckoutSecretToUser({ checkoutClientSecret: null });
          } else {
            await clearSessionCart();
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
        <title>Artist Collective | Cart</title>
      </Helmet>
      <div className="absolute top-0 flex min-h-screen w-screen flex-row gap-3 bg-slate-600 px-5 pb-5 pt-[3.75rem] first-line:left-0">
        <div className="flex grow flex-col gap-3">
          {cart.map((item, index) => {
            return <CartItem item={item} key={index} setCartUpdatedState={setCartUpdated} quantity={item.quantity} />;
          })}
        </div>
        <div className="flex min-h-[calc(100vh-7.5rem)] min-w-[200px] max-w-[20vw] grow flex-col gap-3 rounded-md bg-zinc-800 bg-opacity-60 p-5 text-white">
          <h1>Subtotal: {cartPrice ? cartPrice : "$0.00"}</h1>
          <button
            disabled={
              gettingCheckoutPage ||
              createPaymentLoading ||
              cartPrice == "$0.00" ||
              cartPrice == 0 ||
              updatePaymentLoading
            }
            className="mt-5 w-[70%] self-center justify-self-center rounded-full bg-zinc-900 py-2 transition-all duration-200 ease-in-out hover:bg-zinc-500 active:bg-zinc-600 disabled:bg-red-400 disabled:text-zinc-300"
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
