import { logRouteNotFound } from "../helpers/middlewares/middlewares";
import { Router } from "express";
import { createItemRouter } from "./createItem";
import { findItemRouter } from "./findItem";
import { fetchItemRouter } from "./fetchItems";

export const masterProductRouter = Router();

masterProductRouter.use("/create", createItemRouter);
masterProductRouter.use("/find", findItemRouter);
masterProductRouter.use("/getProducts", fetchItemRouter);
masterProductRouter.use("/*", logRouteNotFound);
