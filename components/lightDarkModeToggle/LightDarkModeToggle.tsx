import { FC, useEffect, useState } from "react";

export const LightDarkModeToggle: FC = () => {
  function getColorSchemePreference() {
    if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      } else {
        return "light";
      }
    }
    return "light";
  }

  const [theme, setTheme] = useState(getColorSchemePreference());

  useEffect(() => {
    document.getElementById("root")?.setAttribute("theme", theme);
    setTheme(theme == "light" ? "dark" : "light");
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
      background-color var(--lightDarkColorSwapTime)
        var(--lightDarkColorSwapEasing) 0ms,
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

  useEffect(() => {
    timeout = setTimeout(() => {
      document.getElementById("lightDarkModeTransitionStyles")?.remove();
    }, timeoutTime);
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
          checked={theme == "light"}
          onChange={() => {
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
