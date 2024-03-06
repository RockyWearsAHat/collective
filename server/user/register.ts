import { Hono } from "hono";
import connectToMongo from "../../db/connectToMongo";
import User, { IUser } from "../../db/models/user";

const app = new Hono();

app.post("/", async (c) => {
  await connectToMongo();

  const { username, password }: Partial<IUser> = await c.req.json();

  if (typeof username !== "string" || typeof password !== "string")
    return c.json({ message: "Username and password must be strings" });

  if (!username || !password || username.length == 0 || password.length == 0)
    return c.json({ message: "Username and password must not be empty" });

  const newUser = await User.create({ username, password });

  return c.json({
    registerRes: newUser,
  });
});

export default app;
