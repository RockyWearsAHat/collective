import { SortOrder } from "mongoose";
import { Item } from "../../db/models/item";
import { Request, Response, Router } from "express";

const fetchItems = async (index: number, numToFetch: number, sort: { [key: string]: SortOrder | { $meta: any } }) => {
  try {
    const items = await Item.find()
      .sort({ ...sort, _id: 1 }) // Sort by sort term and id to keep order consistent
      .skip(index) // Skip first i items
      .limit(numToFetch); // Fetch x items

    return items;
  } catch (error) {
    console.error("Error fetching items:", error);
  }
};

export const fetchItemRouter = Router();

fetchItemRouter.post("/", async function (req: Request, res: Response) {
  console.log("request made");
  const { index, numToFetch, sort } = req.body;

  const items = await fetchItems(index, numToFetch, sort);

  return res.json(items);
});
