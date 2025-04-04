import { FC, FormEvent, Key, useEffect, useRef, useState } from "react";
import { useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js";
import { useMutation } from "../../hooks/useMutation";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { CheckoutPageCartItem } from "../checkoutPageCartItem/CheckoutPageCartItem";
import { useNavigate } from "react-router-dom";

const calculateStripeFee = (amount: number) => {
  return Math.ceil(amount * 0.03 + 30);
};

export const CheckoutForm: FC = () => {
  const successRedirect = window.location.protocol + "//" + window.location.host + "/cart";

  const stripe = useStripe();
  const elements = useElements();

  const navigate = useNavigate();

  const [_errorMessage, setErrorMessage] = useState<string | undefined | null>(null);

  const [isAddressOpen, setIsAddressOpen] = useState(false);

  const [subtotal, setSubtotal] = useState<number | null>(null);
  const [tax, setTax] = useState<number | null>(null);
  const [shipping, setShipping] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [fees, setFees] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);

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

    if (!stripe || !elements || !tax || !shipping || !total || !clientName || !address) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: successRedirect
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

  const { fn: getCustomerId } = useMutation({
    url: "/api/user/getCustomerId",
    method: "GET"
  });

  const containerRef = useRef(null);
  const formRef = useRef(null);
  const testingDivRef = useRef(null);
  const [formHeight, setFormHeight] = useState("0px");

  //Resize item display to size of form, ensure they are always the same height
  useEffect(() => {
    if (!containerRef.current || !formRef.current || !testingDivRef.current) return;

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

  //Set up the get cart function to get the user's cart
  const { fn: getCart } = useMutation({
    url: "/api/cart/getCart?populateItems=true",
    cache: "no-store",
    method: "GET"
  });

  //Get users cart on page load
  useEffect(() => {
    getCart().then(async res => {
      // console.log(res);
      //If the cart isn't an array or is empty, set the cart to an empty array and return
      if (!(res instanceof Array) || res.length == 0) {
        setCart([]);

        return;
      }

      //Temporary array to hold the cart items
      let cartItems: any[] = [];

      //This check should pass always because of the check above, but just in case
      if (res && res.length > 0) {
        //Run through the whole cart
        for (let i = 0; i < res.length; i++) {
          //Get each item
          let item = res[i];
          //Add item to cart under item key
          cartItems.push(item.item);

          //Add quantity to the item (mirror CartItem)
          cartItems[i].quantity = item.quantity;
        }

        // console.log("cartItems: ", cartItems);

        //Set the cart to the cart items
        setCart(cartItems);

        //Calculate the cart total, absolutely disgusting but prices are strings when sent back to the user, should make that an optional
        //function but that requires reworking alot of code and I'm lazy
        let cartTotal = 0;
        for (let i = 0; i < cartItems.length; i++) {
          cartTotal += cartItems[i].salePrice
            ? Number.parseFloat(cartItems[i].salePrice.substring(1)) * Number.parseInt(cartItems[i].quantity)
            : Number.parseFloat(cartItems[i].price.substring(1)) * Number.parseInt(cartItems[i].quantity);
        }
        //Convert to cents
        cartTotal = Number.parseInt((cartTotal * 100).toFixed(0));

        //Set the subtotal
        setSubtotal(cartTotal);
      }
    });
  }, []);

  useEffect(() => {
    const updatePaymentIntentOnTotalChange = async () => {
      const checkoutOptions = JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions;

      const paymentIntentId =
        checkoutOptions.clientSecret.split("_")[0] + "_" + checkoutOptions.clientSecret.split("_")[1];

      const { id: stripeCustomerId } = await getCustomerId();

      console.log(
        `Payment for: \n${cart.map((item: any) => `${item.name} x${item.quantity} | ${item.salePrice ? item.salePrice : item.price} per | $${item.salePrice ? (Number.parseFloat(item.salePrice.substring(1)) * item.quantity).toFixed(2) : (Number.parseFloat(item.price.substring(1)) * item.quantity).toFixed(2)} total | https://artistcollective.store/products/${item.name.toLowerCase().replaceAll(" ", "_")}/${item._id}\n`)}`
      );

      const res = await updatePaymentIntent({
        paymentIntentId,
        newTotal: total,
        customerId: stripeCustomerId || null,
        customerName: customerName,
        newDescription: `Payment for: \n\n${cart.map((item: any) => `${item.name} x${item.quantity} | ${item.salePrice ? item.salePrice : item.price} per | $${item.salePrice ? (Number.parseFloat(item.salePrice.substring(1)) * item.quantity).toFixed(2) : (Number.parseFloat(item.price.substring(1)) * item.quantity).toFixed(2)} total | https://artistcollective.store/products/${item.name.toLowerCase().replaceAll(" ", "_")}/${item._id}\n`).join("\n")}`
      });

      if (res.clearClientSecret) {
        localStorage.clear();
        return navigate(res.redirect);
      }
    };

    updatePaymentIntentOnTotalChange();
  }, [total, cart]);

  return (
    <>
      <div className="absolute left-0 top-0 flex h-[100vh] w-[100vw] items-center justify-center overflow-hidden pt-12 text-white">
        <div
          className={`absolute left-0 top-0 h-[100vh] w-[100vw] scale-110 bg-[url('/checkoutBg.jpg')] ${/*bg-[#313237]*/ ""} bg-[center_-150rem] blur-sm`}
        ></div>
        <div className="relative h-auto w-[clamp(400px,_80vw,_100vw)] overflow-hidden">
          <div ref={containerRef} className="grid max-h-[80vh] w-[200%] grid-cols-2 grid-rows-1">
            <div
              id="paymentFormWrapper"
              className={`flex w-[100%] gap-4 transition-all duration-300 ease-in-out ${isAddressOpen ? "translate-x-[calc(-100%-0.25rem)]" : ""}`}
            >
              <div
                ref={testingDivRef}
                className="no-scrollbar m-auto w-1/3 min-w-[300px] overflow-y-auto"
                style={{ height: formHeight }}
              >
                {cart.map((item, index) => (
                  <CheckoutPageCartItem item={item} key={index as Key} quantity={item.quantity} />
                ))}
              </div>
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="no-scrollbar my-auto flex max-h-[80vh] flex-1 flex-col overflow-y-auto pr-4"
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
                  <p>Subtotal: {subtotal ? `$${(subtotal / 100).toFixed(2)}` : "N/A"}</p>
                  <p>Tax: {tax ? `$${(tax / 100).toFixed(2)}` : "Enter Shipping Address to Calculate"}</p>
                  <p>
                    Shipping:{" "}
                    {shipping || shipping == 0
                      ? `$${(shipping / 100).toFixed(2)}`
                      : "Enter Shipping Address to Calculate"}
                  </p>
                  <p>Fees: {fees ? `$${(fees / 100).toFixed(2)}` : ``}</p>
                  <p>
                    <strong>Total: {total ? `$${(total / 100).toFixed(2)}` : "N/A"}</strong>
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

                    setAddress(addressData?.value.address ? addressData?.value.address : null);
                    setClientName(addressData?.value?.name ? addressData?.value?.name : null);

                    const res = await calculateTaxes({
                      amount: subtotal,
                      addressValue: addressData?.value
                    });
                    const { amount_total, tax_amount_exclusive } = res.tax;

                    let shippingTotal = 1;

                    if (amount_total && tax_amount_exclusive) {
                      setTax(tax_amount_exclusive);
                      setShipping(shippingTotal);
                      let stripeFee = calculateStripeFee(amount_total + tax_amount_exclusive + shippingTotal); //Calculate stripe fees
                      setFees(stripeFee);

                      if (shippingTotal) {
                        setTotal(amount_total + shippingTotal + stripeFee);
                      } else {
                        setTotal(amount_total + stripeFee);
                      }
                    } else {
                      return;
                    }

                    const checkoutOptions = JSON.parse(localStorage.getItem("checkoutOptions")!).checkoutOptions;

                    const paymentIntentId =
                      checkoutOptions.clientSecret.split("_")[0] + "_" + checkoutOptions.clientSecret.split("_")[1];

                    const { id: stripeCustomerId } = await getCustomerId();
                    setCustomerName(addressData?.value.name);
                    const res2 = await updatePaymentIntent({
                      paymentIntentId,
                      newTotal: total,
                      customerId: stripeCustomerId || null,
                      customerName: addressData?.value.name
                    });
                    if (res2.clearClientSecret) {
                      localStorage.clear();
                      return navigate(res2.redirect);
                    }
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
