import { NextFunction, Request, Response, Router } from "express";
import validateTokenHandler from "./validateToken";
import { signToken, validateToken } from "../tokens/jwt";
import User from "../../db/models/user";

const masterAuthRouter: Router = Router();

masterAuthRouter.use("/validateToken", validateTokenHandler);

export default masterAuthRouter;

export const withAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let tokenValidated: boolean = false;
  if (!req.session || !req.session.token) {
    console.log("no session or token");
    return res.json({ tokenValidated: false });
  }
  tokenValidated = await validateToken(req.session.token);
  if (!tokenValidated) {
    return res.redirect("/logout");
  }

  const loggedInUser = await User.findById(req.session.user?._id);

  if (!loggedInUser)
    return res.json({ ok: false, message: "Error finding user" });

  const token = await signToken(loggedInUser);

  if (!token) {
    return res.json({ tokenValidated: false });
  }

  req.session.token = token;
  req.session.save();

  // console.log(req.session);

  next();
};
