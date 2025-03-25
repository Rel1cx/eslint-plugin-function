import type ts from "typescript";
import { isFalseLiteralType, isTrueLiteralType } from "ts-api-utils";
import { match } from "ts-pattern";
import { tsHelpers } from "./ts-helpers";

export type VariantType =
  | "any"
  | "bigint"
  | "boolean"
  | "enum"
  | "never"
  | "nullish"
  | "number"
  | "object"
  | "string"
  | "unknown"
  | "falsy bigint"
  | "falsy boolean"
  | "falsy number"
  | "falsy string"
  | "truthy bigint"
  | "truthy boolean"
  | "truthy number"
  | "truthy string";

/**
 * Ported from https://github.com/typescript-eslint/typescript-eslint/blob/eb736bbfc22554694400e6a4f97051d845d32e0b/packages/eslint-plugin/src/rules/strict-boolean-expressions.ts#L826 with some enhancements
 * Check union variants for the types we care about
 * @param types The types to inspect
 * @returns The variant types found
 */
export function inspectVariantTypes(types: ts.Type[]) {
  const variantTypes = new Set<VariantType>();
  if (types.some(tsHelpers.isUnknownType)) {
    variantTypes.add("unknown");
    return variantTypes;
  }
  if (types.some(tsHelpers.isNullishType)) {
    variantTypes.add("nullish");
  }
  const booleans = types.filter(tsHelpers.isBooleanType);
  // If incoming type is either "true" or "false", there will be one type
  // object with intrinsicName set accordingly
  // If incoming type is boolean, there will be two type objects with
  // intrinsicName set "true" and "false" each because of ts-api-utils.unionTypeParts()
  switch (true) {
    case booleans.length === 1 && booleans[0] != null: {
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
    const evaluated = match<ts.Type[], VariantType>(strings)
      .when((types) => types.every(tsHelpers.isTruthyStringType), () => "truthy string")
      .when((types) => types.every(tsHelpers.isFalsyStringType), () => "falsy string")
      .otherwise(() => "string" as const);
    variantTypes.add(evaluated);
  }
  const bigints = types.filter(tsHelpers.isBigIntType);
  if (bigints.length > 0) {
    const evaluated = match<ts.Type[], VariantType>(bigints)
      .when((types) => types.every(tsHelpers.isTruthyBigIntType), () => "truthy bigint")
      .when((types) => types.every(tsHelpers.isFalsyBigIntType), () => "falsy bigint")
      .otherwise(() => "bigint");
    variantTypes.add(evaluated);
  }
  const numbers = types.filter(tsHelpers.isNumberType);
  if (numbers.length > 0) {
    const evaluated = match<ts.Type[], VariantType>(numbers)
      .when((types) => types.every(tsHelpers.isTruthyNumberType), () => "truthy number")
      .when((types) => types.every(tsHelpers.isFalsyNumberType), () => "falsy number")
      .otherwise(() => "number" as const);
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
