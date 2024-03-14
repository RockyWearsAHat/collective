import bcrypt from "bcrypt";
import mongoose, { CallbackWithoutResultAndOptionalError } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  verifyPassword: (password: string) => boolean;
  toJSON: () => Partial<IUser>;
}

interface UserModel extends mongoose.Model<IUser> {}

const userSchema = new mongoose.Schema<IUser, UserModel>({
  username: String,
  email: String,
  password: String
});

userSchema.method("verifyPassword", function (password: string) {
  return bcrypt.compareSync(password, this.password);
});

userSchema.pre<IUser>(
  "save",
  async function (next: CallbackWithoutResultAndOptionalError) {
    this.password = bcrypt.hashSync(
      (this as IUser).password,
      bcrypt.genSaltSync(10)
    );
    next();
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export { userSchema };
export default User;
