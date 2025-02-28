import { Router, Request, Response } from "express";
import { User } from "../../db/models/user";

export const getColorSchemePreferenceRouter = Router();

getColorSchemePreferenceRouter.get("/", async (req: Request, res: Response) => {
  const user = await User.findById(req.session.user?._id);

  if (!user?.displayMode) return res.json({ setColorScheme: false });

  return res.json({ setColorScheme: true, colorScheme: user?.displayMode });
});
