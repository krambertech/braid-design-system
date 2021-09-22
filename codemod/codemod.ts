import { parse, print } from 'recast';
import { transformFromAstSync, parseSync } from '@babel/core';
import { Transform } from 'jscodeshift';

import boxPlugin, { varsPlugin } from './prop-deprecation/babel-plugin';

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
    plugins: [boxPlugin, varsPlugin],
  };

  const { ast: transformedAST } = transformFromAstSync(ast, code, options);
  const result = print(transformedAST).code;

  return result;
}

const jsCodeShift: Transform = (file) => babelRecast(file.source, file.path);

export default jsCodeShift;
