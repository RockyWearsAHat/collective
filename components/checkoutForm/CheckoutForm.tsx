import { FC, FormEvent, Key, useEffect, useRef, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from "@stripe/react-stripe-js";
import { useMutation } from "../../hooks/useMutation";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { CheckoutPageCartItem } from "../checkoutPageCartItem/CheckoutPageCartItem";

export const CheckoutForm: FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [_errorMessage, setErrorMessage] = useState<string | undefined | null>(
    null
  );

  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const [subtotal, setSubtotal] = useState<number | null>(null);
  const [tax, setTax] = useState<number | null>(null);
  const [shipping, setShipping] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [fees, setFees] = useState<number | null>(null);

  const [clientName, setClientName] = useState<string | null>(null);
  const [address, setAddress] = useState<any | null>(null);

  const [cart, setCart] = useState<any[]>([]);

  // const { fn: clearPaymentIntents } = useMutation({
  //   url: "/api/checkout/clearPaymentIntents",
  //   method: "GET"
  // });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    console.log(clientName, address);

    if (
      !stripe ||
      !elements ||
      !tax ||
      !shipping ||
      !total ||
      !clientName ||
      !address
    ) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: "/cart"
      }
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  const { fn: calculateTaxes } = useMutation({
    url: "/api/checkout/calculateTax",
    method: "POST"
  });

  const { fn: updatePaymentIntent } = useMutation({
    url: "/api/checkout/updatePaymentIntent",
    method: "POST"
  });

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const testingDivRef = useRef(null);
  const [formHeight, setFormHeight] = useState("0px");

  //Resize item display to size of form
  useEffect(() => {
    if (!containerRef.current || !formRef.current || !testingDivRef.current)
      return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.target === formRef.current) {
          setFormHeight(`${entry.contentRect.height}px`);
        }
      }
    });

    resizeObserver.observe(formRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  //Get the cart items to display
  const { fn: getCart } = useMutation({
    url: "/api/cart/getCart",
    method: "GET"
  });

  useEffect(() => {
    getCart().then(res => {
      if (!(res instanceof Array) || res.length == 0) {
        setCart([]);

        return;
      }

      let cartItems: any[] = [];
      if (res && res.length > 0) {
        for (let i = 0; i < res.length; i++) {
          let item = res[i];
          cartItems.push(item.item);
          cartItems[i].quantity = item.quantity;
        }

        setCart(cartItems);
      }
    });
  }, []);

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("checkoutOptions")!).cart) {
      const passedCart = JSON.parse(
        localStorage.getItem("checkoutOptions")!
      ).cart;

      //Calculate the cart total
      let cartTotal = 0;
      for (let i = 0; i < passedCart.length; i++) {
        cartTotal += passedCart[i].salePrice
          ? Number.parseFloat(passedCart[i].salePrice.substring(1)) *
            Number.parseInt(passedCart[i].quantity)
          : Number.parseFloat(passedCart[i].price.substring(1)) *
            Number.parseInt(passedCart[i].quantity);
      }
      cartTotal = cartTotal * 100;

      setSubtotal(cartTotal);
    }
  }, []);

  useEffect(() => {
    const paymentFormWrapper = document.getElementById("paymentFormWrapper");
    paymentFormWrapper?.classList.remove("overflow-y-hidden");
    setTimeout(() => {
      if (isAddressOpen) {
        paymentFormWrapper?.classList.add("overflow-y-hidden");
      }
    }, 300);
  }, [isAddressOpen]);

  return (
    <>
      <div className="absolute left-0 top-0 flex h-[100vh] w-[100vw] items-center justify-center overflow-hidden pt-12 text-white">
        <div
          className={`absolute left-0 top-0 h-[100vh] w-[100vw] scale-110 bg-[url('/checkoutBg.jpg')] ${/*bg-[#313237]*/ ""} bg-[center_-150rem] blur-sm`}
        ></div>
        <div className="relative h-auto w-[clamp(400px,_80vw,_100vw)] overflow-hidden">
          <div
            ref={containerRef}
            className="grid max-h-[80vh] w-[200%] grid-cols-2 grid-rows-1"
          >
            <div
              id="paymentFormWrapper"
              className={`flex w-[100%] gap-4 transition-all duration-300 ease-in-out ${isAddressOpen ? "translate-x-[calc(-100%-0.25rem)]" : ""}`}
            >
              <div
                ref={testingDivRef}
                className="m-auto w-1/3 min-w-[300px] overflow-y-auto"
                style={{ height: formHeight }}
              >
                {cart.map((item, index) => (
                  <CheckoutPageCartItem
                    item={item}
                    key={index as Key}
                    quantity={item.quantity}
                  />
                ))}
              </div>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="my-auto flex max-h-[80vh] flex-1 flex-col overflow-y-auto pr-4"
              >
                <PaymentElement />
                <button
                  type="button"
                  onClick={() => setIsAddressOpen(true)}
                  className="relative mb-4 mt-4 w-[100%] self-center rounded-md bg-[#30313D] p-4 px-8 text-white"
                >
                  Enter Shipping Information
                  <HiChevronRight className="absolute right-4 top-[50%] translate-y-[-50%] text-2xl" />
                </button>
                <div className="order-summary">
                  <h3>Order Summary</h3>
                  <p>
                    Subtotal:{" "}
                    {subtotal ? `$${(subtotal / 100).toFixed(2)}` : "N/A"}
                  </p>
                  <p>
                    Tax:{" "}
                    {tax
                      ? `$${(tax / 100).toFixed(2)}`
                      : "Enter Shipping Address to Calculate"}
                  </p>
                  <p>
                    Shipping + Fees:{" "}
                    {shipping || fees
                      ? `$${((shipping ? shipping + (fees ? fees : 0) : fees!) / 100).toFixed(2)}`
                      : "Enter Shipping Address to Calculate"}
                  </p>
                  <p>
                    <strong>
                      Total: {total ? `$${(total / 100).toFixed(2)}` : "N/A"}
                    </strong>
                  </p>
                </div>
                <button
                  disabled={!stripe}
                  className="mt-4 w-[100%] self-center rounded-md bg-[#30313D] p-4 px-8 text-white"
                >
                  Order
                </button>
              </form>
            </div>
            <div
              className={`m-auto h-auto w-[100%] p-2 transition-all duration-300 ease-in-out ${isAddressOpen ? "translate-x-[calc(-100%-0.25rem)]" : ""}`}
            >
              <AddressElement
                options={{
                  mode: "shipping",
                  autocomplete: {
                    mode: "google_maps_api",
                    apiKey: process.env.GOOGLE_MAPS_API_KEY!
                  }
                }}
              />
              <div className="flex w-[100%]">
                <button
                  onClick={async () => {
                    setIsAddressOpen(false);
                    if (!elements) {
                      return null;
                    }

                    const addressElement = elements.getElement(AddressElement);
                    let addressData;
                    if (addressElement) {
                      addressData = await addressElement.getValue();
                    }

                    if (
                      !addressData?.value.name ||
                      !addressData?.value.address.line1 ||
                      !addressData?.value.address.city ||
                      !addressData?.value.address.state ||
                      !addressData?.value.address.country ||
                      !addressData?.value.address.postal_code
                    ) {
                      return null;
                    }

                    setAddress(
                      addressData?.value.address
                        ? addressData?.value.address
                        : null
                    );
                    setClientName(
                      addressData?.value?.name ? addressData?.value?.name : null
                    );

                    console.log(addressData?.value);
                    const res = await calculateTaxes({
                      amount: subtotal,
                      addressValue: addressData?.value
                    });
                    const { amount_total, tax_amount_exclusive } = res.tax;

                    let shippingTotal = 500;
                    let feesTotal = 0;

                    if (amount_total && tax_amount_exclusive) {
                      setTax(tax_amount_exclusive);
                      setShipping(shippingTotal);
                      if (shippingTotal) {
                        feesTotal = Math.round(
                          (amount_total + shippingTotal) * 0.029 + 30
                        );
                        setFees(feesTotal);
                        setTotal(amount_total + shippingTotal + feesTotal);
                      } else {
                        feesTotal = Math.round(amount_total * 0.029 + 30);
                        setFees(feesTotal);
                        setTotal(amount_total + feesTotal);
                      }
                    }

                    const checkoutOptions = JSON.parse(
                      localStorage.getItem("checkoutOptions")!
                    ).checkoutOptions;

                    const paymentIntentId =
                      checkoutOptions.clientSecret.split("_")[0] +
                      "_" +
                      checkoutOptions.clientSecret.split("_")[1];

                    console.log(paymentIntentId);

                    const res2 = await updatePaymentIntent({
                      paymentIntentId,
                      newTotal: shippingTotal
                        ? amount_total + shippingTotal + feesTotal
                        : amount_total + feesTotal
                    });

                    console.log(res2);
                  }}
                  className="relative mx-auto mb-4 mt-4 w-full self-center justify-self-center rounded-md bg-[#30313D] p-4 px-8 text-white"
                >
                  <HiChevronLeft className="absolute left-4 top-[50%] translate-y-[-50%] text-2xl" />
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;
