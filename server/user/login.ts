import connectToMongo from "../../db/connectToMongo";
import User, { IUser } from "../../db/models/user";
import { Request, Response, Router } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  let { username, password }: Partial<IUser> = req.body;

  //Validate input
  if (typeof username !== "string" || typeof password !== "string")
    return res.json({ error: "Username and password must be strings" });

  if (!username || !password || username.length == 0 || password.length == 0)
    return res.json({ error: "Username and password must not be empty" });

  //Get user from DB
  await connectToMongo();
  const foundUser = await User.findOne<IUser>({ username });

  //Handle errors (user not found)
  if (!foundUser)
    return res.json({ error: `Unable to find user with username ${username}` });

  //Verify the user entered the right info
  const passwordsMatch = foundUser.verifyPassword(password);

  //If not, throw error
  if (!passwordsMatch) return res.json({ error: "Invalid password" });

  //If so, assemble object to return and send it
  const returnObj = { correctLogIn: true, username: foundUser.username };

  return res.json(returnObj);
});

export default router;
