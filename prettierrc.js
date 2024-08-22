const path = require("path");

const plugins = [];
const filePaths = ["js", "json", "md", "ts", "yaml", "yml"];
const overrides = [];

module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: "all",
  tabWidth: 2,
  semi: true,
  filepath: path.join(process.cwd(), `**/*.{${filePaths.join(",")}}`),
  plugins,
  overrides,
};
