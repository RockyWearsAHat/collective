import { Request, Response, Router } from "express";
import Stripe from "stripe";

export const createPaymentIntentRouter: Router = Router();

createPaymentIntentRouter.post("/", async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return res.json({ error: "No stripe key found" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let { total, cart, customerId } = req.body;

  if (req.session && req.session.cart && !req.session.user)
    cart = req.session.cart;

  if (!(cart instanceof Array))
    return res.json({ error: "Cart is not an array" });

  let cartIds = [];
  for (let i = 0; i < cart.length; i++) {
    cartIds.push({ i: cart[i].item._id, q: cart[i].quantity });
  }

  if (!total) return res.json({ error: "No total found" });

  let items = [];

  for (let i = 0; i < cart.length; i++) {
    items.push(cart[i].item.name);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      description: `Payment for ${items.join(", ")}`
    });

    if (cartIds) {
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

    if (!paymentIntent.client_secret)
      return res.json({ error: "No client secret!" });

    return res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.log(err);
    return res.json({ error: "An error occurred" });
  }
});
