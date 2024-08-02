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

  const { populateUser } = req.query;

  for (let i = 0; i < cart.length; i++) {
    cart[i] = await cart[i].populate("item");
    if (populateUser) {
      cart[i] = await cart[i].populate("user", ["stripeId", "username"]);
    }
  }

  // console.log(cart);

  return res.json(cart);
});

getCartRouter.post("/", withAuth, async (req: Request, res: Response) => {
  const loggedInUser = await User.findById(req.session.user!._id).populate(
    "cart"
  );
  if (!loggedInUser) return res.status(404).json("User not found");

  const cart: ICartItem[] = loggedInUser.cart as ICartItem[];

  let { populateUser } = req.body || null;

  for (let i = 0; i < cart.length; i++) {
    if (populateUser) {
      cart[i] = await (
        await cart[i].populate("item")
      ).populate("user", ["stripeId", "username"]);
    } else {
      cart[i] = await cart[i].populate("item");
    }
  }

  // console.log(cart);

  return res.json(cart);
});
