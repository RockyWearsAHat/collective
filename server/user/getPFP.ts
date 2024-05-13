import { Router, Request, Response } from "express";
import { withAuth } from "../auth/masterAuthRouter";
import { getUserPFP } from "../s3";

const router = Router();

const getPFP = async (req: Request, res: Response) => {
  if (!req.session.user?._id)
    return res.status(400).json({ message: "No user ID" });

  const pfpLink = await getUserPFP(req.session.user._id);

  return res.json({ link: pfpLink });
};

router.get("/", withAuth, getPFP);

export default router;
