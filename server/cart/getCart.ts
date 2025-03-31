import { Router, Request, Response } from "express";
import { User } from "../../db/models/user";
import { CartItem, ICartItem } from "../../db/models/cartItem";

export const getCartRouter: Router = Router();

getCartRouter.get("/", async (req: Request, res: Response) => {
  //If the user is not logged in
  if (!req.session.user) {
    //If no cart but session id, find all items with session id, set the cart and return
    if (req.session.id) {
      // console.log("No user found, checking for cart with session id", req.session.id);
      const populateItems = req.query.populateItems;
      const foundLinks = populateItems
        ? await CartItem.find({ sessionId: req.session.id }).populate("item")
        : ((await CartItem.find({ sessionId: req.session.id })) ?? []);

      console.log("Found cart in get cart router:", foundLinks);

      req.session.cart = foundLinks;
      req.session.save();
      // console.log("Found links: ", foundLinks);
      return res.json(foundLinks);
    }

    //There will be a cart due to the above check
    let cart: any[] = req.session.cart!;

    //Filter out nulls
    cart = cart.filter(n => n);

    //If no cart, return
    if (!cart || cart.length == 0) {
      return req.session.save();
    }

    const { populateUser } = req.query;
    let foundCart = [];
    for (let i = 0; i < cart.length; i++) {
      let item = await CartItem.findById(cart[i]._id).populate("item");
      //It should be there?
      if (!item) return res.json("Item not found");
      if (populateUser) {
        item = await item.populate("user", ["stripeId", "username"]);
      }
      foundCart.push(item);
    }
    let sessionCart: Array<ICartItem> = [];
    for (let i = 0; i < foundCart.length; i++) {
      sessionCart.push({
        _id: foundCart[i]._id,
        sessionId: req.session.id,
        item: (foundCart[i].item as any)._id ? (foundCart[i].item as any)._id : (foundCart[i].item as any),
        quantity: foundCart[i].quantity
      } as ICartItem);
      for (let j = 0; j < foundCart.length; j++) {
        if (i == j) continue;
        if ((foundCart[i].item as any)._id.toString() == (foundCart[j].item as any)._id.toString()) {
          if (foundCart[i].quantity > foundCart[j].quantity) {
            foundCart.splice(j, 1);
          } else {
            foundCart.splice(i, 1);
          }
        }
      }
    }

    console.log("Session cart:", sessionCart);
    // console.log("Found cart, set session cart to: ", foundCart);
    req.session.cart = foundCart;
    req.session.save();
    return res.json(foundCart);
  } else {
    const loggedInUser = await User.findById(req.session.user!._id).populate("cart");
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
    const loggedInUser = await User.findById(req.session.user!._id).populate("cart");
    if (!loggedInUser) return res.json("User not found");

    const cart: ICartItem[] = loggedInUser.cart as ICartItem[];

    let { populateUser } = req.body || null;

    for (let i = 0; i < cart.length; i++) {
      if (populateUser) {
        cart[i] = await (await cart[i].populate("item")).populate("user", ["stripeId", "username"]);
      } else {
        cart[i] = await cart[i].populate("item");
      }
    }

    return res.json(cart);
  }
});
