import { Router, Request, Response } from "express";
import { withAuth } from "../auth/masterAuthRouter";
import mongoose from "mongoose";
import { CartItem } from "../../db/models/cartItem";

export const updateQuantityRouter: Router = Router();

updateQuantityRouter.post(
  "/",
  withAuth,
  async (req: Request, res: Response) => {
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
);
