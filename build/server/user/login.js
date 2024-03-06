import { Hono } from 'hono';
import connectToMongo from '../../db/connectToMongo.js';
import User from '../../db/models/user.js';

const app = new Hono();
app.post("/", async (c) => {
    await connectToMongo();
    const { username, password } = await c.req.json();
    if (typeof username !== "string" || typeof password !== "string")
        return c.json({ message: "Username and password must be strings" });
    if (!username || !password || username.length == 0 || password.length == 0)
        return c.json({ message: "Username and password must not be empty" });
    const foundUser = await User.findOne({ username });
    if (!foundUser)
        return c.json({ message: `Unable to find user with username ${username}` });
    console.log(foundUser);
    //   console.log(foundUser.verifyPassword(password));
    const passwordsMatch = foundUser.verifyPassword(password);
    console.log(passwordsMatch);
    return c.json({
        loginRes: foundUser ? foundUser : "No user found",
        passwordsMatch,
    });
});

export { app as default };
//# sourceMappingURL=login.js.map
