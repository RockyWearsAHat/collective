import { ReactNode, Suspense, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { ActiveContext } from "../../pages/app/App";
import { useMutation } from "../../hooks/useMutation";

type LinkMap = [url: string, title: string];

export default function Navbar(): ReactNode {
  let extensionUrl = `/${window.location.href.split("/").pop()}`;
  if (extensionUrl == "") extensionUrl = "/";

  //Underscore denotes that the variable is not used, lint will throw an error otherwise
  //State just used to tell the component to re-render when updated, context so that logout page can update
  const { active, setActive } = useContext(ActiveContext);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);

  const { fn: checkLoggedIn } = useMutation({
    url: "/api/user/checkLoggedIn",
    method: "GET",
    credentials: "same-origin"
  });

  const { fn: fetchUserProfilePhoto } = useMutation({
    url: "/api/user/getPFP",
    method: "GET",
    credentials: "same-origin"
  });

  useEffect(() => {
    //Check if the user is logged in, on every page change, if so update nav to render logged in state
    if (!userProfilePhoto || active == "/profilePhotoChanged") {
      fetchUserProfilePhoto().then(res => {
        if (res && res.link) {
          if (userProfilePhoto != res.link) setUserProfilePhoto(res.link);
        }
        setActive(extensionUrl);
      });
    }
    checkLoggedIn().then(res => {
      if (res && (res.loggedIn == true || res.loggedIn == false)) {
        setLoggedIn(res.loggedIn);
      }
    });
  }, [active]);

  const activeLinks: Array<LinkMap> = [
    ["/", "Home"],
    ["/contact", "Contact"]
  ];

  const dropdownLinks: Array<LinkMap> = [
    ["/profile", "Profile"],
    ["/create", "Upload"],
    ["/logout", "Logout"]
  ];

  if (!loggedIn) activeLinks.push(["/login", "Login"]);

  return (
    <div className="absolute z-50 min-w-[100vw] max-w-[100vw] select-none">
      <Suspense>
        <div className="absolute -z-10 h-full min-w-[100vw] max-w-[100vw] bg-[url('/navbg.jpg')] bg-cover brightness-50"></div>
      </Suspense>
      <ul className="flex justify-end gap-4 py-2 pr-4 text-white ">
        {activeLinks.map(([url, title]: LinkMap) => {
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
        {loggedIn && (
          <>
            <li className="group relative">
              <Link
                to="/profile"
                title="Go To Profile"
                onClick={() => setActive("/profile")}
              >
                <div
                  style={{
                    backgroundImage: `${userProfilePhoto ? `url(${userProfilePhoto})` : ""}`
                  }}
                  className={`group z-50 h-[24px] w-[24px] rounded-full ${userProfilePhoto ? "" : "bg-[url('/placeholderProfilePhoto.jpg')] "}bg-cover bg-center bg-no-repeat transition-all duration-300 ease-in-out ${extensionUrl == "/profile" ? "ring-2 ring-slate-300 hover:cursor-default" : "hover:cursor-pointer hover:ring-2 hover:ring-white"}`}
                ></div>
              </Link>
              <div className={`absolute h-[0.5rem] w-[24px]`}>
                <div className="absolute right-0 mt-2 max-h-0 w-[200px] overflow-hidden transition-all duration-300 ease-in-out hover:max-h-[10vh] group-hover:max-h-[10vh]">
                  <div className="overflow-hidden bg-slate-500">
                    {dropdownLinks.map(([url, title]: LinkMap) => {
                      return (
                        <div
                          key={url}
                          className={`profileDropdownLink pointer-events-none flex w-[100%] justify-end transition-all duration-300 ease-in-out hover:bg-slate-700 ${active == url ? "bg-slate-700" : ""}`}
                        >
                          <Link
                            to={url}
                            onClick={() => setActive(url)}
                            className="pointer-events-auto pr-2 uppercase"
                          >
                            {title}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </li>
            <li className="flex items-center justify-center">
              <Link
                to="/create"
                onClick={() => setActive("/create")}
                title="Create New Piece"
              >
                <FaPlus
                  className={`z-50 max-h-5 min-h-5 min-w-5 max-w-5 rounded-full transition-all duration-300 ease-in-out ${active == "/create" ? "text-slate-300 ring-2 ring-slate-300" : "text-white"}`}
                  title="Upload"
                />
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
