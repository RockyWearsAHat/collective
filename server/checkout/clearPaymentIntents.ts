import { Request, Response, Router } from "express";
import Stripe from "stripe";

export const clearPaymentIntentsRouter: Router = Router();

clearPaymentIntentsRouter.get("/", async (_req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return res.json({ error: "No stripe key found" });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const items = [
    "pi_3Phg9JAI6vEkS2ui032MBfy2",
    "pi_3Phfy9AI6vEkS2ui059pvCl6",
    "pi_3Phfy3AI6vEkS2ui06KLe7la",
    "pi_3Ph6AAAI6vEkS2ui26TTOv5c",
    "pi_3Ph67CAI6vEkS2ui38Q4znL2",
    "pi_3Ph67CAI6vEkS2ui3647vgBv",
    "pi_3Ph66xAI6vEkS2ui0Yq3ZCXk",
    "pi_3Ph66xAI6vEkS2ui3eOwX9kr",
    "pi_3Ph66nAI6vEkS2ui3wf5eBtR",
    "pi_3Ph66nAI6vEkS2ui1Ull2VRJ",
    "pi_3Ph66gAI6vEkS2ui0p1a6oxO",
    "pi_3Ph66gAI6vEkS2ui0TIfnJbH"
  ];

  try {
    items.forEach(async item => {
      await stripe.paymentIntents.cancel(item);
    });
  } catch (err) {
    console.log(err);
    return res.json({ error: "An error occurred" });
  }
});
