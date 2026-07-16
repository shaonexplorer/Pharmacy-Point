import prettier from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "generated/**"],
  },
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended],
    plugins: {
      prettier: prettier,
    },
    rules: {
      "prettier/prettier": "error",
    },
  }
);