import { Router, Request, Response } from "express";
import multer from "multer";

const router = Router();

const generateFileName = (file: Express.Multer.File) => {
  return `${Date.now()}-${file.originalname}`;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, generateFileName(file));
  }
});

const uploadFile = multer({ storage: storage });

const savePFP = async (req: Request, res: Response) => {
  let file = req.file;

  console.log(file);

  return res.json({ message: "PFP saved" });
};

router.post("/", uploadFile.single("newPFP"), savePFP);

export default router;
