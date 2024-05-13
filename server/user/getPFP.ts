import { Router, Request, Response } from "express";
import { withAuth } from "../auth/masterAuthRouter";
import { getUserPFP } from "../helpers/s3";

export const getPFPRouter: Router = Router();

const getPFP = async (req: Request, res: Response) => {
  if (!req.session.user?._id)
    return res.status(400).json({ message: "No user ID" });

  const pfpLink = await getUserPFP(req.session.user._id);

  return res.json({ link: pfpLink });
};

getPFPRouter.get("/", withAuth, getPFP);
