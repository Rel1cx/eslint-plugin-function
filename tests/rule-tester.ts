import path from "node:path";
import { RuleTester } from "@typescript-eslint/rule-tester";

const rootPath = path.join(__dirname, "./fixtures");

export const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
      sourceType: "module",
      tsconfigRootDir: rootPath,
    },
  },
});
