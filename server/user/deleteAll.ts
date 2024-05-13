import User from "../../db/models/user";
import { Request, Response, Router } from "express";

const router = Router();

const handleDelete = async (_req: Request, res: Response) => {
  try {
    await User.deleteMany();
    return res.json({ message: "Deleted all users" });
  } catch (err) {
    return res.json({ message: "No users to delete" });
  }
};

router.delete("/", handleDelete).post("/", handleDelete);

export default router;
