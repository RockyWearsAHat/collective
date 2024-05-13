import { logRouteNotFound } from "../helpers/middlewares/middlewares";
import { Router } from "express";
import { createItemRouter } from "./createItem";
import { findItemRouter } from "./findItem";

export const masterProductRouter = Router();

masterProductRouter.use("/create", createItemRouter);
masterProductRouter.use("/find", findItemRouter);
masterProductRouter.use("/*", logRouteNotFound);
