import { ReactNode, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ActiveContext } from "../contextProvider";
import { useMutation } from "../../hooks/useMutation";
import { Helmet } from "react-helmet-async";

export const Logout = (): ReactNode => {
  const { active, setActive } = useContext(ActiveContext);

  const { fn: logout } = useMutation({
    url: "/api/user/logout",
    method: "GET",
    credentials: "same-origin"
  });

  const { fn: checkLoggedIn } = useMutation({
    url: "/api/user/checkLoggedIn",
    method: "GET"
  });

  useEffect(() => {
    checkLoggedIn().then(async res => {
      if (res.loggedIn == true && res.loggedIn) {
        setActive("/logout");
        const logoutRes = await logout();
        setActive(logoutRes.page);
      }
    });
  }, [active]);

  useEffect(() => {
    setActive("/logout");
  }, []);

  return (
    <>
      <Helmet>
        <title>The Artist Collective | Logout</title>
      </Helmet>
      <div className="flex h-screen w-screen justify-center bg-slate-600 align-middle text-white">
        <div className="flex h-auto w-auto flex-col justify-center self-center px-10 text-center align-middle">
          <h1 className="text-3xl">You Have Been Successfully Logged Out</h1>
          <p>
            Thank you for using the Artist Collective, we hope you enjoyed your
            visit
          </p>
          <Link
            to="/"
            className="underline decoration-white transition-all duration-300 ease-in-out hover:text-blue-200 hover:decoration-blue-200"
            onClick={() => setActive("/")}
          >
            Go Back To Homepage
          </Link>
        </div>
      </div>
    </>
  );
};
