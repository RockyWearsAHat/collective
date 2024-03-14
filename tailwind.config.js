const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  //Assumes that all styled pages are located in the ./pages or ./components directory, either directly or in subdirectories.
  content: [
    "./pages/*.{html,js,tsx,jsx}",
    "./pages/**/*.{html,js,tsx,jsx}",
    "./components/*.{html,js,tsx,jsx}",
    "./components/**/*.{html,js,tsx,jsx}"
  ],
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
        nav: "3rem"
      }
    },
    plugins: [require("tailwindcss-3d")]
  }
};
