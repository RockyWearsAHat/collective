import { Request, Response, Router } from "express";
// import { withAuth } from "../auth/masterAuthRouter";
import { Item, IItem } from "../../db/models/item";
import mongoose from "mongoose";

export const findItemRouter = Router();

findItemRouter.post("/", async function (req: Request, res: Response) {
  //Set defaults so routing can understand the request if malformed URL => /products//ID or something similar
  let { productName = "", productID = "", currentURL = "" } = req.body;

  //Get query params so on redirect they don't get wiped
  const queryParams = currentURL.split("?")[1]
    ? `?${currentURL.split("?")[1]}`
    : ``;

  //If no productId or ID not valid and the name is a valid ID => /products/validId
  if (
    (!mongoose.Types.ObjectId.isValid(productID) || !productID) &&
    mongoose.Types.ObjectId.isValid(productName)
  ) {
    //Set the productID to the name
    productID = productName;
  }

  //Split the URL name and join with spaces for search
  productName = productName.split("%20").join(" ");
  productName = productName.split("-").join(" ");
  productName = productName.split("_").join(" ");

  //Many items can have the same name
  let foundItems: Array<IItem> = [];
  //If name passed
  if (productName) {
    //Find items by name, case insensitive
    foundItems = await Item.find({
      name: { $regex: `^${productName}$`, $options: "i" }
    });
  }

  //Only one item can have an id, if url is /product/ID id has been set to the "name",
  //if not found, redirect to product not found
  if (!mongoose.Types.ObjectId.isValid(productID) && foundItems.length == 0) {
    return res.redirect("/product-not-found");
  }

  //If ID, find single item by ID
  let foundItem: IItem | null = null;
  if (mongoose.Types.ObjectId.isValid(productID)) {
    foundItem = await Item.findById(productID);
  }

  //If neither found, redirect to product not found
  if (foundItems.length == 0 && !foundItem) {
    return res.redirect("/product-not-found");
  }

  //Disgusting logic
  if (foundItems.length > 1 && !foundItem) {
    //ID 1 / 2 / 3, specifices which item by index to display instead of valid ID
    const indexOfItem = productID > 0 ? productID - 1 : null;
    if (indexOfItem != null) {
      if (productID > foundItems.length) {
        return res.redirect("/product-not-found");
      }
      //If index, get the item by the index value
      let itemToDisplay = foundItems[indexOfItem];

      let itemNameArr = itemToDisplay.name.split(" ");
      let lowercaseItemName = itemNameArr.map(item => item.toLowerCase());
      let itemName = lowercaseItemName.join("_");
      //Redirect to the item page with spaces replaced with _ and the actual id of that item index
      return res.redirect(`/products/${itemName}/${itemToDisplay._id}`);
    }

    //If there are multiple items found with name, and no index
    let itemNameArr = foundItems[0].name.split(" ");
    let lowercaseItemName = itemNameArr.map(item => item.toLowerCase());
    let itemName = lowercaseItemName.join("_");
    if (
      currentURL.split("?")[0] !=
      `${req.protocol}://${req.get("host")}/products/browse/${itemName}`
    ) {
      //Redirect to browse page
      return res.redirect(`/products/browse/${itemName}`);
    }

    //If on browse page, return the item array with the toJSON method to convert price numbers to strings, will be defined
    return res.json({ items: foundItems.map(item => item.toJSON()) });
  }
  //Else if searched by name and only one result with name
  else if (foundItems.length == 1) {
    let itemNameArr = foundItems[0].name.split(" ");
    let lowercaseItemName = itemNameArr.map(item => item.toLowerCase());
    let itemName = lowercaseItemName.join("_");
    //Basically same logic as above, except instead of browse poage redirect to /product/itemName/itemID if user not there
    if (
      currentURL.split("?")[0] !=
      `${req.protocol}://${req.get("host")}/products/${itemName}/${foundItems[0]._id}`
    ) {
      return res.redirect(
        `/products/${itemName}/${foundItems[0]._id}${queryParams}`
      );
    }

    //If user is there, return that single item with the name, will be defined as the found items length is 1
    return res.json({ item: foundItems[0].toJSON() });
  }
  //Otherwise, item was searched by ID
  else {
    if (!foundItem) {
      return res.redirect("/product-not-found");
    }
    //Check the user is on the correct page
    let itemNameArr = foundItem.name.split(" ");
    let lowercaseItemName = itemNameArr.map(item => item.toLowerCase());
    let itemName = lowercaseItemName.join("_");
    if (
      currentURL.split("?")[0] !=
      `${req.protocol}://${req.get("host")}/products/${itemName}/${foundItem._id}`
    ) {
      //If not, return redirect to that item's page
      return res.redirect(
        `/products/${itemName}/${foundItem._id}${queryParams}`
      );
    }

    return res.json({ item: foundItem.toJSON() });
  }
});
