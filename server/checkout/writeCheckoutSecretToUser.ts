import { Router, Request, Response } from "express";
import { User } from "../../db/models/user";
import { withAuth } from "../auth/masterAuthRouter";

export const writeCheckoutSecretToUserRouter: Router = Router();

writeCheckoutSecretToUserRouter.post(
  "/",
  withAuth,
  async (req: Request, res: Response) => {
    const { checkoutClientSecret } = req.body;

    if (!req.session.user) return res.status(401).json("Unauthorized");

    const user = await User.findById(req.session.user._id);

    if (!user) return res.status(404).json("User not found");

    user.checkoutClientSecret = checkoutClientSecret;
    await user.save();

    return res.json("Cart ID written to user");
  }
);
