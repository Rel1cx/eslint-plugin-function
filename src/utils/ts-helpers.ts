import { isTypeFlagSet } from "ts-api-utils";
import { isMatching, P } from "ts-pattern";
import ts from "typescript";

export const tsHelpers = {
  isAnyType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.TypeParameter | ts.TypeFlags.Any),
  isBigIntType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.BigIntLike),
  isBooleanType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
  isEnumType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.EnumLike),
  isFalsyBigIntType: (type: ts.Type) => type.isLiteral() && isMatching({ value: { base10Value: "0" } }, type),
  isFalsyNumberType: (type: ts.Type) => type.isNumberLiteral() && type.value === 0,
  isFalsyStringType: (type: ts.Type) => type.isStringLiteral() && type.value === "",
  isNeverType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.Never),
  isNullishType: (type: ts.Type) =>
    isTypeFlagSet(
      type,
      ts.TypeFlags.Null
        | ts.TypeFlags.Undefined
        | ts.TypeFlags.VoidLike,
    ),
  isNumberType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.NumberLike),
  isObjectType: (type: ts.Type) =>
    !isTypeFlagSet(
      type,
      ts.TypeFlags.Null
        | ts.TypeFlags.Undefined
        | ts.TypeFlags.VoidLike
        | ts.TypeFlags.BooleanLike
        | ts.TypeFlags.StringLike
        | ts.TypeFlags.NumberLike
        | ts.TypeFlags.BigIntLike
        | ts.TypeFlags.TypeParameter
        | ts.TypeFlags.Any
        | ts.TypeFlags.Unknown
        | ts.TypeFlags.Never,
    ),
  isStringType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.StringLike),
  isTruthyBigIntType: (type: ts.Type) => type.isLiteral() && isMatching({ value: { base10Value: P.not("0") } }, type),
  isTruthyNumberType: (type: ts.Type) => type.isNumberLiteral() && type.value !== 0,
  isTruthyStringType: (type: ts.Type) => type.isStringLiteral() && type.value !== "",
  isUnknownType: (type: ts.Type) => isTypeFlagSet(type, ts.TypeFlags.Unknown),
} as const;
