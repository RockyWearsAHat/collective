import { Hono } from "hono";
import connectToMongo from "../../db/connectToMongo";
import User from "../../db/models/user";
import { Context } from "hono";

const app = new Hono();

const handleDelete = async (c: Context) => {
  try {
    await connectToMongo();
    await User.deleteMany();
    return c.json({ message: "Deleted all users" });
  } catch (err) {
    return c.json({ message: "No users to delete" });
  }
};

app.delete("/", handleDelete).post("/", handleDelete);

export default app;
