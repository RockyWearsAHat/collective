import { ReactNode } from "react";
import { useMutation } from "../../hooks/useMutation";

export function Upload(): ReactNode {
  const { loading, fn: uploadNewProduct } = useMutation({
    url: "/api/products/create",
    method: "POST"
  });

  return (
    <div className="pt-nav">
      <h1>Upload Page</h1>
      <button
        disabled={loading}
        onClick={async () =>
          await uploadNewProduct({
            name: "Test",
            price: 123,
            salePrice: 12,
            imageLinks: ["abc.jpg"]
          })
        }
        className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        Click to create an item
      </button>
    </div>
  );
}
