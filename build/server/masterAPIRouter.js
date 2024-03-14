import router$1 from './user/masterUserRouter.js';
import { logRouteNotFound } from './middlewares.js';
import { Router } from 'express';

const router = Router();
router.use("/user", router$1);
router.get("/", async (_req, res) => {
    return res.json({ message: "Hello, api route!" });
});
router.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export { router as default };
//# sourceMappingURL=masterAPIRouter.js.map
