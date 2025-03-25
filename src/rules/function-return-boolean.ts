import type { RuleContext, RuleFeature } from "@eslint-react/kit";
import type { AST_NODE_TYPES as T, TSESTree } from "@typescript-eslint/types";
import type { RuleListener } from "@typescript-eslint/utils/ts-eslint";
import type { CamelCase } from "string-ts";

import { createRule } from "../utils";

export const RULE_NAME = "function-return-boolean";

export const RULE_FEATURES = [] as const satisfies RuleFeature[];

export type MessageID = CamelCase<typeof RULE_NAME>;

export type Options = [
  | undefined
  | {
    pattern: string;
  },
];

export const defaultOptions: Options = [
  {
    pattern: "is[A-Z].*",
  },
];

export default createRule<Options, MessageID>({
  meta: {
    type: "problem",
    docs: {
      description: "Enforce functions that match the pattern `is[A-Z].*` return a boolean.",
      [Symbol.for("rule_features")]: RULE_FEATURES,
    },
    messages: {
      functionReturnBoolean: "This function should return a boolean.",
    },
    schema: [{
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "The pattern to match function names against.",
        },
      },
      additionalProperties: false,
    }],
  },
  name: RULE_NAME,
  create,
  defaultOptions,
});

export function create(context: RuleContext<MessageID, Options>): RuleListener {
  return {};
}
