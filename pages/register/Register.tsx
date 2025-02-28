import { ReactNode, useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation } from "../../hooks/useMutation";
import { ToggleEye } from "../login/Login";
import { Link } from "react-router-dom";
import { ActiveContext } from "../contextProvider";

import styles from "./Register.module.css";

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
      <div className={styles.registerPage__bgDiv__wrapper}>
        <div className={styles.registerPage__bgDiv__image}></div>
        <div
          className={styles.registerPage__artistCustomerSelectButton__wrapper}
        >
          <div
            className={`${styles.registerPage__artistCustomerSelectButton__backgroundDiv} ${customerArtistSignUp ? "translate-x-[100%]" : ""}`}
          ></div>
          <button
            className={styles.registerPage__artistCustomerSelectButton__button}
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

        <div
          className={`${styles.registerPage__form_customerArtistWrapper}${customerArtistSignUp ? " " + styles.registerPage__form__customerArtistActive : ""}`}
        >
          {/* Customer sign up form */}
          <form
            onSubmit={handleSubmit}
            className={styles.registerPage__form__wrapper}
          >
            <h1 className={styles.registerPage__form__title}>Customer</h1>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              name="email"
              autoComplete="email"
              id="email"
              className={styles.registerPage__form__usernameInput}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              name="username"
              autoComplete="off"
              id="username"
              className={styles.registerPage__form__usernameInput}
            />
            <div
              className={styles.registerPage__form__passwordInputAndEyeWrapper}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                name="password"
                autoComplete="current-password"
                id="current-password"
                className={`${showPassword ? "" : styles.registerPage__form__passwordInputShowingPassword + " "}${styles.registerPage__form__passwordInput}`}
              />
              <ToggleEye
                className={
                  styles.registerPage__form__passwordInput__ToggleVisibilityEye
                }
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </div>
            <div
              className={styles.registerPage__form__passwordInputAndEyeWrapper}
            >
              <input
                type={showRptPassword ? "text" : "password"}
                placeholder="Repeat Password"
                value={rptPassword}
                onChange={e => setRptPassword(e.target.value)}
                name="rptPassword"
                autoComplete="current-password"
                id="repeat-current-password"
                className={`${showRptPassword ? "" : styles.registerPage__form__passwordInputShowingPassword + " "}${styles.registerPage__form__passwordInput}`}
              />
              <ToggleEye
                className={
                  styles.registerPage__form__passwordInput__ToggleVisibilityEye
                }
                showPassword={showRptPassword}
                setShowPassword={setShowRptPassword}
              />
            </div>
            <div
              className={`${styles.registerPage__form__errorDisplayWrapper} ${errorDisplay !== "" ? styles.registerPage__form__errorDisplayShow : styles.registerPage__form__errorDisplayHidden}`}
            >
              <p className={styles.registerPage__form__errorDisplayText}>
                {errorDisplay}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || loginLoading}
              className={`${styles.registerPage__form__registerButton}`}
            >
              Register
            </button>
            <Link to="/login" className={styles.registerPage__form__loginLink}>
              Already have an account? Login here
            </Link>
          </form>

          {/* Artist sign up form */}
          <form
            onSubmit={handleArtistSubmit}
            className={styles.registerPage__form__wrapper}
          >
            <h1 className={styles.registerPage__form__title}>Artist</h1>
            <input
              type="text"
              placeholder="Email"
              value={artistEmail}
              onChange={e => setArtistEmail(e.target.value)}
              name="email"
              autoComplete="email"
              id="artistEmail"
              className={styles.registerPage__form__usernameInput}
            />
            <input
              type="text"
              placeholder="Username"
              value={artistUsername}
              onChange={e => setArtistUsername(e.target.value)}
              name="username"
              autoComplete="off"
              id="artistUsername"
              className={styles.registerPage__form__usernameInput}
            />
            <div
              className={styles.registerPage__form__passwordInputAndEyeWrapper}
            >
              <input
                type={artistShowPassword ? "text" : "password"}
                placeholder="Password"
                value={artistPassword}
                onChange={e => setArtistPassword(e.target.value)}
                name="password"
                autoComplete="current-password"
                id="artistCurrent-password"
                className={`${showPassword ? "" : styles.registerPage__form__passwordInputShowingPassword + " "}${styles.registerPage__form__passwordInput}`}
              />
              <ToggleEye
                className={
                  styles.registerPage__form__passwordInput__ToggleVisibilityEye
                }
                showPassword={artistShowPassword}
                setShowPassword={setArtistShowPassword}
              />
            </div>
            <div
              className={styles.registerPage__form__passwordInputAndEyeWrapper}
            >
              <input
                type={artistShowRptPassword ? "text" : "password"}
                placeholder="Repeat Password"
                value={artistRptPassword}
                onChange={e => setArtistRptPassword(e.target.value)}
                name="rptPassword"
                autoComplete="current-password"
                id="artistRepeat-current-password"
                className={`${artistShowRptPassword ? "" : styles.registerPage__form__passwordInputShowingPassword + " "}${styles.registerPage__form__passwordInput}`}
              />
              <ToggleEye
                className={
                  styles.registerPage__form__passwordInput__ToggleVisibilityEye
                }
                showPassword={artistShowRptPassword}
                setShowPassword={setArtistShowRptPassword}
              />
            </div>
            <div
              className={`${styles.registerPage__form__errorDisplayWrapper} ${errorDisplay !== "" ? styles.registerPage__form__errorDisplayShow : styles.registerPage__form__errorDisplayHidden}`}
            >
              <p className={styles.registerPage__form__errorDisplayText}>
                {artistErrorDisplay}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || loginLoading}
              className={`${styles.registerPage__form__registerButton}`}
            >
              Register
            </button>
            <Link to="/login" className={styles.registerPage__form__loginLink}>
              Already have an account? Login here
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}
