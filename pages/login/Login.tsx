import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import Cookies from "js-cookie";

export default function Login(): ReactNode {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: email, password })
    });

    const data = await res.json();

    console.log(data);

    if (data.error) {
      alert(data.error);
    } else {
      Cookies.set("loggedIn", data.loggedIn, { expires: 1 });
      window.location.href = "/";
    }
  };

  const ToggleEye = (props: { className: string }) => {
    return showPassword ? (
      <FaEye
        className={props.className}
        onClick={() => setShowPassword(false)}
      />
    ) : (
      <FaEyeSlash
        className={props.className}
        onClick={() => setShowPassword(true)}
      />
    );
  };

  return (
    <>
      <Helmet>
        <title>Artist Collective | Login</title>
      </Helmet>
      <div className="relative flex h-[100vh] w-[100vw] flex-col justify-center overflow-hidden text-center">
        <div className="bg-middle absolute -z-10 h-[100vh] w-[100vw] scale-110 flex-col justify-center bg-[url('/loginbg.jpg')] bg-cover bg-center bg-no-repeat align-middle blur-sm"></div>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-64 select-none flex-col gap-2 rounded-md bg-gray-200 p-4 shadow-md"
        >
          <h1 className="uppercase">Login</h1>
          <input
            type="text"
            placeholder="Email / Username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            name="username"
            autoComplete="username"
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
            <ToggleEye className="absolute right-2 top-[7px] hover:cursor-pointer" />
          </div>
          <button
            type="submit"
            className="rounded-full border-2 border-black transition-all duration-300 ease-in-out
             hover:bg-slate-700 hover:text-white"
          >
            Login
          </button>
        </form>

        <button onClick={() => console.log(Cookies.get("username"))}>
          Click to check cookie
        </button>
      </div>
    </>
  );
}
