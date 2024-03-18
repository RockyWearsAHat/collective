import { ReactNode, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { ActiveContext } from "../app/App";

const Logout = (): ReactNode => {
  const { active: _active, setActive } = useContext(ActiveContext);

  useEffect(() => {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++)
      Cookies.set(cookies[i].split("=")[0], "", { expires: -1 });

    setActive("/loggedOut");
  }, []);

  return (
    <div className="flex h-screen w-screen justify-center bg-slate-600 align-middle text-white">
      <div className="flex h-auto w-auto flex-col justify-center self-center text-center align-middle">
        <h1 className="text-3xl">You Have Been Successfully Logged Out</h1>
        <p>
          Thank you for using the Artist Collective, we hope you enjoyed your
          visit
        </p>
        <Link
          to="/"
          className="underline decoration-white transition-all duration-300 ease-in-out hover:text-blue-200 hover:decoration-blue-200"
        >
          Go Back To Homepage
        </Link>
      </div>
    </div>
  );
};

export default Logout;
