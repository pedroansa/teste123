import { configs, defineConfig } from '@arqgen/eslint-configs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(
    {
        ignores: [
            '_dev',
            '.sst',
            'coverage',
            'node_modules',
            '**/node_modules/**',
            '**/dist/**',
            'packages/py',
            'packages/rs',
            'venv',
        ],
    },
    ...configs.base({
        enableHeavyRules: false,
        moduleResolution: 'node10',
        typeChecked: true,
    }),
    {
        files: ['**/*.tsx', '**/*.jsx'],
        extends: [...configs.react()],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['*.mjs', '*.js', 'jest.config.ts'],
                    defaultProject: './tsconfig.json',
                },
                tsconfigRootDir: __dirname,
            },
        },
    },
    {
        files: ['**/*.d.ts'],
        rules: {
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
        },
    },
    ...configs.disableFormatting
);
