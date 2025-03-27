import { name, version } from "../package.json";

import functionDefinition from "./rules/function-definition";
import functionName from "./rules/function-name";
import functionReturnBoolean from "./rules/function-return-boolean";

export default {
  meta: {
    name,
    version,
  },
  rules: {
    "function-definition": functionDefinition,
    "function-name": functionName,
    "function-return-boolean": functionReturnBoolean,
  },
} as const;
