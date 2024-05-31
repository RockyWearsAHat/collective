import { Router, Request, Response } from "express";
import { withAuth } from "../auth/masterAuthRouter";
import { User } from "../../db/models/user";
import { ICartItem } from "../../db/models/cartItem";

export const getCartRouter: Router = Router();

getCartRouter.get("/", withAuth, async (req: Request, res: Response) => {
  const loggedInUser = await User.findById(req.session.user!._id).populate(
    "cart"
  );
  if (!loggedInUser) return res.status(404).json("User not found");

  const cart: ICartItem[] = loggedInUser.cart as ICartItem[];

  for (let i = 0; i < cart.length; i++) {
    cart[i] = await cart[i].populate(["item"]);
  }

  res.json(cart);
});
