/** @type {import("prettier").Config} */
module.exports = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.js", // optional
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
};
