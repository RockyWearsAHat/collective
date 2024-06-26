import { Router, Request, Response } from "express";
import { withAuth } from "../auth/masterAuthRouter";
import { User } from "../../db/models/user";
import mongoose, { ObjectId } from "mongoose";
import { CartItem, ICartItem } from "../../db/models/cartItem";

export const addToCartRouter: Router = Router();

addToCartRouter.post("/", withAuth, async (req: Request, res: Response) => {
  const { productToAdd } = await req.body;

  if (mongoose.Types.ObjectId.isValid(productToAdd) === false) {
    return res;
  }

  const loggedInUser = await User.findById(req.session.user!._id).populate(
    "cart"
  );
  if (!loggedInUser) return res.status(404).json("User not found");

  let userHasItemInCart: boolean = false;
  let linkId: ObjectId;
  for (let i = 0; i < loggedInUser.cart.length; i++) {
    if ((loggedInUser.cart[i] as ICartItem).item == productToAdd) {
      userHasItemInCart = true;
      linkId = (loggedInUser.cart[i] as ICartItem)._id;
      break;
    }
  }

  let productLink: ICartItem | null;
  if (userHasItemInCart) {
    productLink = await CartItem.findById(linkId!);
    if (!productLink)
      return res.json({ message: "error finding product link" });
    productLink.quantity += 1;
    productLink.save();

    loggedInUser.cart = [...loggedInUser.cart];
    loggedInUser.save();
  } else {
    productLink = await CartItem.create({
      user: req.session.user?._id,
      item: productToAdd,
      quantity: 1
    });
    if (!productLink)
      return res.json({ message: "error adding product to cart" });

    loggedInUser.cart = [...loggedInUser.cart, productLink._id];
    loggedInUser.save();
  }

  const updatedUser = await User.findById(req.session.user?._id);
  if (!updatedUser) return res.json({ message: "error finding user" });
  req.session.user = updatedUser;
  req.session.save();

  res.json("successfully added item to cart");
});
