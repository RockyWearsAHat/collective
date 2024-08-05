import { FC, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../components/checkoutForm/CheckoutForm";

if (!process.env.STRIPE_PUBLIC_KEY)
  throw new Error("No stripe public key found");
const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);

export const Checkout: FC = () => {
  const [options, _setOptions] = useState<any>(
    localStorage.getItem("checkoutOptions")
      ? JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions
      : null
  );

  return (
    <>
      <Helmet>
        <title>Artist Collective | Checkout</title>
      </Helmet>
      {options && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
};
