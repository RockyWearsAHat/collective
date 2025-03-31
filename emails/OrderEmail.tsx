import { Html } from "@react-email/components";
import { ReactNode } from "react";
import { IItem } from "../db/models/item";

interface OrderEmailItem {
  item: IItem;
  quantity: number;
}

export function OrderEmail({
  name,
  orderNumber,
  cartString
}: {
  name: string;
  orderNumber: string;
  cartString: string;
}): ReactNode {
  const cart = JSON.parse(cartString);

  return (
    <Html>
      <h1 style={{ textAlign: "center" }}>Thank you {name} for your purchase from the artist collective!</h1>
      <h2
        style={{
          textAlign: "center",
          // padding: "80px",
          paddingBlock: "40px",
          backgroundColor: "gray"
        }}
      >
        Order number: {orderNumber}
      </h2>
      <h2 style={{ textAlign: "center" }}>Your items:</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexDirection: "column"
        }}
      >
        {(cart as OrderEmailItem[]).map((item, i) => (
          <div key={i} style={{ width: "50%" }}>
            <img src={item.item.imageLinks![0]} alt="An image" />
            <h3>{item.item.name}</h3>
            <p>
              {item.item.salePrice ? (
                <>
                  <span
                    style={{
                      textDecoration: "line-through",
                      marginRight: "24px"
                    }}
                  >
                    {item.item.price.toString()}
                  </span>
                  {item.item.salePrice.toString()}
                </>
              ) : (
                item.item.price.toString()
              )}
            </p>
          </div>
        ))}
      </div>
    </Html>
  );
}
