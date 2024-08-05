import { User, IUser } from "../../db/models/user";
import { Request, Response, Router } from "express";
import { signToken, validateToken } from "../tokens/jwt";
import { checkIfEmail } from "../../helpers/checkIfEmail";
import { getUserPFP } from "../helpers/s3";
import { CartItem } from "../../db/models/cartItem";
import { ObjectId } from "mongoose";

export const loginRouter = Router();

loginRouter.post("/", async function (req: Request, res: Response) {
  let { username, password }: Partial<IUser> = req.body;

  //Validate input
  if (typeof username !== "string" || typeof password !== "string")
    return res.json({ error: "Username and password must be strings" });

  if (!username || !password || username.length == 0 || password.length == 0)
    return res.json({ error: "Username and password must not be empty" });

  //Get user from DB
  let searchQuery = {};
  if (checkIfEmail(username)) searchQuery = { email: username };
  else searchQuery = { username };
  const foundUser = await User.findOne<IUser>(searchQuery);

  //Handle errors (user not found)
  if (!foundUser)
    return res.json({
      error: `Unable to find user ${username}`
    });

  //Verify the user entered the right info
  const passwordsMatch: boolean = foundUser.verifyPassword(password);

  //If not, throw error, !passwordsMatch ensures that passwordsMatch is not undefined, passwordsMatch !== true ensures that passwordsMatch is not false
  if (!passwordsMatch || passwordsMatch !== true)
    return res.json({ error: "Invalid password" });

  //If login valid, sign a token and set it in a cookie
  const token: string | null = await signToken(foundUser);
  if (!token) {
    return res.json({ error: "Error signing token, please try again" });
  } else if (!validateToken(token)) {
    return res.json({ error: "Error validating token, please try again" });
  }

  let cart = req.session.cart ? req.session.cart : [];
  let processedCart = [];
  if (cart.length > 0) {
    for (let i = 0; i < cart.length; i++) {
      let foundLink = await CartItem.findById(cart[i]._id);
      if (!foundLink) continue;

      foundLink.user = foundUser._id;
      foundLink.sessionId = undefined;
      await foundLink.save();

      processedCart.push(foundLink);
    }
  }

  let combinedUserCart: ObjectId[] = [];
  // for (let i = 0; i < processedCart.length; i++) {
  //   console.log(processedCart[i].item.toString());

  //   combinedUserCart.push(processedCart[i]._id);

  //   foundUser.cart.forEach(async userCartItem => {
  //     console.log(userCartItem);
  //   });
  // }

  console.log(foundUser.cart, processedCart);

  combinedUserCart = [
    ...foundUser.cart.map(item =>
      (item as any).id ? (item as any)._id : item
    ),
    ...processedCart.map(item => item._id)
  ];

  for (let i = 0; i < combinedUserCart.length; i++) {
    const itemLink = await CartItem.findById(combinedUserCart[i]);

    if (!itemLink) {
      await CartItem.deleteOne({ _id: combinedUserCart[i] });
      combinedUserCart.splice(i, 1);
      i--;
      continue;
    }

    for (let j = 0; j < combinedUserCart.length; j++) {
      if (i == j) continue;

      const otherItemLink = await CartItem.findById(combinedUserCart[j]);

      if (!otherItemLink) {
        await CartItem.deleteOne({ _id: combinedUserCart[j] });
        combinedUserCart.splice(j, 1);
        j--;
        continue;
      }

      console.log("item link");
      console.log(itemLink);
      console.log("other item link");
      console.log(otherItemLink);

      if (
        itemLink &&
        otherItemLink &&
        itemLink.item.toString() == otherItemLink.item.toString()
      ) {
        itemLink.quantity += otherItemLink.quantity;
        await itemLink.save();
        await CartItem.findByIdAndDelete(otherItemLink._id);
      }
    }
  }

  console.log(
    "combined user cart: " + JSON.stringify(combinedUserCart, null, 2)
  );

  foundUser.cart = combinedUserCart;
  await foundUser.save();

  const user = foundUser.toJSON();

  req.session.token = token;
  req.session.user = user;
  req.session.cart = [];

  if (user.pfpId) {
    const link = await getUserPFP(foundUser._id);

    if (typeof link == "string") {
      req.session.userPFP = link;
    } else {
      return res.json({ error: "Error getting user PFP" });
    }
  }

  req.session.save();

  // ("token", token, {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "none",
  //   maxAge: 5 * 1000,
  //   expires: new Date(Date.now() + 5 * 1000)
  // });

  //If so, assemble object to return and send it
  const returnObj: {
    loggedIn: boolean;
    username: string;
  } = {
    loggedIn: true,
    username: foundUser.username
  };

  return res.json(returnObj);
});
