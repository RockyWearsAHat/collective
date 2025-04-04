import { Request, Response, Router } from "express";
import Stripe from "stripe";

export const calculateStripeFee = (amount: number) => {
  return Math.ceil(amount * 0.03 + 0.3);
};

export const createPaymentIntentRouter: Router = Router();

createPaymentIntentRouter.post("/", async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.json({ error: "No stripe key found" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let { total, cart, customerId } = req.body;

  if (req.session && req.session.cart && !req.session.user) cart = req.session.cart;

  if (!(cart instanceof Array) || !cart || !cart.length) return res.json({ error: "Cart is not an array" });

  // console.log(cart);
  let cartIds = [];
  for (let i = 0; i < cart.length; i++) {
    // console.log(cart[i]);
    cartIds.push({
      i: cart[i].item && cart[i].item._id ? cart[i].item._id : cart[i]._doc.item._id,
      q: cart[i].quantity ? cart[i].quantity : cart[i]._doc.quantity
    });

    if (cartIds[i].i == null) {
      return res.json({ error: "Item ID is null" });
    }
  }

  // console.log(cartIds);

  if (!total) return res.json({ error: "No total found" });

  let items = [];

  for (let i = 0; i < cart.length; i++) {
    items.push(cart[i].item && cart[i].item.name ? cart[i].item.name : cart[i]._doc.item.name);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total + calculateStripeFee(total),
      currency: "usd",
      description: `Payment for ${items.join(", ")}`
    });

    if (cartIds) {
      console.log("Creating payment intent with ", JSON.stringify(cartIds, null, 2));

      await stripe.paymentIntents.update(paymentIntent.id, {
        metadata: {
          cart: JSON.stringify(cartIds)
        }
      });
    }

    if (customerId) {
      await stripe.paymentIntents.update(paymentIntent.id, {
        customer: customerId
      });
    }

    if (!paymentIntent.client_secret) return res.json({ error: "No client secret!" });

    return res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.log(err);
    return res.json({ error: "An error occurred" });
  }
});
