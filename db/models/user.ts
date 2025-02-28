import bcrypt from "bcrypt";
import mongoose, {
  Document,
  CallbackWithoutResultAndOptionalError,
  ObjectId
} from "mongoose";
import { ICartItem } from "./cartItem";
import { IItem } from "./item";

export interface IUser extends Document {
  _id: ObjectId;
  stripeId: string | null;
  stripeCustomerId: string;
  isArtist: boolean;
  onboardingComplete: boolean | null;
  checkoutClientSecret: string | null;
  username: string;
  email: string;
  password: string;
  pfpId: string;
  cart: Array<ObjectId | ICartItem>;
  createdItems: Array<ObjectId | IItem>;
  verifyPassword: (password: string) => boolean;
  toJSON: () => Partial<IUser>;
  displayMode: string;
}

interface UserModel extends mongoose.Model<IUser> {}

const userSchema = new mongoose.Schema<IUser, UserModel>({
  stripeId: { type: String, unique: true, required: false, sparse: true },
  stripeCustomerId: { type: String, required: true },
  isArtist: { type: Boolean, required: true },
  onboardingComplete: { type: Boolean, required: false },
  checkoutClientSecret: { type: String, required: false },
  username: { type: String, unique: true, trim: true, required: true },
  email: { type: String, unique: true, trim: true, required: true },
  password: String,
  pfpId: String,
  cart: [{ type: mongoose.Types.ObjectId, ref: "CartItem" }],
  createdItems: [{ type: mongoose.Types.ObjectId, ref: "Item" }],
  displayMode: { type: String }
});

userSchema.method("verifyPassword", function (password: string) {
  return bcrypt.compareSync(password, this.password);
});

userSchema.method("toJSON", function () {
  let obj: Partial<IUser> = this.toObject();
  delete obj.password;

  return obj;
});

userSchema.pre<IUser>(
  "save",
  async function (next: CallbackWithoutResultAndOptionalError) {
    if (!this.isModified("password")) return next();

    this.password = bcrypt.hashSync(
      (this as IUser).password,
      bcrypt.genSaltSync(10)
    );
    next();
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export { userSchema, User };
