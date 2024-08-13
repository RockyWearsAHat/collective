import { ReactNode, Suspense, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { ActiveContext } from "../../pages/contextProvider";
import { useMutation } from "../../hooks/useMutation";
import { useNavigate } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import styles from "./Navbar.module.css";
import { LightDarkModeToggle } from "../lightDarkModeToggle/LightDarkModeToggle";

type LinkMap = [url: string, title: string];

declare module "react" {
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    textboxsize?: string;
    cartitems?: string;
  }
}

const DropdownLink = ({
  title,
  url,
  extensionUrl,
  mobileRendering,
  setMobileClicks,
  setActive
}: {
  title: string;
  url: string;
  extensionUrl: string;
  mobileRendering: boolean;
  setMobileClicks: (clicks: number) => any;
  setActive: (active: string) => any;
}) => {
  return (
    <div
      className={`${styles.navbarProfileDropdownItem}${extensionUrl == url ? " " + styles.navbarProfileDropdownLinkActive : ""}`}
    >
      <Link
        to={url}
        onClick={() => {
          if (mobileRendering) {
            setMobileClicks(0);
          }
          setActive(url);
        }}
        className={styles.navbarProfileDropdownLink}
      >
        {title}
      </Link>
    </div>
  );
};

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
  const [cartItemsLength, setCartItemsLength] = useState<number>(0);
  const [userIsArtist, setUserIsArtist] = useState<boolean>(false);
  const [userHoveringProfilePhoto, setUserHoveringProfilePhoto] =
    useState<boolean>(false);

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
    cache: "no-store",
    method: "GET"
  });

  useEffect(() => {
    if (active == "itemAddedToCart") {
      setActive(extensionUrl);
    }
    let timeout;
    //Check if the user is logged in, on every page change, if so update nav to render logged in state
    checkLoggedIn().then(res => {
      setUserIsArtist(res.isArtist ? res.isArtist : false);
      validateToken().then(res => {
        if (res && !res.tokenValidated) {
          if (
            !fullExtensionUrl.match(/^\/$/) &&
            extensionUrl.indexOf("/login") == -1 &&
            extensionUrl.indexOf("/contact") == -1 &&
            extensionUrl.indexOf("/logout") == -1 &&
            extensionUrl.indexOf("/register") == -1 &&
            fullExtensionUrl.indexOf("/product") == -1 &&
            fullExtensionUrl.indexOf("/search") == -1 &&
            extensionUrl.indexOf("/cart") == -1 &&
            extensionUrl.indexOf("/checkout") == -1
          ) {
            return navigate("/session-timed-out");
          }
        }
      });

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

    // const dropdownMenu = document.getElementById("dropdownMenuGroup");
    // const pfp = document.getElementById("userProfilePhoto");

    // dropdownMenu?.children[0].classList.remove(
    //   "hover:grid-rows-1",
    //   "group-hover:grid-rows-1"
    // );

    // pfp?.classList.remove("group");

    // pfp?.addEventListener("mouseleave", () => {
    //   dropdownMenu?.children[0].classList.add(
    //     "hover:grid-rows-1",
    //     "group-hover:grid-rows-1"
    //   );

    //   pfp?.classList.add("group");
    // });

    // pfp?.addEventListener("mouseenter", () => {
    //   dropdownMenu?.children[0].classList.add(
    //     "hover:grid-rows-1",
    //     "group-hover:grid-rows-1"
    //   );

    //   pfp?.classList.add("group");
    // });
  }, [active]);

  const activeLinks: Array<LinkMap> = [
    ["/", "Home"],
    ["/contact", "Contact"]
  ];

  const dropdownLinks: Array<LinkMap> = [["/profile", "Profile"]];

  const logoutLink: Array<LinkMap> = [["/logout", "Logout"]];

  if (!loggedIn) activeLinks.push(["/login", "Login"]);
  if (userIsArtist) dropdownLinks.splice(1, 0, ["/create", "Upload"]);

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
      e.target.blur();
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();

    navigate(`/search/${searchTerm}`);
  };

  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <>
      <div className={styles.navbarWrapper}>
        <Suspense
          fallback={<div className={styles.fallbackNavbarBackground}></div>}
        >
          <div className={styles.navbarBackground} id="navBg"></div>
        </Suspense>
        <div className={styles.navbarSearchBar}>
          <form
            onSubmit={handleSearchSubmit}
            onKeyDown={searchBarEnterKeyHandler}
          >
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.navbarSearchBarInputBox}
            />
            <button type="submit" className={styles.navbarSearchBarSubmitBtn}>
              <CiSearch className={styles.navbarSearchBarIconBtn} />
            </button>
          </form>
        </div>
        <ul className={styles.navbarLinkWrapperList}>
          {activeLinks.map(([url, title]: LinkMap) => {
            return (
              <li key={url}>
                <Link
                  to={url}
                  className={`${styles.navbarLink}${extensionUrl == url ? " " + styles.navbarLinkActive : ""}`}
                  onClick={() => setActive(url)}
                >
                  {title}
                </Link>
              </li>
            );
          })}
          {loggedIn && (
            <>
              <li className={styles.navbarProfileLink}>
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
                  onMouseEnter={() => {
                    setUserHoveringProfilePhoto(true);
                  }}
                  onMouseLeave={() => {
                    setUserHoveringProfilePhoto(false);
                  }}
                >
                  <div
                    id="userProfilePhoto"
                    style={{
                      backgroundImage: `${userProfilePhoto ? `url(${userProfilePhoto})` : ""}`
                    }}
                    className={`${styles.navbarProfilePhoto}${extensionUrl == "/profile" ? " " + styles.navbarProfilePhotoActive : ""}${userHoveringProfilePhoto ? " " + styles.navbarProfilePhotoHover : ""}`}
                  ></div>
                </div>
                <div
                  className={styles.navbarProfileDropdownGroup}
                  onMouseEnter={() => {
                    setUserHoveringProfilePhoto(true);
                  }}
                  onMouseLeave={() => {
                    setUserHoveringProfilePhoto(false);
                  }}
                >
                  <div
                    className={`${styles.navbarProfileDropdown}${userHoveringProfilePhoto ? " " + styles.navbarProfileDropdownGroupActive : ""}`}
                  >
                    <div className={styles.navbarProfileDropdownBackground}>
                      {dropdownLinks.map(([url, title]: LinkMap, index) => (
                        <DropdownLink
                          key={index}
                          title={title}
                          url={url}
                          extensionUrl={extensionUrl}
                          mobileRendering={mobileRendering}
                          setMobileClicks={setMobileClicks}
                          setActive={setActive}
                        />
                      ))}
                      <div
                        className={
                          styles.navbarProfileDropdownLightDarkModeToggleWrapper
                        }
                      >
                        <LightDarkModeToggle />
                      </div>
                      {loggedIn &&
                        logoutLink.map(([url, title]: LinkMap, index) => (
                          <DropdownLink
                            key={index}
                            title={title}
                            url={url}
                            extensionUrl={extensionUrl}
                            mobileRendering={mobileRendering}
                            setMobileClicks={setMobileClicks}
                            setActive={setActive}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </li>
              {userIsArtist && (
                <li className={styles.navbarUploadButtonWrapper}>
                  <Link
                    to="/create"
                    onClick={() => setActive("/create")}
                    title="Create New Piece"
                  >
                    <div
                      className={`${styles.navbarUploadButton}${extensionUrl == "/create" ? " " + styles.navbarUploadButtonActive : ""}`}
                    >
                      <FiPlus className={styles.navbarUploadButtonIcon} />
                    </div>
                  </Link>
                </li>
              )}
            </>
          )}
          <li className={styles.navbarCartWrapper}>
            <Link
              to="/cart"
              onClick={() => setActive("/cart")}
              title="View Cart"
            >
              <div
                cartitems={cartItemsLength.toString()}
                className={`${styles.navbarCart}${extensionUrl == "/cart" ? " " + styles.navbarCartActive : ""}${cartItemsLength > 0 ? " " + styles.navbarCartDisplayItems : ""}`}
              >
                <AiOutlineShoppingCart className={styles.navbarCartIcon} />
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
