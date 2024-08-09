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
    return "light"; // default to light if media queries are not supported
  }

  const [theme, setTheme] = useState(getColorSchemePreference());

  useEffect(() => {
    document.getElementById("root")?.setAttribute("theme", theme);
    setTheme(theme == "light" ? "dark" : "light");
  }, []);

  return (
    <div className="absolute flex">
      <div>
        <input
          type="checkbox"
          name="toggle"
          id="toggle"
          onClick={() => {
            document.getElementById("root")?.setAttribute("theme", theme);
            setTheme(theme == "light" ? "dark" : "light");
          }}
        />
      </div>
      <label htmlFor="toggle" className="text-white">
        Dark Mode
      </label>
    </div>
  );
};
