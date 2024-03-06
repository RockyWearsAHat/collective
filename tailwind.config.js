const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  //Assumes that all styled pages are located in the ./pages directory, either directly or in subdirectories.
  content: ["./pages/*.{html,js,tsx,jsx}", "./pages/**/*.{html,js,tsx,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Ojuju", ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
