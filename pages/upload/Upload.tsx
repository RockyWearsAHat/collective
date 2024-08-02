import { ReactNode, useEffect, useState } from "react";
import { useMutation } from "../../hooks/useMutation";

export function Upload(): ReactNode {
  const { loading, fn: uploadNewProduct } = useMutation({
    url: "/api/products/create",
    method: "POST"
  });

  const { fn: checkLoggedIn } = useMutation({
    url: "/api/user/checkLoggedIn",
    method: "GET",
    credentials: "same-origin"
  });

  const [userAllowedToViewPage, setUserAllowedToViewPage] = useState<
    boolean | null
  >(null);
  const [
    userIsArtistButHasNotCompletedOnboarding,
    setUserIsArtistButHasNotCompletedOnboarding
  ] = useState<boolean | null>(null);

  useEffect(() => {
    checkLoggedIn().then(res => {
      if (res.isArtist && res.onboardingComplete) {
        setUserAllowedToViewPage(true);
      } else if (res.isArtist && !res.onboardingComplete) {
        setUserAllowedToViewPage(true);
        setUserIsArtistButHasNotCompletedOnboarding(true);
      } else {
        setUserAllowedToViewPage(false);
      }
    });
  }, []);

  if (userAllowedToViewPage == null) return;

  return (
    <div className="absolute left-0 top-0 flex h-[100vh] w-[100vw] flex-col items-center justify-center pt-10">
      {userAllowedToViewPage && !userIsArtistButHasNotCompletedOnboarding ? (
        <>
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
        </>
      ) : userIsArtistButHasNotCompletedOnboarding ? (
        <h1>Please complete payout details before uploading any products</h1>
      ) : (
        <h1>
          User is not allowed to view this page, please register as an artist to
          upload and sell products
        </h1>
      )}
    </div>
  );
}
