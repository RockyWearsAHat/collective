import { NextFunction, Request, Response, Router } from "express";
import { validateTokenHandler } from "./validateToken";
import { signToken, validateToken } from "../tokens/jwt";
import { User } from "../../db/models/user";

export const masterAuthRouter: Router = Router();

masterAuthRouter.use("/validateToken", validateTokenHandler);

export const withAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let tokenValidated: boolean = false;

  if (!req.session || !req.session.token) {
    console.log("No session or token");
    return res.json({ tokenValidated: false });
  }

  tokenValidated = await validateToken(req.session.token);
  if (!tokenValidated) {
    return res.json({ tokenValidated: false });
  }

  const loggedInUser = await User.findById(req.session.user?._id);

  if (!loggedInUser)
    return res.json({ ok: false, message: "Error finding user" });

  const refreshedToken = await signToken(loggedInUser);

  if (!refreshedToken) {
    return res.json({ tokenValidated: false });
  }

  req.session.touch();
  req.session.token = refreshedToken;
  req.session.save();

  next();
};
