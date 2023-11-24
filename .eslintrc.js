const { extendConfig } = require("@aet/eslint-rules")

module.exports = extendConfig({
  plugins: ["react", "react-hooks", "unicorn"],
  rules: {
    "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
  },
})
