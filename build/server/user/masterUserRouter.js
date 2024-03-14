import { logRouteNotFound } from '../middlewares.js';
import { Router } from 'express';
import router$1 from './register.js';
import router$2 from './login.js';
import router$3 from './deleteAll.js';
import router$4 from './savePFP.js';

const router = Router();
router.use("/register", router$1);
router.use("/login", router$2);
router.use("/delete-all", router$3);
router.use("/savePFP", router$4);
router.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export { router as default };
//# sourceMappingURL=masterUserRouter.js.map
