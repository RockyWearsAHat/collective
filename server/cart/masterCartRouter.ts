import { Router } from "express";
import { addToCartRouter } from "./addToCart";
import { removeFromCartRouter } from "./removeFromCart";
import { getCartRouter } from "./getCart";

export const masterCartRouter: Router = Router();

masterCartRouter.use("/addToCart", addToCartRouter);
masterCartRouter.use("/removeFromCart", removeFromCartRouter);
masterCartRouter.use("/getCart", getCartRouter);
