import { ESLintUtils } from '@typescript-eslint/utils';
import { unionConstituents, isTypeFlagSet, isTrueLiteralType, isFalseLiteralType } from 'ts-api-utils';
import { match, isMatching, P } from 'ts-pattern';
import ts from 'typescript';
import * as AST from '@eslint-react/ast';
import { getConstrainedTypeAtLocation } from '@typescript-eslint/type-utils';

// package.json
var name = "eslint-plugin-function";
var version = "0.0.3";
function getDocsUrl() {
  return "TODO: add docs for local ESLint rules";
}
var createRule = ESLintUtils.RuleCreator(getDocsUrl);
var tsHelpers = {
  isAnyType: (type) => isTypeFlagSet(type, ts.TypeFlags.TypeParameter | ts.TypeFlags.Any),
  isBigIntType: (type) => isTypeFlagSet(type, ts.TypeFlags.BigIntLike),
  isBooleanType: (type) => isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
  isEnumType: (type) => isTypeFlagSet(type, ts.TypeFlags.EnumLike),
  isFalsyBigIntType: (type) => type.isLiteral() && isMatching({ value: { base10Value: "0" } }, type),
  isFalsyNumberType: (type) => type.isNumberLiteral() && type.value === 0,
  isFalsyStringType: (type) => type.isStringLiteral() && type.value === "",
  isNeverType: (type) => isTypeFlagSet(type, ts.TypeFlags.Never),
  isNullishType: (type) => isTypeFlagSet(
    type,
    ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.VoidLike
  ),
  isNumberType: (type) => isTypeFlagSet(type, ts.TypeFlags.NumberLike),
  isObjectType: (type) => !isTypeFlagSet(
    type,
    ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.VoidLike | ts.TypeFlags.BooleanLike | ts.TypeFlags.StringLike | ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike | ts.TypeFlags.TypeParameter | ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never
  ),
  isStringType: (type) => isTypeFlagSet(type, ts.TypeFlags.StringLike),
  isTruthyBigIntType: (type) => type.isLiteral() && isMatching({ value: { base10Value: P.not("0") } }, type),
  isTruthyNumberType: (type) => type.isNumberLiteral() && type.value !== 0,
  isTruthyStringType: (type) => type.isStringLiteral() && type.value !== "",
  isUnknownType: (type) => isTypeFlagSet(type, ts.TypeFlags.Unknown)
};

// src/utils/inspect-variant-types.ts
function inspectVariantTypes(types) {
  const variantTypes = /* @__PURE__ */ new Set();
  if (types.some(tsHelpers.isUnknownType)) {
    variantTypes.add("unknown");
    return variantTypes;
  }
  if (types.some(tsHelpers.isNullishType)) {
    variantTypes.add("nullish");
  }
  const booleans = types.filter(tsHelpers.isBooleanType);
  switch (true) {
    case (booleans.length === 1 && booleans[0] != null): {
      const first = booleans[0];
      if (isTrueLiteralType(first)) {
        variantTypes.add("truthy boolean");
      } else if (isFalseLiteralType(first)) {
        variantTypes.add("falsy boolean");
      }
      break;
    }
    case booleans.length === 2: {
      variantTypes.add("boolean");
      break;
    }
  }
  const strings = types.filter(tsHelpers.isStringType);
  if (strings.length > 0) {
    const evaluated = match(strings).when((types2) => types2.every(tsHelpers.isTruthyStringType), () => "truthy string").when((types2) => types2.every(tsHelpers.isFalsyStringType), () => "falsy string").otherwise(() => "string");
    variantTypes.add(evaluated);
  }
  const bigints = types.filter(tsHelpers.isBigIntType);
  if (bigints.length > 0) {
    const evaluated = match(bigints).when((types2) => types2.every(tsHelpers.isTruthyBigIntType), () => "truthy bigint").when((types2) => types2.every(tsHelpers.isFalsyBigIntType), () => "falsy bigint").otherwise(() => "bigint");
    variantTypes.add(evaluated);
  }
  const numbers = types.filter(tsHelpers.isNumberType);
  if (numbers.length > 0) {
    const evaluated = match(numbers).when((types2) => types2.every(tsHelpers.isTruthyNumberType), () => "truthy number").when((types2) => types2.every(tsHelpers.isFalsyNumberType), () => "falsy number").otherwise(() => "number");
    variantTypes.add(evaluated);
  }
  if (types.some(tsHelpers.isEnumType)) {
    variantTypes.add("enum");
  }
  if (types.some(tsHelpers.isObjectType)) {
    variantTypes.add("object");
  }
  if (types.some(tsHelpers.isAnyType)) {
    variantTypes.add("any");
  }
  if (types.some(tsHelpers.isNeverType)) {
    variantTypes.add("never");
  }
  return variantTypes;
}

// src/utils/regexp.ts
var RE_REGEXP_STR = /^\/(.+)\/([A-Za-z]*)$/u;
function toRegExp(string) {
  const [, pattern, flags = "u"] = RE_REGEXP_STR.exec(string) ?? [];
  if (pattern) return new RegExp(pattern, flags);
  return { test: (s) => s === string };
}

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
var RULE_NAME2 = "function-return-boolean";
var RULE_FEATURES2 = [];
var defaultOptions = [
  {
    pattern: "/^is[A-Z].*/u"
  }
];
var allowedVariants = [
  "boolean",
  "falsy boolean",
  "truthy boolean"
];
var function_return_boolean_default = createRule({
  meta: {
    type: "problem",
    docs: {
      description: "Enforce functions that match the pattern `/^is[A-Z].*/` return a boolean.",
      [Symbol.for("rule_features")]: RULE_FEATURES2
    },
    messages: {
      functionReturnBoolean: "The function '{{name}}' should return a boolean value (got {{variants}})."
    },
    schema: [{
      type: "object",
      additionalProperties: false,
      properties: {
        pattern: {
          type: "string",
          description: "The pattern to match function names against."
        }
      }
    }]
  },
  name: RULE_NAME2,
  create: create2,
  defaultOptions
});
function create2(context, [opts]) {
  const services = ESLintUtils.getParserServices(context, false);
  const pattern = toRegExp(opts?.pattern ?? "/^is[A-Z].*/u");
  const functions = [];
  return {
    [":function"](node) {
      functions.push(node);
    },
    [":function:exit"]() {
      functions.pop();
    },
    ["ArrowFunctionExpression[type][body.type!='BlockStatement']"](node) {
    },
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
          variants: [...parts].map((part) => `'${part}'`).join(", ")
        }
      });
    }
  };
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
