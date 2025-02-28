import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useMutation } from "../../hooks/useMutation";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";

export const ToggleEye = ({
  className,
  showPassword,
  setShowPassword
}: {
  className: string;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return showPassword ? (
    <FaEye className={className} onClick={() => setShowPassword(false)} />
  ) : (
    <FaEyeSlash className={className} onClick={() => setShowPassword(true)} />
  );
};

export function Login(): ReactNode {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errorDisplay, setErrorDisplay] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    loading,
    error,
    fn: logInUser
  } = useMutation({
    url: "/api/user/login",
    method: "POST"
  });

  const handleSubmit = async (e: any) => {
    setErrorDisplay("");
    e.preventDefault();
    const data = await logInUser({ username, password });

    if (error || data.error) {
      setErrorDisplay(error ? error : data.error);
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      <Helmet>
        <title>Artist Collective | Login</title>
      </Helmet>
      <div className={styles.loginPage__bgDiv__wrapper}>
        <div className={styles.loginPage__bgDiv__image}></div>
        <form
          onSubmit={handleSubmit}
          className={styles.loginPage__form__wrapper}
        >
          <h1 className={styles.loginPage__form__title}>Login</h1>
          <input
            type="text"
            placeholder="Username / Email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            name="username"
            autoComplete="username"
            id="username"
            className={styles.loginPage__form__usernameInput}
          />
          <div className={styles.loginPage__form__passwordInputAndEyeWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              name="password"
              autoComplete="current-password"
              id="current-password"
              onFocus={e => {
                setTimeout(() => {
                  e.target.selectionStart = e.target.selectionEnd = 10000;
                  e.target.scrollLeft = e.target.scrollWidth;
                }, 0);
              }}
              className={`${showPassword ? "" : styles.loginPage__form__passwordInputShowingPassword + " "}${styles.loginPage__form__passwordInput}`}
            />
            <ToggleEye
              className={
                styles.loginPage__form__passwordInput__ToggleVisibilityEye
              }
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
          <div
            className={`${styles.loginPage__form__errorDisplayWrapper} ${errorDisplay !== "" ? styles.loginPage__form__errorDisplayHidden : styles.loginPage__form__errorDisplayShow}`}
          >
            <p className={`${styles.loginPage__form__errorDisplayText}`}>
              {errorDisplay}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`${styles.loginPage__form__loginButton}`}
          >
            Login
          </button>
          <Link to="/register" className={styles.loginPage__form__signupLink}>
            Don't have an account? Sign up here
          </Link>
        </form>
      </div>
    </>
  );
}
