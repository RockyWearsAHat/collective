import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

import { Router, Request, Response } from "express";

export const updatePaymentIntentRouter = Router();

updatePaymentIntentRouter.post("/", async (req: Request, res: Response) => {
  const { newTotal, paymentIntentId } = req.body;

  if (!newTotal || !paymentIntentId) {
    return res.json({
      error:
        "There was an error calculating the tax, no newTotal or paymentIntentId provided."
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: newTotal
    });

    return res.json({ paymentIntent });
  } catch (error) {
    console.error("Error updating payment intent:", error);
    return res.json({ error });
  }
});
