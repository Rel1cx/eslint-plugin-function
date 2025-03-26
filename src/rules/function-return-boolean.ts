import type { RuleContext, RuleFeature } from "@eslint-react/kit";
import type { RuleListener } from "@typescript-eslint/utils/ts-eslint";
import * as AST from "@eslint-react/ast";
import { type _ } from "@eslint-react/eff";
import { getConstrainedTypeAtLocation } from "@typescript-eslint/type-utils";

import { AST_NODE_TYPES as T, type TSESTree } from "@typescript-eslint/types";
import { ESLintUtils } from "@typescript-eslint/utils";
import { unionConstituents } from "ts-api-utils";
import { createRule, inspectVariantTypes, toRegExp, type VariantType } from "../utils";

export const RULE_NAME = "function-return-boolean";

export const RULE_FEATURES = [] as const satisfies RuleFeature[];

export type MessageID = "functionReturnBoolean";

type Options = readonly [
  | _
  | {
    readonly pattern?: string; // eslint-disable-line no-restricted-syntax
  },
];

const defaultPattern = "/^(is|should)/u";

export const defaultOptions = [
  {
    pattern: defaultPattern,
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
      description: "Enforce functions that match the pattern `/^(is|should)/u` return a boolean.",
      [Symbol.for("rule_features")]: RULE_FEATURES,
    },
    messages: {
      functionReturnBoolean: "The function '{{functionName}}' should return a boolean value (got {{variants}}).",
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
  const pattern = toRegExp(opts?.pattern ?? defaultPattern);
  const functionEntries: { functionName: _ | string; functionNode: AST.TSESTreeFunction; isMatched: boolean }[] = [];

  function handleReturnExpression(
    context: RuleContext,
    returnExpression: TSESTree.Expression | null,
    onViolation: (expr: TSESTree.Expression | null, data: { variants: string }) => void,
  ) {
    if (returnExpression == null) {
      onViolation(returnExpression, { variants: "nullish" });
      return;
    }
    const returnType = getConstrainedTypeAtLocation(services, returnExpression);
    const parts = inspectVariantTypes(unionConstituents(returnType));
    if (allowedVariants.some((variant) => parts.has(variant))) return;
    onViolation(returnExpression, {
      variants: [...parts]
        .map((part) => `'${part}'`)
        .join(", "),
    });
  }

  return {
    [":function"](node: AST.TSESTreeFunction) {
      const functionName = AST.getFunctionIdentifier(node)?.name;
      const isMatched = functionName != null && pattern.test(functionName);
      functionEntries.push({ functionName, functionNode: node, isMatched });
    },
    [":function:exit"]() {
      functionEntries.pop();
    },
    ["ArrowFunctionExpression"](node: TSESTree.ArrowFunctionExpression) {
      const { functionName, isMatched = false } = functionEntries.at(-1) ?? {};
      if (functionName == null || !isMatched) return;
      if (node.body.type === T.BlockStatement) return;
      handleReturnExpression(context, node.body, (expr, data) => {
        context.report({
          messageId: "functionReturnBoolean",
          node: expr ?? node,
          data: {
            ...data,
            functionName,
          },
        });
      });
    },
    ["ReturnStatement"](node) {
      const { functionName, functionNode, isMatched = false } = functionEntries.at(-1) ?? {};
      if (functionName == null || functionNode == null || !isMatched) return;
      handleReturnExpression(context, node.argument, (expr, data) => {
        const functionName = AST.getFunctionIdentifier(functionNode)?.name;
        if (functionName == null) return;
        context.report({
          messageId: "functionReturnBoolean",
          node: expr ?? node.argument ?? node,
          data: {
            ...data,
            functionName,
          },
        });
      });
    },
  };
}
