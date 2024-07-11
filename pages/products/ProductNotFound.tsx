import { FC, ReactNode, useEffect, useContext } from "react";
import { ActiveContext } from "../contextProvider";

export const ProductNotFound: FC = (): ReactNode => {
  const { setActive } = useContext(ActiveContext);
  useEffect(() => {
    setActive("productNotFound");
  }, []);
  return (
    <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center">
      <h1>Product Not Found!</h1>
    </div>
  );
};
