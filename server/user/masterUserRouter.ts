import { Hono } from "hono";
import registerRouter from "./register";
import loginRouter from "./login";
import deleteAllRouter from "./deleteAll";
import { logRouteNotFound } from "../middlewares";

const app = new Hono();

app.route("/register", registerRouter);
app.route("/login", loginRouter);
app.route("/delete-all", deleteAllRouter);
app.get("/*", logRouteNotFound).post("/*", logRouteNotFound);

export default app;
