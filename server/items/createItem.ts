import { Request, Response, Router } from "express";
// import { withAuth } from "../auth/masterAuthRouter";
import { Item } from "../../db/models/item";
import { withAuth } from "../auth/masterAuthRouter";
import { User } from "../../db/models/user";

export const createItemRouter = Router();

createItemRouter.post(
  "/",
  withAuth,
  async function (req: Request, res: Response) {
    const { name, price, salePrice, imageLinks } = req.body;

    const userCreatedId = req.session.user?._id;

    if (!userCreatedId)
      return res.status(400).json({ ok: false, message: "User not found" });

    if (!name || !price || !salePrice) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields name, price, and/or salePrice"
      });
    }

    const newItem = await Item.create({
      userCreatedId,
      name,
      price,
      salePrice,
      imageLinks
    });

    await User.findByIdAndUpdate(userCreatedId, {
      $push: { createdItems: newItem._id }
    });

    res.json({ ok: true, message: "Item created" });
  }
);
