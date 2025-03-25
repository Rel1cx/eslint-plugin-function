import path from "node:path";
import { RuleTester } from "@typescript-eslint/rule-tester";
import functionReturnType from "../src/rules/function-return-boolean";

const rootPath = path.join(__dirname, "./fixtures");

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
      sourceType: "module",
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run("function-return-boolean", functionReturnType, {
  invalid: [],
  valid: [
    {
      code: `
        function isValid(value: string): boolean {
          return value.length > 0;
        }
      `,
    },
  ],
});
