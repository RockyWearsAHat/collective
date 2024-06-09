import { Router, Request, Response } from "express";

export const checkLoggedInRouter: Router = Router();

checkLoggedInRouter.get("/", (req: Request, res: Response) => {
  if (!req.session || !req.session.token) {
    return res.json({ loggedIn: false });
  } else {
    return res.json({
      loggedIn: req.session?.token ? true : false
    });
  }
});
