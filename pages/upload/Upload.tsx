import { FC, useEffect, useState } from "react";
import { useMutation } from "../../hooks/useMutation";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Editor from "../../components/imageEditor/Editor";

export const Upload: FC = () => {
  // const { loading, fn: uploadNewProduct } = useMutation({
  //   url: "/api/products/create",
  //   method: "POST"
  // });

  const { fn: checkLoggedIn } = useMutation({
    url: "/api/user/checkLoggedIn",
    method: "GET",
    credentials: "same-origin"
  });

  const { fn: checkUserCompletedOnboarding } = useMutation({
    url: "/api/user/checkUserCompletedOnboarding",
    method: "GET"
  });

  const [userAllowedToViewPage, setUserAllowedToViewPage] = useState<boolean | null>(null);
  const [userIsArtistButHasNotCompletedOnboarding, setUserIsArtistButHasNotCompletedOnboarding] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    checkLoggedIn().then(async res => {
      const onboardingCompleteRes = await checkUserCompletedOnboarding();
      if (res.isArtist && (res.onboardingComplete || onboardingCompleteRes.completed)) {
        setUserAllowedToViewPage(true);
      } else if (res.isArtist && (!res.onboardingComplete || !onboardingCompleteRes.completed)) {
        setUserAllowedToViewPage(true);
        setUserIsArtistButHasNotCompletedOnboarding(true);
      } else {
        setUserAllowedToViewPage(false);
      }
    });
  }, []);

  if (userAllowedToViewPage == null) return;

  return (
    <>
      <Helmet>
        <title>Artist Collective | Upload</title>
      </Helmet>
      <div className="absolute left-0 top-0 flex h-[100vh] w-[100vw] flex-col items-center justify-center overflow-hidden overscroll-none bg-slate-600 pt-10">
        {userAllowedToViewPage && !userIsArtistButHasNotCompletedOnboarding ? (
          <>
            <Editor />
          </>
        ) : userIsArtistButHasNotCompletedOnboarding ? (
          <h1>Please complete payout details before uploading any products</h1>
        ) : (
          <h1>
            You cannot view this page yet, please complete the <Link to="/onboarding">onboarding process</Link> so we
            can pay you before trying to upload any products
          </h1>
        )}
      </div>
    </>
  );
};
