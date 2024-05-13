import { logRouteNotFound } from "../middlewares";
import { Router } from "express";
import createItemRouter from "./createItem";
import findItemRouter from "./findItem";

const router = Router();

router.use("/create", createItemRouter);
router.use("/find", findItemRouter);
router.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export default router;
