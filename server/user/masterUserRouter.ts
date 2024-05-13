import { logRouteNotFound } from "../helpers/middlewares/middlewares";
import { Router } from "express";

import { registerRouter } from "./register";
import { loginRouter } from "./login";
import { deleteAllRouter } from "./deleteAll";
import { savePFPRouter } from "./savePFP";
import { getPFPRouter } from "./getPFP";
import { logoutRouter } from "./logout";
import { checkLoggedInRouter } from "./checkLoggedIn";

export const masterUserRouter = Router();

masterUserRouter.use("/register", registerRouter);
masterUserRouter.use("/login", loginRouter);
masterUserRouter.use("/delete-all", deleteAllRouter);
masterUserRouter.use("/savePFP", savePFPRouter);
masterUserRouter.use("/getPFP", getPFPRouter);
masterUserRouter.use("/logout", logoutRouter);
masterUserRouter.use("/checkLoggedIn", checkLoggedInRouter);
masterUserRouter.use("/*", logRouteNotFound);
