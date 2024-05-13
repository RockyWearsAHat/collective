import { Router, Request, Response } from "express";
import { validateToken } from "../tokens/jwt";

export const validateTokenHandler = Router();

validateTokenHandler.get("/", async (req: Request, res: Response) => {
  let tokenValidated: boolean = false;
  const token: string | undefined = req.session?.token;
  if (!req.session || !token) return res.json({ tokenValidated });
  tokenValidated = await validateToken(token);
  return res.json({ tokenValidated });
});
