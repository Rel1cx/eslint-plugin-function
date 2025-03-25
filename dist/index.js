import { ESLintUtils } from '@typescript-eslint/utils';

// package.json
var name = "eslint-plugin-function";
var version = "0.0.1";
function getDocsUrl() {
  return "TODO: add docs for local ESLint rules";
}
var createRule = ESLintUtils.RuleCreator(getDocsUrl);

// src/rules/function-definition.ts
var RULE_NAME = "function-definition";
var RULE_FEATURES = [];
var function_definition_default = createRule({
  meta: {
    type: "problem",
    docs: {
      description: "Enforce a consistent function definition style.",
      [Symbol.for("rule_features")]: RULE_FEATURES
    },
    messages: {
      functionDefinition: ""
    },
    schema: []
  },
  name: RULE_NAME,
  create,
  defaultOptions: []
});
function create(context) {
  return {};
}

// src/rules/function-return-boolean.ts
var RULE_NAME2 = "function-return-boolean";
var RULE_FEATURES2 = [];
var defaultOptions = [
  {
    pattern: "is[A-Z].*"
  }
];
var function_return_boolean_default = createRule({
  meta: {
    type: "problem",
    docs: {
      description: "Enforce functions that match the pattern `is[A-Z].*` return a boolean.",
      [Symbol.for("rule_features")]: RULE_FEATURES2
    },
    messages: {
      functionReturnBoolean: "This function should return a boolean."
    },
    schema: [{
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "The pattern to match function names against."
        }
      },
      additionalProperties: false
    }]
  },
  name: RULE_NAME2,
  create: create2,
  defaultOptions
});
function create2(context) {
  return {};
}

// src/index.ts
var index_default = {
  meta: {
    name,
    version
  },
  rules: {
    "function-definition": function_definition_default,
    "function-return-boolean": function_return_boolean_default
  }
};

export { index_default as default };
