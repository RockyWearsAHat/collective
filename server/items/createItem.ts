import { Request, Response, Router } from "express";
// import { withAuth } from "../auth/masterAuthRouter";
import Item from "../../db/models/item";

export const createItemRouter = Router();

createItemRouter.post("/", async function (req: Request, res: Response) {
  const { name, price, salePrice } = req.body;

  if (!name || !price || !salePrice) {
    return res.status(400).json({
      ok: false,
      message: "Missing required fields name, price, and/or salePrice"
    });
  }

  const newItem = await Item.create({
    name,
    price,
    salePrice
  });

  console.log(newItem.toJSON());
  res.json({ ok: true, message: "Item created" });
});
