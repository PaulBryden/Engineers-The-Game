module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        'semi': ['error', 'always'],
        'no-console': 2,
        'quotes': ['error', 'single'],
        'curly': 0,
        'brace-style': ['error', 'stroustrup'],
        'indent': ['error', 4],
        'eol-last': ['error', 'never'],
        '@typescript-eslint/no-namespace': 1,
        '@typescript-eslint/no-unused-vars': 1,
        '@typescript-eslint/no-empty-function': 1,
        'no-empty': 1,
        'no-var':1,
        'no-prototype-builtins':1
    }
};