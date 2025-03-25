import * as _typescript_eslint_utils_ts_eslint from '@typescript-eslint/utils/ts-eslint';

type Options = [
    undefined | {
        pattern: string;
    }
];

declare const _default: {
    readonly meta: {
        readonly name: string;
        readonly version: string;
    };
    readonly rules: {
        readonly "function-definition": _typescript_eslint_utils_ts_eslint.RuleModule<"functionDefinition", [], unknown, _typescript_eslint_utils_ts_eslint.RuleListener>;
        readonly "function-return-boolean": _typescript_eslint_utils_ts_eslint.RuleModule<"functionReturnBoolean", Options, unknown, _typescript_eslint_utils_ts_eslint.RuleListener>;
    };
};

export { _default as default };
