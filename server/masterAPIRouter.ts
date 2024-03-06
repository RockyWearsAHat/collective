import { Hono } from "hono";
import masterUserRouter from "./user/masterUserRouter";
import { logRouteNotFound } from "./middlewares";

const app = new Hono();

app.route("/user", masterUserRouter);

app.get("/", async (c) => {
  return c.json({ message: "Hello, api route!" });
});

app.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export default app;
