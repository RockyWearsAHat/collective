import { Hono } from 'hono';
import connectToMongo from '../../db/connectToMongo.js';
import User from '../../db/models/user.js';

const app = new Hono();
const handleDelete = async (c) => {
    try {
        await connectToMongo();
        await User.deleteMany();
        return c.json({ message: "Deleted all users" });
    }
    catch (err) {
        return c.json({ message: "No users to delete" });
    }
};
app.delete("/", handleDelete).post("/", handleDelete);

export { app as default };
//# sourceMappingURL=deleteAll.js.map
