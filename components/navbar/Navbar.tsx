import { ReactNode, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import Cookies from "js-cookie";

export default function Navbar(): ReactNode {
  let extensionUrl = `/${window.location.href.split("/").pop()}`;

  //Underscore denotes that the variable is not used, lint will throw an error otherwise
  //State just used to tell the component to re-render when updated
  const [_active, setActive] = useState("");

  let activeLinks = [
    ["/", "Home"],
    ["/contact", "Contact"]
  ];

  if (!Cookies.get("loggedIn")) activeLinks.push(["/login", "Login"]);

  return (
    <div className="absolute z-50 min-w-[100vw] max-w-[100vw] select-none">
      <Suspense>
        <div className="absolute -z-10 h-full min-w-[100vw] max-w-[100vw] bg-[url('/navbg.jpg')] bg-cover brightness-50"></div>
      </Suspense>
      <ul className="flex justify-end gap-4 py-2 pr-4 text-white ">
        {activeLinks.map(([url, title]) => {
          return (
            <li key={url}>
              <Link
                to={url}
                className={`relative flex h-full items-center justify-center align-middle uppercase transition-all duration-300
                before:absolute before:bottom-0 before:left-0 before:h-0.5 before:transition-all before:duration-300 before:content-[''] 
                ${
                  extensionUrl == url
                    ? "text-slate-300 before:w-full before:bg-slate-300 hover:cursor-default"
                    : "text-white ease-in-out before:w-0 before:bg-white hover:before:w-full"
                }`}
                onClick={() => setActive(url)}
              >
                {title}
              </Link>
            </li>
          );
        })}
        {Cookies.get("loggedIn") && (
          <>
            <li>
              <Link
                to="/profile"
                title="Go To Profile"
                onClick={() => setActive("/profile")}
              >
                <div
                  className={`z-50 h-[24px] w-[24px] rounded-full bg-[url('/examplePFP.jpg')] bg-cover bg-center bg-no-repeat transition-all duration-300 ease-in-out ${extensionUrl == "/profile" ? "ring-2 ring-slate-300 hover:cursor-default" : "hover:cursor-pointer hover:ring-2 hover:ring-white"}`}
                ></div>
              </Link>
            </li>
            <li className="flex items-center justify-center">
              <Link
                to="/create"
                onClick={() => setActive("/create")}
                title="Create New Piece"
              >
                <FaPlus className={`z-50 h-5 w-5`} title="Upload" />
              </Link>
            </li>
          </>
        )}
      </ul>
      <button
        onClick={() => {
          var cookies = document.cookie.split(";");
          for (var i = 0; i < cookies.length; i++)
            Cookies.set(cookies[i].split("=")[0], "", { expires: -1 });

          window.location.href = "/";
        }}
        className="absolute top-0 text-white"
      >
        Clear cookies
      </button>
    </div>
  );
}
