import mongoose, { Document, ObjectId, Decimal128 } from "mongoose";
import { getProductImage } from "../../server/helpers/s3";

export interface IItem extends Document {
  userCreatedId: ObjectId;
  name: string;
  price: Decimal128 | string;
  salePrice?: Decimal128 | string;
  productionCost: Decimal128 | string;
  imageLinks?: string[];
  toJSON: () => IItem;
  timesViewed?: number;
  timesAddedToCart?: number;
  timesPurchased?: number;
}

interface ItemModel extends mongoose.Model<IItem> {}

const itemSchema = new mongoose.Schema<IItem, ItemModel>({
  userCreatedId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  price: { type: mongoose.Schema.Types.Decimal128, required: true },
  salePrice: { type: mongoose.Schema.Types.Decimal128 },
  productionCost: { type: mongoose.Schema.Types.Decimal128, required: true },
  imageLinks: { type: Array<String> },
  timesViewed: { type: Number, default: 0 },
  timesAddedToCart: { type: Number, default: 0 },
  timesPurchased: { type: Number, default: 0 }
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
  return obj;
});

itemSchema.virtual("awsLink").get(function () {
  // If your bucket is publicly accessible:
  // "example-bucket" is your bucket name, or you can store it in env vars
  let links = [];
  if (this.imageLinks) {
    for (let i = 0; i < this.imageLinks.length; i++) {
      const link = getProductImage(this._id as ObjectId, this.imageLinks[i]);
      console.log(link);
      links.push(link);
    }
    return links;
  }
  return ["err"];
});

const Item = mongoose.model<IItem>("Item", itemSchema);

export { Item, itemSchema };
