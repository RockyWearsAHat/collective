import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { User } from "../../db/models/user";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createAccountLinkRouter: Router = Router();

createAccountLinkRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { accountId: accId, refreshURL, returnURL } = req.body;

    console.log(req.session);

    let accountId = accId;
    if (!accId) {
      if (!req.session.user)
        return res.json({
          error: "No logged in user and no accountid provided"
        });
      const userId = req.session.user?._id;

      if (!userId) return res.json({ error: "No logged in user" });

      const user = await User.findById(userId);

      if (!user?.stripeId)
        return res.json({ error: "User does not have a stripe account" });

      accountId = user.stripeId;
    }

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
