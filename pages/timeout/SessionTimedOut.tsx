import { ReactNode, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ActiveContext } from "../contextProvider";
import { useMutation } from "../../hooks/useMutation";
import { Helmet } from "react-helmet-async";

export const SessionTimedOut = (): ReactNode => {
  const { active, setActive } = useContext(ActiveContext);

  const { fn: logout } = useMutation({
    url: "/api/user/sessionTime",
    method: "GET",
    credentials: "same-origin"
  });

  const { fn: checkLoggedIn } = useMutation({
    url: "/api/user/checkLoggedIn",
    method: "GET",
    credentials: "same-origin"
  });

  useEffect(() => {
    checkLoggedIn().then(res => {
      if (res.loggedIn == true && res.loggedIn) {
        setActive("/logout");
        logout().then(res => {
          setActive(res.page);
        });
      }
    });
  }, [active]);

  useEffect(() => {
    setActive("/SessionTimedOut");
  }, []);

  return (
    <>
      <Helmet>
        <title>Artist Collective | Session Timed Out</title>
      </Helmet>
      <div className="flex h-screen w-screen justify-center bg-slate-600 align-middle text-white">
        <div className="flex h-auto w-auto flex-col justify-center self-center px-10 text-center align-middle">
          <h1 className="text-3xl">Session Has Timed Out</h1>
          <p>Come back at any time</p>
          <Link
            to="/login"
            className="underline decoration-white transition-all duration-300 ease-in-out hover:text-blue-200 hover:decoration-blue-200"
            onClick={() => setActive("/login")}
          >
            Login
          </Link>
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
