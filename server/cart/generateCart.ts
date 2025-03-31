import { Router, Request, Response } from "express";
import { Item } from "../../db/models/item";
import { CartItem } from "../../db/models/cartItem";

export const generateCartRouter: Router = Router();

generateCartRouter.post("/", async (req: Request, res: Response) => {
  //   console.log("Generating cart: ", req.session.id);

  const { cartIdsAndQuantites } = req.body;

  let cart: any[] = [];

  let sessionCartExists = req.session.id && req.session.cart && req.session.cart.length > 0 ? true : false;

  for (let i = 0; i < cartIdsAndQuantites.length; i++) {
    const item = await Item.findById(cartIdsAndQuantites[i].item);
    if (!item) continue;

    if (sessionCartExists) {
      for (let j = 0; j < req.session.cart!.length; j++) {
        let itemExistsInSessionAndNotRequest = true;
        cartIdsAndQuantites.forEach((cartItem: any) => {
          if (req.session.cart![j].item == cartItem.item) {
            itemExistsInSessionAndNotRequest = false;
          }
        });

        if (itemExistsInSessionAndNotRequest) {
          const productLink = await CartItem.create({
            sessionId: req.sessionID,
            item: req.session.cart![j].item,
            quantity: req.session.cart![j].quantity
          });

          cart.push(productLink);
        }
      }
    }

    //Create link for each item
    const productLink = await CartItem.create({
      sessionId: req.sessionID,
      item: item._id,
      quantity: cartIdsAndQuantites[i].quantity
    });

    //Add to cart
    cart.push(productLink);
  }

  //Filter duplicates
  for (let i = 0; i < cart.length; i++) {
    for (let j = 0; j < cart.length; j++) {
      if (i == j) continue;
      if (cart[i].item == cart[j].item) {
        if (cart[i].quantity > cart[j].quantity) {
          cart.splice(j, 1);
        } else {
          cart.splice(i, 1);
        }
      }
    }
  }

  //   console.log("Generated cart: ", cart);

  //Save to session
  req.session.cart = cart;
  req.session.save();

  //Populate cart
  for (let i = 0; i < cart.length; i++) {
    cart[i] = await CartItem.findById(cart[i]._id).populate("item");
  }

  return res.json(cart);
});
