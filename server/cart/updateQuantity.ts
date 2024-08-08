import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { CartItem } from "../../db/models/cartItem";

export const updateQuantityRouter: Router = Router();

updateQuantityRouter.post("/", async (req: Request, res: Response) => {
  if (!req.session.user) {
    const { productToUpdate, quantity } = await req.body;

    if (
      mongoose.Types.ObjectId.isValid(productToUpdate) === false ||
      typeof quantity !== "number"
    ) {
      return res.json({ message: "Invalid input" });
    }

    const foundLink = await CartItem.findOne({
      sessionId: req.sessionID,
      item: productToUpdate
    });

    console.log(foundLink);

    if (!foundLink) return res.json({ message: "Item not found in cart" });

    foundLink.quantity = quantity;
    await foundLink.save();

    let cart = req.session.cart ? req.session.cart : [];

    let returnCart = [];

    for (let i = 0; i < cart.length; i++) {
      if (cart[i]._id.toString() === foundLink._id.toString()) {
        returnCart.push(foundLink);
      } else {
        returnCart.push(cart[i]);
      }
    }

    req.session.cart = returnCart;
    req.session.save();

    return res.json("Successfully updated quantity");
  } else {
    const { productToUpdate, quantity } = await req.body;
    const userId = req.session.user!._id;

    if (!userId) return res.json({ message: "User not found" });

    if (
      mongoose.Types.ObjectId.isValid(productToUpdate) === false ||
      typeof quantity !== "number"
    ) {
      return res.json({ message: "Invalid input" });
    }

    const foundLink = await CartItem.findOne({
      user: userId,
      item: productToUpdate
    });

    if (!foundLink) return res.json({ message: "Item not found in cart" });

    foundLink.quantity = quantity;
    await foundLink.save();

    return res.json("Successfully updated quantity");
  }
});
