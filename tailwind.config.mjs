import defaultTheme from "tailwindcss/defaultTheme";

module.exports = {
  //Assumes that all styled pages are located in the ./pages or ./components directory, either directly or in subdirectories.
  content: [
    "./{pages,components}/*.{html,js,tsx,jsx}",
    "./{pages,components}/**/*.{html,js,tsx,jsx}"
  ],
  safelist: [],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Ojuju", ...defaultTheme.fontFamily.sans],
        password: ["Verdana", "sans-serif", ...defaultTheme.fontFamily.sans]
      },
      perspective: {
        10: "10px"
      },
      padding: {
        nav: "2.5rem"
      },
      gridTemplateRows: {
        0: "0fr",
        1: "1fr",
        autofit: "min-content"
      }
    },
    plugins: []
  }
};
