import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

import { Router, Request, Response } from "express";
import { CartItem } from "../../db/models/cartItem";
import { User } from "../../db/models/user";

export const updatePaymentIntentRouter = Router();

updatePaymentIntentRouter.post("/", async (req: Request, res: Response) => {
  const { newTotal, paymentIntentId, cart, customerId, customerName, newDescription } = req.body;

  if (cart && cart.length > 0 && !cart[0].item && cart[0]._doc) {
    cart.forEach((item: any, i: number) => {
      cart[i] = item._doc;
    });
  }

  if (!newTotal || !paymentIntentId) {
    return res.json({
      error: "There was an error calculating the tax, no newTotal or paymentIntentId provided."
    });
  }

  try {
    let paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: newTotal
    });

    console.log("Updating payment intent, passed cart:", cart);

    if (newDescription) {
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        description: newDescription
      });
    }

    if (cart) {
      let metadataCart = Array.from(
        cart.forEach((item: any) => {
          return { i: item._id, q: item.quantity };
        })
      );
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          cart: JSON.stringify(metadataCart)
        }
      });

      console.log(JSON.stringify(metadataCart));
    }

    if (customerId) {
      if (customerName) {
        await stripe.customers.update(customerId, {
          name: customerName
        });
      }
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        customer: customerId
      });
    }

    return res.json({ paymentIntent });
  } catch (error: any) {
    console.error("Error updating payment intent:", error.type);

    //If the error is due to the payment intent being invalid, clear the cart and session,
    //NEED TO ADD A PLACE FOR USER TO GET SUPPORT IF THEY GOT CHARGED OR SOMETHING AND THEY ARE
    //UNSURE IF THEIR ORDER ACTUALLY WENT THROUGH, SHOULD ALSO ADD A BETTER ORDER PLACED PAGE
    //ALLOWING THE USER TO VIEW THEIR ORDERS, TRACK THEIR ORDERS, AND SO ON
    if (error.type == "StripeInvalidRequestError") {
      if (!req.session.id) return res.redirect("/"); //How did they get here?

      if (req.session.user) {
        req.session.user.checkoutClientSecret = null;
        await CartItem.deleteMany({ user: req.session.user._id });
        await User.findByIdAndUpdate(req.session.user._id, {
          $set: { cart: [] }
        });
        req.session.cart = [];
        req.session.save();
        return res.json({ clearClientSecret: true, redirect: "/cart" });
      } else {
        console.log(req.session.cart);
        await CartItem.deleteMany({ sessionId: req.session.id });
        req.session.cart = [];
        req.session.save();
        return res.json({ clearClientSecret: true, redirect: "/cart" });
      }
    }

    return res.redirect("/cart");
  }
});
