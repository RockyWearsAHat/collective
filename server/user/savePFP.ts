import { Router, Request, Response } from "express";
import multer, { memoryStorage } from "multer";
import { withAuth } from "../auth/masterAuthRouter";
import { uploadToS3 } from "../helpers/s3";
import { User } from "../../db/models/user";

export const savePFPRouter: Router = Router();

const storage = memoryStorage();
const upload = multer({ storage });

const savePFP = async (req: Request, res: Response) => {
  let { file } = req;

  if (!file || !req.session.user?._id)
    return res.status(400).json({ message: "No file uploaded" });

  const { error, key } = await uploadToS3(file, req.session.user._id);
  if (error) return res.status(500).json({ message: (error as Error).message });

  await User.findByIdAndUpdate(req.session.user._id, {
    pfpId: key
  });

  return res.json({ message: "PFP saved" });
};

savePFPRouter.post("/", withAuth, upload.single("newPFP"), savePFP);
