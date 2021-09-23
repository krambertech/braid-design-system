import { parse, print } from 'recast';
import { transformFromAstSync, parseSync } from '@babel/core';
import { Transform } from 'jscodeshift';
import prettier from 'prettier';

import atomsPlugin from './plugin-deprecate/plugin-deprecate-atoms';
import propsPlugin from './plugin-deprecate/plugin-deprecate-props';
import varsPlugin from './plugin-deprecate/plugin-deprecate-vars';

export function babelRecast(code: string, filename: string) {
  const ast = parse(code, {
    parser: {
      parse: (source: string) =>
        parseSync(source, {
          plugins: [`@babel/plugin-syntax-jsx`],
          overrides: [
            {
              test: [`**/*.ts`, `**/*.tsx`],
              plugins: [[`@babel/plugin-syntax-typescript`, { isTSX: true }]],
            },
          ],
          filename,
          parserOpts: {
            tokens: true,
          },
        }),
    },
  });

  const options = {
    cloneInputAst: false,
    code: false,
    ast: true,
    filename,
    plugins: [propsPlugin, atomsPlugin, varsPlugin],
  };

  const { ast: transformedAST } = transformFromAstSync(ast, code, options);
  const result = print(transformedAST).code;

  return filename.endsWith('.less.d.ts') || filename.endsWith('.vocab/index.ts')
    ? result
    : prettier.format(result, {
        parser: 'babel-ts',
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
      });
}

const jsCodeShift: Transform = (file) => babelRecast(file.source, file.path);

export default jsCodeShift;
