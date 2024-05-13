import { Router, Request, Response } from "express";
import { validateToken } from "../tokens/jwt";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  let tokenValidated: boolean = false;
  const token: string | undefined = req.session?.token;
  if (!req.session || !token) return res.json({ tokenValidated });
  tokenValidated = await validateToken(token);
  return res.json({ tokenValidated });
});

export default router;
