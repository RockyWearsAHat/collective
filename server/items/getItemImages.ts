import { Router, Request, Response } from "express";
import { getProductImages } from "../helpers/s3";

export const getItemImagesRouter: Router = Router();

const getItemImages = async (req: Request, res: Response) => {
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ message: "No product ID" });

  const pfpLink = await getProductImages(productId);

  return res.json({ link: pfpLink });
};

getItemImagesRouter.get("/", getItemImages);
