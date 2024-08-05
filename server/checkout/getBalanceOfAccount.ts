import Stripe from "stripe";
import { Request, Response, Router } from "express";

export const getBalanceOfAccountRouter: Router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

getBalanceOfAccountRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const balance = await stripe.balance.retrieve();

    return res.json({ balance });
  } catch (error) {
    return res.json({ error: (error as Error).message });
  }
});
