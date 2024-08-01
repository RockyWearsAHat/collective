import { Router, Request, Response } from "express";
import { User } from "../../db/models/user";
import { withAuth } from "../auth/masterAuthRouter";

export const getCartIdFromUserRouter: Router = Router();

getCartIdFromUserRouter.get(
  "/",
  withAuth,
  async (req: Request, res: Response) => {
    if (!req.session.user) return res.status(401).json("Unauthorized");

    const user = await User.findById(req.session.user._id);

    if (!user) return res.status(404).json("User not found");

    return res.json({ id: user.cartId });
  }
);
