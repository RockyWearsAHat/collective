import { Router, Request, Response } from "express";
import { withAuth } from "../auth/masterAuthRouter";
import User from "../../db/models/user";
import mongoose, { ObjectId } from "mongoose";
import CartItem, { ICartItem } from "../../db/models/cartItem";

export const removeFromCartRouter: Router = Router();

removeFromCartRouter.post(
  "/",
  withAuth,
  async (req: Request, res: Response) => {
    const { productToRemove } = await req.body;

    if (mongoose.Types.ObjectId.isValid(productToRemove) === false) {
      console.log("invalid id");
      return res;
    }

    const loggedInUser = await User.findById(req.session.user!._id).populate(
      "cart"
    );
    if (!loggedInUser) return res.status(404).json("User not found");

    let userHasItemInCart: boolean = false;
    let linkId: ObjectId;
    for (let i = 0; i < loggedInUser.cart.length; i++) {
      if ((loggedInUser.cart[i] as ICartItem).item == productToRemove) {
        console.log("found item in cart");
        userHasItemInCart = true;
        linkId = (loggedInUser.cart[i] as ICartItem)._id;
        break;
      }
    }

    let productLink: ICartItem | null;
    if (userHasItemInCart) {
      productLink = await CartItem.findById(linkId!);
      console.log(productLink);
      if (!productLink)
        return res.json({ message: "error finding product link" });
      if (productLink.quantity == 1) {
        await CartItem.findByIdAndDelete(linkId!);
      } else {
        productLink.quantity -= 1;
        productLink.save();

        loggedInUser.cart = [...loggedInUser.cart];
        loggedInUser.save();
      }
    } else {
      return res.json({ message: "item not found in cart" });
    }

    const updatedUser = await User.findById(req.session.user?._id);
    if (!updatedUser) return res.json({ message: "error finding user" });
    req.session.user = updatedUser;
    req.session.save();

    res.json("successfully removed item from cart");
  }
);
