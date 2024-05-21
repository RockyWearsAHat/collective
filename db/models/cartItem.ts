import mongoose, { Document, ObjectId } from "mongoose";

export interface ICartItem extends Document {
  _id: ObjectId;
  user: ObjectId;
  item: ObjectId;
  quantity: number;
}

interface CartItemModel extends mongoose.Model<ICartItem> {}

const cartItemSchema = new mongoose.Schema<ICartItem, CartItemModel>({
  user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  item: { type: mongoose.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true }
});

cartItemSchema.pre("findOneAndDelete", async function (next) {
  const cartItem = await this.model.findOne(this.getFilter());
  if (!cartItem) return next();

  const user = await mongoose.model("User").findById(cartItem.user);
  if (!user) return next();

  user.cart = user.cart.filter((item: mongoose.Types.ObjectId) => {
    if (item.equals(cartItem._id)) return false;
    return true;
  });
  user.save();

  next();
});

const CartItem = mongoose.model<ICartItem>("CartItem", cartItemSchema);

export { CartItem, cartItemSchema };
