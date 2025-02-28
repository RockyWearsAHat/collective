import { FC, useEffect, useState } from "react";
import { useMutation } from "../../hooks/useMutation";

export const LightDarkModeToggle: FC = () => {
  const { fn: fetchLoggedInUserColorScheme } = useMutation({
    url: "/api/user/getColorSchemePreference",
    method: "GET",
    cache: "no-cache"
  });

  async function getColorSchemePreference() {
    const userColorScheme = await fetchLoggedInUserColorScheme();
    console.log(`got color scheme preference ${userColorScheme}`);

    if (userColorScheme.setColorScheme) {
      if (userColorScheme.colorScheme == "light") {
        return "light";
      } else {
        return "dark";
      }
    }

    if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      } else {
        return "light";
      }
    }
    return "light";
  }

  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const func = async () => {
      const userColorScheme = await getColorSchemePreference();
      // console.log("testing " + userColorScheme);
      setTheme(userColorScheme);
      document.getElementById("root")?.setAttribute("theme", userColorScheme);
      // setTheme(userColorScheme == "light" ? "dark" : "light");
    };

    func();
  }, []);

  let timeout: NodeJS.Timeout;

  const computedTimeoutTimeFromCSS = getComputedStyle(
    document.querySelector(":root")!
  ).getPropertyValue("--lightDarkColorSwapTime");

  let timeoutTime: number = 0;

  if (computedTimeoutTimeFromCSS.indexOf("ms") != -1) {
    timeoutTime = parseInt(
      computedTimeoutTimeFromCSS.substring(
        0,
        computedTimeoutTimeFromCSS.indexOf("ms")
      )
    );
  } else {
    timeoutTime = parseInt(
      computedTimeoutTimeFromCSS.substring(
        0,
        computedTimeoutTimeFromCSS.indexOf("s")
      )
    );

    timeoutTime *= 1000;
  }

  const style = document.createElement("style");
  style.textContent = `
  *,
  *::before,
  *::after,
  *::placeholder {
    transition:
      color var(--lightDarkColorSwapTime) var(--lightDarkColorSwapEasing) 0ms,
      border var(--lightDarkColorSwapTime) var(--lightDarkColorSwapEasing) 0ms,
      background-color var(--lightDarkColorSwapTime) var(--lightDarkColorSwapEasing) 0ms,
      box-shadow var(--lightDarkColorSwapTime) var(--lightDarkColorSwapEasing) 0ms !important;
  }

  *[stroke="currentColor"],
  *[fill="currentColor"] {
    transition:
      color var(--lightDarkColorSwapTime) var(--lightDarkColorSwapEasing) 0ms,
      fill var(--lightDarkColorSwapTime) var(--lightDarkColorSwapEasing) 0ms,
      stroke var(--lightDarkColorSwapTime) var(--lightDarkColorSwapEasing) 0ms !important;
  }`;

  style.id = "lightDarkModeTransitionStyles";

  const { fn: setColorSchemePreference } = useMutation({
    url: "/api/user/setColorSchemePreference",
    method: "POST",
    cache: "no-cache"
  });

  useEffect(() => {
    // console.log("Theme changed");
    timeout = setTimeout(() => {
      document.getElementById("lightDarkModeTransitionStyles")?.remove();
    }, timeoutTime);

    // console.log(`setting color scheme preference to ${theme}`);
    setColorSchemePreference({ colorScheme: theme });

    return () => clearTimeout(timeout);
  }, [theme]);

  return (
    <div className="flex items-center justify-end pr-1">
      <label htmlFor="toggle" className="pr-2 text-white">
        Dark Mode
      </label>
      <div>
        <input
          type="checkbox"
          name="toggle"
          id="toggle"
          checked={theme == "light" ? false : true}
          onChange={async function () {
            // console.log(theme);
            setColorSchemePreference({ colorScheme: theme });
            document.getElementById("root")?.setAttribute("theme", theme);
            setTheme(theme == "light" ? "dark" : "light");
            if (
              document.getElementById("lightDarkModeTransitionStyles") == null
            ) {
              document.head.appendChild(style);
            }
          }}
        />
      </div>
    </div>
  );
};
