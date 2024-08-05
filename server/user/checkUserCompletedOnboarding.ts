import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { withAuth } from "../auth/masterAuthRouter";
import { User } from "../../db/models/user";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const checkUserCompletedOnboardingRouter: Router = Router();

checkUserCompletedOnboardingRouter.get(
  "/",
  withAuth,
  async (req: Request, res: Response) => {
    try {
      const { _id } = req.session.user!;

      if (!_id) return res.json({ error: "No logged in user" });

      const user = await User.findById(_id);
      console.log(user);

      if (!user) return res.json({ error: "No user found" });

      if (!user.isArtist) return res.json({ isArtist: false });

      if (!user.stripeId)
        return res.json({ error: "No stripe account id found" });

      const account = await stripe.accounts.retrieve(user.stripeId);
      console.log(account);

      if (account.details_submitted) {
        console.log("Onboarding completed.");

        user.onboardingComplete = true;
        await user.save();

        return res.json({ completed: true });
      } else {
        console.log("Onboarding not completed.");

        user.onboardingComplete = false;
        await user.save();

        return res.json({ completed: false });
      }
    } catch (error) {
      console.error("Error retrieving account:", error);
    }
  }
);
