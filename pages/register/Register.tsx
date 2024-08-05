import { ReactNode, useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation } from "../../hooks/useMutation";
import { ToggleEye } from "../login/Login";
import { Link } from "react-router-dom";
import { ActiveContext } from "../contextProvider";

export function Register(): ReactNode {
  const { setActive } = useContext(ActiveContext);

  useEffect(() => {
    setActive("/register");
  }, []);

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rptPassword, setRptPassword] = useState<string>("");

  const [errorDisplay, setErrorDisplay] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRptPassword, setShowRptPassword] = useState<boolean>(false);

  const [artistEmail, setArtistEmail] = useState<string>("");
  const [artistUsername, setArtistUsername] = useState<string>("");
  const [artistPassword, setArtistPassword] = useState<string>("");
  const [artistRptPassword, setArtistRptPassword] = useState<string>("");

  const [artistErrorDisplay, setArtistErrorDisplay] = useState<string>("");

  const [artistShowPassword, setArtistShowPassword] = useState<boolean>(false);
  const [artistShowRptPassword, setArtistShowRptPassword] =
    useState<boolean>(false);

  const [customerArtistSignUp, setCustomerArtistSignUp] =
    useState<boolean>(false);

  const {
    loading,
    error,
    fn: registerUser
  } = useMutation({
    url: "/api/user/register",
    method: "POST"
  });

  const {
    error: loginError,
    loading: loginLoading,
    fn: loginUser
  } = useMutation({
    url: "/api/user/login",
    method: "POST"
  });

  const { fn: createAccountLink } = useMutation({
    url: "/api/user/createAccountLink",
    method: "POST"
  });

  const handleSubmit = async (e: any) => {
    setErrorDisplay("");
    e.preventDefault();

    if (password !== rptPassword)
      return setErrorDisplay("Passwords do not match");

    const data = await registerUser({ username, email, password });

    if (error || data.error) {
      setErrorDisplay(error ? error : data.error);
    } else {
      const loginData = await loginUser({ username, password });

      if (loginError || loginData.error) {
        setErrorDisplay(loginError ? loginError : loginData.error);
      } else {
        window.location.href = "/";
      }
    }
  };

  const handleArtistSubmit = async (e: any) => {
    setArtistErrorDisplay("");
    e.preventDefault();

    if (artistPassword !== artistRptPassword)
      return setArtistErrorDisplay("Passwords do not match");

    const data = await registerUser({
      username: artistUsername,
      email: artistEmail,
      password: artistPassword,
      isArtist: true
    });

    if (error || data.error) {
      return setArtistErrorDisplay(error ? error : data.error);
    } else {
      const loginData = await loginUser({
        username: artistUsername,
        password: artistPassword
      });

      const onboardingUrl = await createAccountLink({
        accountId: data.registerRes.stripeId,
        refreshURL:
          window.location.protocol +
          "//" +
          window.location.host +
          "/onboarding",
        returnURL: window.location.protocol + "//" + window.location.host + "/"
      });

      if (loginError || loginData.error) {
        setArtistErrorDisplay(loginError ? loginError : loginData.error);
      } else {
        window.location.href = onboardingUrl.url;
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Artist Collective | Register</title>
      </Helmet>
      <div className="absolute top-0 flex h-[100vh] w-[100vw] flex-col justify-center overflow-hidden text-center">
        <div className="bg-middle absolute -z-10 h-[100vh] w-[100vw] scale-110 flex-col justify-center bg-[url('/loginbg.jpg')] bg-cover bg-center bg-no-repeat align-middle blur-sm"></div>
        <div className="absolute left-[50%] top-[200px] z-20 h-10 w-64 translate-x-[-50%] rounded-full bg-slate-600 text-white">
          <div
            className={`h-10 w-32 rounded-full bg-slate-800 transition-transform duration-[500ms] ease-in-out ${customerArtistSignUp ? "translate-x-[100%]" : ""}`}
          ></div>
          <button
            className="absolute left-0 top-0 h-10 w-32"
            onClick={() => {
              setCustomerArtistSignUp(false);
            }}
          >
            Customer
          </button>
          <button
            className="absolute right-0 top-0 h-10 w-32"
            onClick={() => {
              setCustomerArtistSignUp(true);
            }}
          >
            Artist
          </button>
        </div>

        {/* Customer sign up form */}
        <div
          className={`z-10 flex w-[200vw] flex-row justify-around transition-transform duration-[400ms] ease-in-out ${customerArtistSignUp ? "translate-x-[-50%]" : ""}`}
        >
          <div
            className={`flex h-[100vh] w-[100vw] items-center justify-center`}
          >
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex w-64 select-none flex-col gap-2 rounded-md bg-gray-200 p-4 shadow-md"
            >
              <h1 className="uppercase">Customer</h1>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                name="email"
                autoComplete="email"
                id="email"
                className="selected:outline-none border-2 border-slate-700 placeholder:text-center focus:outline-none focus:placeholder:opacity-0"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                name="username"
                autoComplete="off"
                id="username"
                className="selected:outline-none border-2 border-slate-700 placeholder:text-center focus:outline-none focus:placeholder:opacity-0"
              />
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  name="password"
                  autoComplete="current-password"
                  id="current-password"
                  className={`${showPassword ? "" : "font-password tracking-wide "}w-full border-2 border-slate-700 pr-6 placeholder:text-center focus:outline-none focus:placeholder:opacity-0`}
                />
                <ToggleEye
                  className="absolute right-2 top-[7px] hover:cursor-pointer focus:cursor-pointer"
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              </div>
              <div className="relative w-full">
                <input
                  type={showRptPassword ? "text" : "password"}
                  placeholder="Repeat Password"
                  value={rptPassword}
                  onChange={e => setRptPassword(e.target.value)}
                  name="rptPassword"
                  autoComplete="current-password"
                  id="repeat-current-password"
                  className={`${showRptPassword ? "" : "font-password tracking-wide "}w-full border-2 border-slate-700 pr-6 placeholder:text-center focus:outline-none focus:placeholder:opacity-0`}
                />
                <ToggleEye
                  className="absolute right-2 top-[7px] hover:cursor-pointer focus:cursor-pointer"
                  showPassword={showRptPassword}
                  setShowPassword={setShowRptPassword}
                />
              </div>
              <div
                className={`relative w-full ${errorDisplay !== "" ? "h-auto" : "h-[0]"}`}
              >
                <p
                  className={`rounded-md text-red-500 ${errorDisplay !== "" ? "h-auto" : "h-[0]"}`}
                >
                  {errorDisplay}
                </p>
              </div>
              <button
                type="submit"
                className={`rounded-full border-2 border-black
             ${loading || loginLoading ? "cursor-default border-white bg-slate-600 text-white" : "transition-all duration-300 ease-in-out hover:bg-slate-700 hover:text-white"}`}
              >
                Register
              </button>
              <Link to="/login" className="text-[12px]">
                Already have an account? Login here
              </Link>
            </form>
          </div>

          {/* Artist sign up form */}
          <div
            className={`flex h-[100vh] w-[100vw] items-center justify-center`}
          >
            <form
              onSubmit={handleArtistSubmit}
              className="mx-auto flex w-64 select-none flex-col gap-2 rounded-md bg-gray-200 p-4 shadow-md"
            >
              <h1 className="uppercase">Artist</h1>
              <input
                type="text"
                placeholder="Email"
                value={artistEmail}
                onChange={e => setArtistEmail(e.target.value)}
                name="email"
                autoComplete="email"
                id="artistEmail"
                className="selected:outline-none border-2 border-slate-700 placeholder:text-center focus:outline-none focus:placeholder:opacity-0"
              />
              <input
                type="text"
                placeholder="Username"
                value={artistUsername}
                onChange={e => setArtistUsername(e.target.value)}
                name="username"
                autoComplete="off"
                id="artistUsername"
                className="selected:outline-none border-2 border-slate-700 placeholder:text-center focus:outline-none focus:placeholder:opacity-0"
              />
              <div className="relative w-full">
                <input
                  type={artistShowPassword ? "text" : "password"}
                  placeholder="Password"
                  value={artistPassword}
                  onChange={e => setArtistPassword(e.target.value)}
                  name="password"
                  autoComplete="current-password"
                  id="artistCurrent-password"
                  className={`${artistShowPassword ? "" : "font-password tracking-wide "}w-full border-2 border-slate-700 pr-6 placeholder:text-center focus:outline-none focus:placeholder:opacity-0`}
                />
                <ToggleEye
                  className="absolute right-2 top-[7px] hover:cursor-pointer focus:cursor-pointer"
                  showPassword={artistShowPassword}
                  setShowPassword={setArtistShowPassword}
                />
              </div>
              <div className="relative w-full">
                <input
                  type={artistShowRptPassword ? "text" : "password"}
                  placeholder="Repeat Password"
                  value={artistRptPassword}
                  onChange={e => setArtistRptPassword(e.target.value)}
                  name="rptPassword"
                  autoComplete="current-password"
                  id="artistRepeat-current-password"
                  className={`${artistShowRptPassword ? "" : "font-password tracking-wide "}w-full border-2 border-slate-700 pr-6 placeholder:text-center focus:outline-none focus:placeholder:opacity-0`}
                />
                <ToggleEye
                  className="absolute right-2 top-[7px] hover:cursor-pointer focus:cursor-pointer"
                  showPassword={artistShowRptPassword}
                  setShowPassword={setArtistShowRptPassword}
                />
              </div>
              <div
                className={`relative w-full ${artistErrorDisplay !== "" ? "h-auto" : "h-[0]"}`}
              >
                <p
                  className={`rounded-md text-red-500 ${artistErrorDisplay !== "" ? "h-auto" : "h-[0]"}`}
                >
                  {artistErrorDisplay}
                </p>
              </div>
              <button
                type="submit"
                className={`rounded-full border-2 border-black
             ${loading || loginLoading ? "cursor-default border-white bg-slate-600 text-white" : "transition-all duration-300 ease-in-out hover:bg-slate-700 hover:text-white"}`}
              >
                Register
              </button>
              <Link to="/login" className="text-[12px]">
                Already have an account? Login here
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
