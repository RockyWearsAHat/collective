import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  if (!req.session || !req.session.token) {
    return res.json({ loggedIn: false });
  } else {
    return res.json({ loggedIn: req.session?.token ? true : false });
  }
});

export default router;
