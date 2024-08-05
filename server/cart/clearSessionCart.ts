import { Router, Request, Response } from "express";

export const clearSessionCartRouter: Router = Router();

clearSessionCartRouter.post("/", async (req: Request, res: Response) => {
  req.session.cart = [];
  req.session.save();
  return res.json("Successfully cleared cart");
});
