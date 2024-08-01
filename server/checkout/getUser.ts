import { Request, Response, Router } from "express";
import Stripe from "stripe";

export const getUserRouter: Router = Router();

getUserRouter.get("/", async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return res.json({ error: "No stripe key found" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const account = await stripe.accounts.retrieve(req.session.user?.stripeId!);

    return res.json(account);
  } catch (err) {
    console.log(err);
    return res.json({ error: "An error occurred" });
  }
});
