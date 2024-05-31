import mongoose, { Document, ObjectId, Decimal128 } from "mongoose";

export interface IItem extends Document {
  userCreatedId: ObjectId;
  name: string;
  price: Decimal128 | string;
  salePrice?: Decimal128 | string;
  imageLinks?: string[];
  toJSON: () => IItem;
}

interface ItemModel extends mongoose.Model<IItem> {}

const itemSchema = new mongoose.Schema<IItem, ItemModel>({
  userCreatedId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Decimal128, required: true },
  salePrice: { type: mongoose.Schema.Types.Decimal128 },
  imageLinks: { type: Array<String> }
});

itemSchema.method("toJSON", function () {
  let obj: IItem = this.toObject();
  obj.price = Number(obj.price).toLocaleString("en", {
    style: "currency",
    currency: "USD"
  });
  if (obj.salePrice) {
    obj.salePrice = Number(obj.salePrice).toLocaleString("en", {
      style: "currency",
      currency: "USD"
    });
  }
  delete obj.__v;
  return obj;
});

const Item = mongoose.model<IItem>("Item", itemSchema);

export { Item, itemSchema };
