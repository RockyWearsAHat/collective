import { ReactNode, Suspense, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { ActiveContext } from "../../pages/contextProvider";
import { useMutation } from "../../hooks/useMutation";
import { useNavigate } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";

type LinkMap = [url: string, title: string];

declare module "react" {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    textboxsize?: string;
    cartitems?: string;
  }
}

export default function Navbar(): ReactNode {
  let extensionUrl = `/${window.location.href.split("/").pop()}`;
  let fullExtensionUrl = `/${window.location.href.split("/").slice(3).join("/")}`;
  if (extensionUrl == "") extensionUrl = "/";

  //Underscore denotes that the variable is not used, lint will throw an error otherwise
  //State just used to tell the component to re-render when updated, context so that logout page can update
  const { active, setActive } = useContext(ActiveContext);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState<string | null>(null);
  const [mobileClicks, setMobileClicks] = useState<number>(0);
  const [searchboxSize, _setSearchboxSize] = useState<string>("300px");
  const [cartItemsLength, setCartItemsLength] = useState<number>(0);

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

  const { fn: validateToken } = useMutation({
    url: "/api/auth/validateToken",
    method: "GET",
    credentials: "same-origin"
  });

  const { fn: getCart } = useMutation({
    url: "/api/cart/getCart",
    method: "GET"
  });

  useEffect(() => {
    if (active == "itemAddedToCart") {
      setActive(extensionUrl);
    }
    let timeout;
    //Check if the user is logged in, on every page change, if so update nav to render logged in state
    checkLoggedIn().then(res => {
      validateToken().then(res => {
        if (!res.tokenValidated) {
          if (
            !fullExtensionUrl.match(/^\/$/) &&
            extensionUrl.indexOf("/login") == -1 &&
            extensionUrl.indexOf("/contact") == -1 &&
            extensionUrl.indexOf("/logout") == -1 &&
            fullExtensionUrl.indexOf("/product") == -1 &&
            fullExtensionUrl.indexOf("/search") == -1 &&
            fullExtensionUrl.indexOf("/cart") == -1
          ) {
            navigate("/session-timed-out");
          }
        }
      });

      setTimeout(() => {
        getCart().then(res => {
          if (!(res instanceof Array) || res.length == 0) {
            setCartItemsLength(0);
            return;
          }

          let cartItems: any[] = [];
          if (res && res.length > 0) {
            res.forEach(item => {
              for (let i = 0; i < item.quantity; i++) {
                cartItems.push(item.item);
              }
            });
            setCartItemsLength(cartItems.length);
          }
        });
      }, 10);

      if (res && (res.loggedIn == true || res.loggedIn == false)) {
        setLoggedIn(res.loggedIn);
      }

      //If user is logged in, get their profile photo
      if (
        (!userProfilePhoto || active == "/profilePhotoChanged") &&
        res.loggedIn
      ) {
        fetchUserProfilePhoto().then(res => {
          if (res && res.link) {
            if (userProfilePhoto != res.link) setUserProfilePhoto(res.link);
          }
          setActive(extensionUrl);
        });
      }
    });

    clearTimeout(timeout);

    //Close the navigation menu after navigating to another page
    setMobileClicks(0);

    const dropdownMenu = document.getElementById("dropdownMenuGroup");
    const pfp = document.getElementById("userProfilePhoto");

    dropdownMenu?.children[0].classList.remove(
      "hover:grid-rows-1",
      "group-hover:grid-rows-1"
    );

    pfp?.classList.remove("group");

    pfp?.addEventListener("mouseleave", () => {
      dropdownMenu?.children[0].classList.add(
        "hover:grid-rows-1",
        "group-hover:grid-rows-1"
      );

      pfp?.classList.add("group");
    });

    pfp?.addEventListener("mouseenter", () => {
      dropdownMenu?.children[0].classList.add(
        "hover:grid-rows-1",
        "group-hover:grid-rows-1"
      );

      pfp?.classList.add("group");
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

  //If on mobile, stop navigation to profile page on first click of profile picture
  const [mobileRendering, setMobileRendering] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const agent = window.navigator.userAgent;

    if (
      agent.match(/Android/i) ||
      agent.match(/webOS/i) ||
      agent.match(/iPhone/i) ||
      agent.match(/iPad/i) ||
      agent.match(/iPod/i) ||
      agent.match(/BlackBerry/i) ||
      agent.match(/Windows Phone/i)
    ) {
      setMobileRendering(true);
      window.addEventListener("click", e => {
        if (!e.target) return;
        if (
          !document
            .getElementById("dropdownMenuGroup")
            ?.contains(e.target as Node) &&
          !document
            .getElementById("userProfilePhoto")
            ?.contains(e.target as Node)
        ) {
          setMobileClicks(0);
        }
      });
    }
  }, [window.navigator.userAgent, window.innerWidth, window.innerHeight]);

  const searchBarEnterKeyHandler = (e: any) => {
    if (e.key == "Enter") {
      navigate(`/search/${searchTerm}`);
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();

    navigate(`/search/${searchTerm}`);
  };

  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <>
      <div className="relative !z-[100] min-w-[100vw] max-w-[100vw] select-none">
        <Suspense
          fallback={
            <div className="absolute -z-10 h-[70px] min-w-[100vw] max-w-[100vw] bg-zinc-700 bg-cover brightness-50"></div>
          }
        >
          <div
            className="absolute -z-10 h-full min-w-[100vw] max-w-[100vw] bg-[url('/navbg.jpg')] bg-cover brightness-50"
            id="navBg"
          ></div>
        </Suspense>
        <div className="absolute left-[50%] top-[50%] flex translate-x-[-50%] translate-y-[-50%]">
          <form
            onSubmit={handleSearchSubmit}
            onKeyDown={searchBarEnterKeyHandler}
          >
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-[${searchboxSize}] border-b-2 bg-transparent px-4 text-center text-white outline-none placeholder:text-white focus:outline-none focus:placeholder:invisible`}
            />
            <button type="submit">
              <CiSearch className="absolute right-0 size-[20px] translate-y-[-15px] text-xl text-white" />
            </button>
          </form>
        </div>

        {/* <div
          className={`absolute left-[calc(50%+35px)] ml-[${parseInt(searchboxSize) / 2}px] top-[50%] flex translate-x-[calc(-50%-20px)] translate-y-[-50%]`}
        >
          <CiSearch className="mt-1 size-[20px] text-xl text-white" />
        </div> */}

        <ul className="flex justify-end gap-4 overflow-visible py-2 pr-4 text-white">
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
                <div
                  title="Go To Profile"
                  onClick={() => {
                    if (!mobileRendering) {
                      navigate("/profile");
                      setActive("/profile");
                    } else if (
                      mobileRendering &&
                      mobileClicks == 1 &&
                      extensionUrl != "/profile"
                    ) {
                      setMobileClicks(2);
                      navigate("/profile");
                      setActive("/profile");
                    } else if (mobileRendering && mobileClicks == 0) {
                      setMobileClicks(1);
                    }
                  }}
                >
                  <div
                    id="userProfilePhoto"
                    style={{
                      backgroundImage: `${userProfilePhoto ? `url(${userProfilePhoto})` : ""}`
                    }}
                    className={`group z-50 h-[24px] w-[24px] rounded-full bg-cover bg-center bg-no-repeat transition-all duration-300 ease-in-out ${extensionUrl == "/profile" ? "ring-2 ring-slate-300 hover:cursor-default" : "hover:cursor-pointer hover:ring-2 hover:ring-white"}`}
                  ></div>
                </div>
                <div
                  className={`absolute h-[0.5rem] w-[24px]`}
                  id="dropdownMenuGroup"
                >
                  <div className="absolute right-0 mt-2 grid w-[200px] grid-rows-0 overflow-hidden transition-all duration-300 ease-in-out hover:grid-rows-1 group-hover:grid-rows-1">
                    <div className="overflow-hidden bg-slate-500">
                      {dropdownLinks.map(([url, title]: LinkMap) => {
                        return (
                          <div
                            key={url}
                            className={`profileDropdownLink pointer-events-none flex w-[100%] justify-end transition-all duration-300 ease-in-out hover:bg-slate-700 ${active == url ? "bg-slate-700" : ""}`}
                          >
                            <Link
                              to={url}
                              onClick={() => {
                                if (mobileRendering) {
                                  setMobileClicks(0);
                                }
                                setActive(url);
                              }}
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
                  <div
                    className={`z-50 flex h-[20px] w-[20px] items-center justify-center overflow-visible rounded-full bg-transparent transition-all duration-300 ease-in-out ${active == "/create" ? "text-slate-300 ring-2 ring-slate-300 hover:cursor-default" : "text-white hover:cursor-pointer hover:ring-2 hover:ring-white"}`}
                  >
                    <FiPlus className="text-xl" />
                  </div>
                </Link>
              </li>
            </>
          )}
          <li className="flex items-center justify-center">
            <Link
              to="/cart"
              onClick={() => setActive("/cart")}
              title="View Cart"
            >
              <div
                cartitems={cartItemsLength.toString()}
                className={`z-50 flex h-[20px] w-[20px] items-center justify-center overflow-visible rounded-full bg-transparent transition-all duration-300 ease-in-out after:absolute after:right-0 after:top-1 after:z-10 after:flex after:size-4 after:translate-x-[-50%] after:items-center after:justify-center after:rounded-full after:bg-red-500 after:text-center after:text-xs after:uppercase after:text-white after:content-[attr(cartitems)] ${active == "/cart" ? "text-slate-300 ring-2 ring-slate-300 hover:cursor-default" : "text-white hover:cursor-pointer hover:ring-2 hover:ring-white"}`}
              >
                <AiOutlineShoppingCart className="text-md" />
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
