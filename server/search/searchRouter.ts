import { Request, Response, Router } from "express";
import { Item } from "../../db/models/item";

export const searchRouter: Router = Router();

searchRouter.get("/:productName", async (req: Request, res: Response) => {
  const { productName } = req.params;

  console.log(productName);

  const searchResults = await Item.find({
    name: { $regex: productName, $options: "i" }
  }).populate("userCreatedId", "username");

  console.log("Search results: ", searchResults);

  // Return the search results
  res.json({ foundProducts: searchResults }); // Replace [] with the actual search results
});
