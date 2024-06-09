import { Router } from "express";
import { logoutHandler } from "./logout";

export const sessionTimeoutRouter: Router = Router();

sessionTimeoutRouter.get("/", logoutHandler);
