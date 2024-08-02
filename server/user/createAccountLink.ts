import { Router, Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createAccountLinkRouter: Router = Router();

createAccountLinkRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { accountId, refreshURL, returnURL } = req.body;

    console.log(req.session);

    if (!accountId)
      return res.status(400).send({ error: "No account ID provided" });

    // const loggedInUser = await User.findById(req.session.user._id);

    // if (!loggedInUser?.stripeId)
    //   return res
    //     .status(400)
    //     .send({ error: "User does not have a stripe account" });

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshURL,
      return_url: returnURL,
      type: "account_onboarding"
    });

    return res.json({ url: accountLink.url });
  } catch (error) {
    return res.json({ error: (error as Error).message });
  }
});
