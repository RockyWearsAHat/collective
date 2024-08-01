import { Request, Response, Router } from "express";
import Stripe from "stripe";

export const createPaymentIntentRouter: Router = Router();

createPaymentIntentRouter.post("/", async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return res.json({ error: "No stripe key found" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { total } = req.body;

  if (!total) return res.json({ error: "No total found" });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd"
      //   application_fee_amount: 123,
      //   transfer_data: {
      //     destination: req.session.user?.stripeId!
      //   }
    });

    if (!paymentIntent.client_secret)
      return res.json({ error: "An error occurred" });

    return res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.log(err);
    return res.json({ error: "An error occurred" });
  }
});
