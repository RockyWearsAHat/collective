import { Request, Response, Router } from "express";
import { Item } from "../../db/models/item";

export const searchRouter: Router = Router();

searchRouter.get("/:productName", async (req: Request, res: Response) => {
  const { productName } = req.params;

  const searchResults = await Item.find({
    name: { $regex: productName, $options: "i" }
  }).populate("userCreatedId", "username");

  // Return the search results
  res.json({ foundProducts: searchResults }); // Replace [] with the actual search results
});
