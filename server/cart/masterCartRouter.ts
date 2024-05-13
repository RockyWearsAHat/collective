import { Router } from "express";
import addToCartRouter from "./addToCart";
import removeFromCartRouter from "./removeFromCart";
import getCartRouter from "./getCart";

const router: Router = Router();

router.use("/addToCart", addToCartRouter);
router.use("/removeFromCart", removeFromCartRouter);
router.use("/getCart", getCartRouter);

export default router;
