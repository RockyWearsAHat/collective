import { logRouteNotFound } from "../middlewares";
import { Router } from "express";

import registerRouter from "./register";
import loginRouter from "./login";
import deleteAllRouter from "./deleteAll";
import savePFPRouter from "./savePFP";
import getPFPRouter from "./getPFP";
import logoutRouter from "./logout";
import checkLoggedInRouter from "./checkLoggedIn";

const router = Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/delete-all", deleteAllRouter);
router.use("/savePFP", savePFPRouter);
router.use("/getPFP", getPFPRouter);
router.use("/logout", logoutRouter);
router.use("/checkLoggedIn", checkLoggedInRouter);
router.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export default router;
