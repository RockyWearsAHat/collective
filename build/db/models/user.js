import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
userSchema.method("verifyPassword", function (password) {
    return bcrypt.compareSync(password, this.password);
});
userSchema.pre("save", async function (next) {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
    next();
});
const User = mongoose.model("User", userSchema);

export { User as default, userSchema };
//# sourceMappingURL=user.js.map
