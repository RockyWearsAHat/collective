import { ObjectId } from "mongoose";
import { FC, Key, ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

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
    <div className={styles.productCardWrapper}>
      <Link
        to={`/products/${name.toLocaleLowerCase().replaceAll(" ", "_")}/${id}`}
      >
        <div
          salelabel={salePrice ? `Sale: ${salePricePercentage} off` : ""}
          className={styles.productCard}
        >
          <img
            className={styles.productCardImage}
            src={`${image}`}
            alt={`Image of ${name}`}
          />
        </div>
        <h2>{name}</h2>
        {description && <p>{description}</p>}
        <p>
          Price:{" "}
          <span className={`${salePrice ? styles.linethroughPrice : ""}`}>
            {price}
          </span>
          {salePrice && <span> {salePrice}</span>}
        </p>
      </Link>
    </div>
  );
};

export default ProductCard;
