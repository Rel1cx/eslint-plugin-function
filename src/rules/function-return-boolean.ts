/* eslint-disable no-restricted-syntax */
import type { _ } from "@eslint-react/eff";
import type { RuleContext, RuleFeature } from "@eslint-react/kit";
import type { AST_NODE_TYPES as T, TSESTree } from "@typescript-eslint/types";
import type { RuleListener } from "@typescript-eslint/utils/ts-eslint";
import type { CamelCase } from "string-ts";
import * as AST from "@eslint-react/ast";

import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";
import { ESLintUtils, type ParserServicesWithTypeInformation } from "@typescript-eslint/utils";
import { isFalseLiteralType, isTrueLiteralType, isTypeFlagSet, unionConstituents } from "ts-api-utils";
import { isMatching, P } from "ts-pattern";
import ts from "typescript";
import { createRule, inspectVariantTypes, toRegExp, type VariantType } from "../utils";

export const RULE_NAME = "function-return-boolean";

export const RULE_FEATURES = [] as const satisfies RuleFeature[];

export type MessageID = CamelCase<typeof RULE_NAME>;

type Options = readonly [
  | _
  | {
    readonly pattern?: string;
  },
];

export const defaultOptions = [
  {
    pattern: "/^is[A-Z].*/u",
  },
] as const satisfies Options;

// Allowed left node type variants
const allowedVariants = [
  "boolean",
  "falsy boolean",
  "truthy boolean",
] as const satisfies VariantType[];

export default createRule<Options, MessageID>({
  meta: {
    type: "problem",
    docs: {
      description: "Enforce functions that match the pattern `/^is[A-Z].*/` return a boolean.",
      [Symbol.for("rule_features")]: RULE_FEATURES,
    },
    messages: {
      functionReturnBoolean: "The function '{{name}}' should return a boolean value (got {{variants}}).",
    },
    schema: [{
      type: "object",
      additionalProperties: false,
      properties: {
        pattern: {
          type: "string",
          description: "The pattern to match function names against.",
        },
      },
    }],
  },
  name: RULE_NAME,
  create,
  defaultOptions,
});

export function create(context: RuleContext<MessageID, Options>, [opts]: Options): RuleListener {
  const services = ESLintUtils.getParserServices(context, false);

  const pattern = toRegExp(opts?.pattern ?? "/^is[A-Z].*/u");
  const functions: AST.TSESTreeFunction[] = [];

  return {
    [":function"](node: AST.TSESTreeFunction) {
      functions.push(node);
    },
    [":function:exit"]() {
      functions.pop();
    },
    ["ArrowFunctionExpression[type][body.type!='BlockStatement']"](node: TSESTree.ArrowFunctionExpression) {},
    ["ReturnStatement"](node) {
      const functionNode = functions.at(-1);
      if (functionNode == null) return;
      const functionName = AST.getFunctionIdentifier(functionNode)?.name;
      if (functionName == null) return;
      if (!pattern.test(functionName)) return;

      if (node.argument == null) {
        context.report({ messageId: "functionReturnBoolean", node });
        return;
      }

      const returnType = getConstrainedTypeAtLocation(services, node.argument);
      const parts = inspectVariantTypes(unionConstituents(returnType));
      if (allowedVariants.some((variant) => parts.has(variant))) return;
      context.report({
        messageId: "functionReturnBoolean",
        node,
        data: {
          name: functionName,
          variants: [...parts]
            .map((part) => `'${part}'`)
            .join(", "),
        },
      });
    },
  };
}
