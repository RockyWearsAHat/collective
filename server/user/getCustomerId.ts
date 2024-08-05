import { Router, Request, Response } from "express";
import { withAuth } from "../auth/masterAuthRouter";
import { User } from "../../db/models/user";

export const getCustomerIdRouter: Router = Router();

getCustomerIdRouter.get("/", withAuth, async (req: Request, res: Response) => {
  const user = await User.findById(req.session.user!._id);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  return res.json({
    id: user.stripeCustomerId
  });
});
