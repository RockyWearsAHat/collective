import { logRouteNotFound } from "../middlewares";
import { Router } from "express";

import registerRouter from "./register";
import loginRouter from "./login";
import deleteAllRouter from "./deleteAll";
import savePFP from "./savePFP";

const router = Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/delete-all", deleteAllRouter);
router.use("/savePFP", savePFP);
router.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export default router;
