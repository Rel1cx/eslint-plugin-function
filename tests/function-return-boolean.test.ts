import path from "node:path";
import { RuleTester } from "@typescript-eslint/rule-tester";
import tsx from "dedent";
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
  invalid: [
    {
      code: tsx`
        function isValid(value: string): boolean {
          return undefined;
        }
      `,
      errors: [
        {
          messageId: "functionReturnBoolean",
          data: {
            functionName: "isValid",
            variants: "'nullish'",
          },
        },
      ],
    },
  ],
  valid: [
    {
      code: tsx`
        function isValid(value: string): boolean {
          return value.length > 0;
        }
      `,
    },
  ],
});
