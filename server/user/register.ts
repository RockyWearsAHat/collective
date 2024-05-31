import { User, IUser } from "../../db/models/user";
import { Request, Response, Router } from "express";
import { checkIfEmail } from "../../helpers/checkIfEmail";

export const registerRouter = Router();

const numberOfPfps = 5;

registerRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { username, email, password }: Partial<IUser> = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof email !== "string"
    )
      return res.json({
        error: "Username, email and password must be strings"
      });

    if (
      !username ||
      !password ||
      !email ||
      username.length == 0 ||
      password.length == 0 ||
      email.length == 0
    )
      return res.json({
        error: "Username, email and password must not be empty"
      });

    if (!checkIfEmail(email)) return res.json({ error: "Invalid email" });

    let userExists = await User.findOne({ email });
    if (userExists)
      return res.json({
        error: `A user with the email ${email} already exists`
      });
    userExists = await User.findOne({ username });
    if (userExists)
      return res.json({
        error: `A user with the username ${username} already exists`
      });

    const pfpId = Math.floor(Math.random() * numberOfPfps) + 1;

    const newUser = await User.create({ username, email, password, pfpId });

    return res.json({
      registerRes: newUser
    });
  } catch (err) {
    return res.json({ error: `Error creating user ${err}` });
  }
});
