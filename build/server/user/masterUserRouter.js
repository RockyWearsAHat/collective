import { Hono } from 'hono';
import app$1 from './register.js';
import app$2 from './login.js';
import app$3 from './deleteAll.js';
import { logRouteNotFound } from '../middlewares.js';

const app = new Hono();
app.route("/register", app$1);
app.route("/login", app$2);
app.route("/delete-all", app$3);
app.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export { app as default };
//# sourceMappingURL=masterUserRouter.js.map
