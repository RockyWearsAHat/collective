import masterUserRouter from "./user/masterUserRouter";
import { logRouteNotFound } from "./middlewares";
import { Request, Response, Router } from "express";

const router = Router();

router.use("/user", masterUserRouter);

router.get("/", async (_req: Request, res: Response) => {
  return res.json({ message: "Hello, api route!" });
});

router.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export default router;
