module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/prefer-as-const': 'error',
        '@typescript-eslint/no-non-null-assertion': 'warn',

        // General code quality rules
        'no-var': 'error',
        'prefer-const': 'error',
        'no-console': 'warn',
        'no-debugger': 'error',

        // Naming conventions
        'camelcase': ['error', { properties: 'never' }],

        // Code style
        'prefer-template': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-spacing': 'error',
        'no-duplicate-imports': 'error',

        // Early returns
        'no-else-return': 'error',
        'no-return-await': 'error',

        // Unused variables
        'no-unused-vars': 'off', // Handled by TypeScript
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
            env: {
                jest: true,
            },
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
    ],
};


