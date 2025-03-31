import { Router } from "express";
import { addToCartRouter } from "./addToCart";
import { removeFromCartRouter } from "./removeFromCart";
import { getCartRouter } from "./getCart";
import { updateQuantityRouter } from "./updateQuantity";
import { clearSessionCartRouter } from "./clearSessionCart";
import { generateCartRouter } from "./generateCart";

export const masterCartRouter: Router = Router();

masterCartRouter.use("/addToCart", addToCartRouter);
masterCartRouter.use("/removeFromCart", removeFromCartRouter);
masterCartRouter.use("/getCart", getCartRouter);
masterCartRouter.use("/updateQuantity", updateQuantityRouter);
masterCartRouter.use("/clearSessionCart", clearSessionCartRouter);
masterCartRouter.use("/generateCart", generateCartRouter);
