import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
  if (!req.session || !req.session.token) {
    return res.json({ redirect: "/" });
  } else {
    req.session.destroy(() => {
      return res
        .clearCookie("artistcollective.sid")
        .json({ page: "/loggedOut" });
    });
  }
});

export default router;
