import mongoose, { Document } from "mongoose";

export interface IItem extends Document {
  name: string;
  price: number | string;
  salePrice?: number;
  toJSON: () => IItem;
}

interface ItemModel extends mongoose.Model<IItem> {}

const itemSchema = new mongoose.Schema<IItem, ItemModel>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number }
});

itemSchema.method("toJSON", function () {
  let obj: IItem = this.toObject();
  obj.price = Number(obj.price).toLocaleString("en", {
    style: "currency",
    currency: "USD"
  });
  delete obj.__v;
  return obj;
});

const Item = mongoose.model<IItem>("Item", itemSchema);

export { itemSchema };
export default Item;
