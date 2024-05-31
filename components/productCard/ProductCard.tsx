import { ObjectId } from "mongoose";
import { FC, Key, ReactNode } from "react";
import { Link } from "react-router-dom";

declare module "react" {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    salelabel?: string;
  }
}

interface ProductCardProps {
  name: string;
  id: ObjectId;
  key?: Key;
  image: string;
  price: string;
  salePrice?: string;
  description?: string;
}

const ProductCard: FC<ProductCardProps> = ({
  name,
  id,
  image,
  price,
  description,
  salePrice
}): ReactNode => {
  let salePricePercentage;
  if (salePrice) {
    salePricePercentage = (
      ((Number(price.split("$")[1]) - Number(salePrice.split("$")[1])) /
        Number(price.split("$")[1])) *
      100
    ).toFixed(0);

    if (Number.isInteger((Number.parseFloat(salePricePercentage) * 100) / 100))
      salePricePercentage = Number.parseInt(salePricePercentage);

    salePricePercentage = `${salePricePercentage}%`;
  }

  return (
    <Link
      to={`/products/${name.toLocaleLowerCase().replaceAll(" ", "_")}/${id}`}
    >
      <div
        salelabel={salePrice ? `Sale: ${salePricePercentage} off` : ""}
        className={`relative h-56 w-56 ${salePrice ? `after:absolute after:right-0 after:top-2 after:z-10 after:flex after:h-auto after:w-auto after:items-center after:justify-center after:bg-red-600 after:px-4 after:uppercase after:text-white after:content-[attr(salelabel)]` : ""}`}
      >
        <img
          className="h-full w-full object-cover"
          src={`${image}`}
          alt={`Image of ${name}`}
        />
        <h2>{name}</h2>
        {description && <p>{description}</p>}
        <p>
          Price:{" "}
          <span className={`${salePrice ? "line-through" : ""}`}>{price}</span>
          {salePrice && <span> {salePrice}</span>}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
