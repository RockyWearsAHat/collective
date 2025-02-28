import { Router, Request, Response } from "express";
import { User } from "../../db/models/user";

export const setColorSchemePreferenceRouter = Router();

setColorSchemePreferenceRouter.post(
  "/",
  async (req: Request, res: Response) => {
    // console.log(`set color scheme handler`);
    // console.log(req.body, req.session.user);

    if (!req.session.user) return;

    let user = await User.findById(req.session.user?._id);

    if (!user) return;

    user.displayMode = req.body.colorScheme;
    user = await user.save();

    req.session.user = user;
    req.session.save();

    return res.json({ success: true });
  }
);
