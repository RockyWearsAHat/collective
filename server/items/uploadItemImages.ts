import { Router, Request, Response } from "express";
import multer, { memoryStorage } from "multer";
import { withAuth } from "../auth/masterAuthRouter";
import { uploadProductImagesToS3 } from "../helpers/s3";
import sharp from "sharp";
import { Item } from "../../db/models/item";

export const uploadItemImagesRouter: Router = Router();

const storage = memoryStorage();
const upload = multer({ storage });

const uploadItemImages = async (req: Request, res: Response) => {
  let { file } = req;
  const { productId } = req.body;

  if (!file || !productId) return res.status(400).json({ error: "No file uploaded" });

  //Convert image to jpeg if not already
  if (file.mimetype != "image/jpeg") {
    const convertedImageBuffer = await sharp(file.buffer).toFormat("jpg").toBuffer();

    // //Load image with new converted data
    file.buffer = convertedImageBuffer;
    file.originalname = file.originalname.replace(/\.[^/.]+$/, ".jpg");
    file.mimetype = "image/jpeg";
  }

  const { error, key } = await uploadProductImagesToS3([file], productId);
  if (error || !key) return res.status(500).json({ error: (error as Error).message });

  const item = await Item.findById(productId);

  if (!item) return res.status(400).json({ error: "No item found" });
  item.imageLinks = item.imageLinks ? Array.from([...(item.imageLinks as string[]), key as string]) : Array.from(key);
  await item.save();

  return res.json({ message: "Product image saved", activeLink: "/productImageUploaded" });
};

uploadItemImagesRouter.post("/", withAuth, upload.single("newPFP"), uploadItemImages);
