import { Hono } from 'hono';
import app$1 from './user/masterUserRouter.js';
import { logRouteNotFound } from './middlewares.js';

const app = new Hono();
app.route("/user", app$1);
app.get("/", async (c) => {
    return c.json({ message: "Hello, api route!" });
});
app.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export { app as default };
//# sourceMappingURL=masterAPIRouter.js.map
