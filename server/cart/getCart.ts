import { Router, Request, Response } from "express";
import { User } from "../../db/models/user";
import { CartItem, ICartItem } from "../../db/models/cartItem";

export const getCartRouter: Router = Router();

getCartRouter.get("/", async (req: Request, res: Response) => {
  //Don't initialize a session if there isn't one
  if (!req.session) return res.json([]);

  //If the user is not logged in
  if (!req.session.user) {
    if (!req.session.cart || req.session.cart.length == 0) return res.json([]);

    let cart: any[] = req.session.cart ? req.session.cart : [];

    cart = cart.filter(n => n);
    req.session.cart = cart ? cart : [];
    if (!cart || cart.length == 0) {
      return req.session.save();
    }

    const { populateUser } = req.query;

    let foundCart = [];

    for (let i = 0; i < cart.length; i++) {
      const foundItem = await CartItem.findById(cart[i]._id);
      if (foundItem == null) continue;
      let item = await CartItem.findById(cart[i]._id).populate("item");

      //It should be there?
      if (!item) return res.json("Item not found");

      if (populateUser) {
        // item = await item.populate("user", ["stripeId", "username"]);
      }
      foundCart.push(item);
    }

    foundCart = [...new Set(foundCart)];

    req.session.cart = foundCart;
    req.session.save();

    return res.json(foundCart);
  } else {
    const loggedInUser = await User.findById(req.session.user!._id).populate(
      "cart"
    );
    if (!loggedInUser) return res.json("User not found");

    const cart: ICartItem[] = loggedInUser.cart as ICartItem[];

    const { populateUser } = req.query;

    for (let i = 0; i < cart.length; i++) {
      cart[i] = await cart[i].populate("item");
      if (populateUser) {
        cart[i] = await cart[i].populate("user", ["stripeId", "username"]);
      }
    }

    return res.json(cart);
  }
});

getCartRouter.post("/", async (req: Request, res: Response) => {
  if (!req.session.user) {
    const cart: any[] = req.session.cart ? req.session.cart : [];

    for (let i = 0; i < cart.length; i++) {
      if (cart[i] == null) {
        cart.splice(i, 1);
        i--;
      }
    }

    if (cart.length == 0) return;

    let { populateUser } = req.body || null;

    for (let i = 0; i < cart.length; i++) {
      if (populateUser) {
        cart[i] = await CartItem.findById(cart[i]._id).populate("item");
        cart[i] = Object.assign({}, cart[i], { user: { stripeId: null } });
      } else {
        cart[i] = await CartItem.findById(cart[i]._id).populate("item");
      }
    }

    return res.json(cart);
  } else {
    const loggedInUser = await User.findById(req.session.user!._id).populate(
      "cart"
    );
    if (!loggedInUser) return res.json("User not found");

    const cart: ICartItem[] = loggedInUser.cart as ICartItem[];

    let { populateUser } = req.body || null;

    for (let i = 0; i < cart.length; i++) {
      if (populateUser) {
        cart[i] = await (
          await cart[i].populate("item")
        ).populate("user", ["stripeId", "username"]);
      } else {
        cart[i] = await cart[i].populate("item");
      }
    }

    return res.json(cart);
  }
});
