import { FC, ReactNode } from "react";

const ProductNotFound: FC = (): ReactNode => {
  return (
    <div className="flex h-[100vh] w-[100vw] flex-col items-center justify-center">
      <h1>Product Not Found!</h1>
    </div>
  );
};

export default ProductNotFound;
