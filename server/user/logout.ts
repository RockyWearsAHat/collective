import { Request, Response, Router } from "express";

export const logoutRouter: Router = Router();

export const logoutHandler = async (req: Request, res: Response) => {
  if (!req.session || !req.session.token) {
    return res.json({ redirect: "/" });
  } else {
    req.session.destroy(() => {
      return res
        .clearCookie("artistcollective.sid")
        .json({ page: "/loggedOut" });
    });
  }
};

logoutRouter.get("/", logoutHandler);
