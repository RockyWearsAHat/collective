import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation } from "../../hooks/useMutation";
import { ToggleEye } from "../login/Login";

export default function Register(): ReactNode {
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rptPassword, setRptPassword] = useState<string>("");

  const [errorDisplay, setErrorDisplay] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRptPassword, setShowRptPassword] = useState<boolean>(false);

  const {
    loading,
    error,
    fn: registerUser
  } = useMutation({
    url: "/api/user/register",
    method: "POST"
  });

  const { fn: loginUser } = useMutation({
    url: "/api/user/login",
    method: "POST"
  });

  const handleSubmit = async (e: any) => {
    setErrorDisplay("");
    e.preventDefault();

    if (password !== rptPassword)
      return setErrorDisplay("Passwords do not match");

    const data = await registerUser({ username, email, password });

    console.log(data);

    if (error || data.error) {
      setErrorDisplay(error ? error : data.error);
    } else {
      await loginUser({ username, password });
      window.location.href = "/";
    }
  };

  return (
    <>
      <Helmet>
        <title>Artist Collective | Register</title>
      </Helmet>
      <div className="relative flex h-[100vh] w-[100vw] flex-col justify-center overflow-hidden text-center">
        <div className="bg-middle absolute -z-10 h-[100vh] w-[100vw] scale-110 flex-col justify-center bg-[url('/loginbg.jpg')] bg-cover bg-center bg-no-repeat align-middle blur-sm"></div>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-64 select-none flex-col gap-2 rounded-md bg-gray-200 p-4 shadow-md"
        >
          <h1 className="uppercase">Register</h1>
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
             ${loading ? "cursor-default border-white bg-slate-600 text-white" : "transition-all duration-300 ease-in-out hover:bg-slate-700 hover:text-white"}`}
          >
            Register
          </button>
        </form>
      </div>
    </>
  );
}
