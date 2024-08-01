import { Request, Response, Router } from "express";

export const logoutRouter: Router = Router();

export const logoutHandler = async (req: Request, res: Response) => {
  if (!req.session || !req.session.token) {
    return res.json({ redirect: "/" });
  } else {
    req.session.destroy(err => {
      if (err) {
        console.log(err);
      }
    });

    await new Promise((resolve, _reject) => {
      setTimeout(() => {
        res.clearCookie("artistcollective.sid");
        return resolve(res.json({ page: "/loggedOut" }));
      }, 500);
    });
  }
};

logoutRouter.get("/", logoutHandler);
