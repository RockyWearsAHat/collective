import { Router, Request, Response } from "express";
import { User } from "../../db/models/user";
import mongoose, { ObjectId } from "mongoose";
import { CartItem, ICartItem } from "../../db/models/cartItem";

export const addToCartRouter: Router = Router();

addToCartRouter.post("/", async (req: Request, res: Response) => {
  if (!req.session.user) {
    //User is not logged in
    const { productToAdd, quantity } = req.body;

    if (mongoose.Types.ObjectId.isValid(productToAdd) === false) {
      return res;
    }

    let cart = req.session.cart ? req.session.cart : [];

    let userHasItemInCart: boolean = false;
    let linkId: ObjectId;
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].item == productToAdd) {
        userHasItemInCart = true;
        linkId = cart[i]._id;
        break;
      }
    }

    let productLink: ICartItem | null;
    if (userHasItemInCart) {
      productLink = await CartItem.findById(linkId!);
      if (!productLink) return res.json({ message: "error finding product link" });
      productLink.quantity += quantity ? quantity : 1;
      await productLink.save();
      cart = [productLink, ...cart.filter(item => item._id != linkId)];
    } else {
      productLink = await CartItem.create({
        sessionId: req.sessionID,
        item: productToAdd,
        quantity: quantity ? quantity : 1
      });

      if (!productLink) return res.json({ message: "error adding product to cart" });

      cart = [...cart, productLink];
    }

    req.session.cart = cart;

    // console.log("Added item to cart: ", cart);
    req.session.save(() => {
      return res.json("successfully added item to cart");
    });
  } else {
    //User is logged in
    const { productToAdd, quantity } = req.body;

    if (mongoose.Types.ObjectId.isValid(productToAdd) === false) {
      return res;
    }

    const loggedInUser = await User.findById(req.session.user!._id).populate("cart");

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
      if (!productLink) return res.json({ message: "error finding product link" });
      productLink.quantity += quantity ? quantity : 1;
      productLink.save();

      loggedInUser.cart = [...loggedInUser.cart];
      await loggedInUser.save();
    } else {
      productLink = await CartItem.create({
        user: req.session.user?._id,
        item: productToAdd,
        quantity: quantity ? quantity : 1
      });
      if (!productLink) return res.json({ message: "error adding product to cart" });

      loggedInUser.cart = [...loggedInUser.cart, productLink._id];
      await loggedInUser.save();
    }

    const updatedUser = await User.findById(req.session.user?._id);
    if (!updatedUser) return res.json({ message: "error finding user" });

    let foundCart = await CartItem.find({
      _id: { $in: updatedUser.cart }
    });

    req.session.cart = foundCart;
    req.session.user = updatedUser;

    // console.log("Req.session.cart set to: ", foundCart);
    req.session.save(() => {
      return res.json("successfully added item to cart");
    });
  }
});
