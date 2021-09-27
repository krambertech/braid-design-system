import { parse, print } from 'recast';
import { transformFromAstSync, parseSync } from '@babel/core';
import { Transform, API } from 'jscodeshift';
import prettier from 'prettier';

import atomsPlugin from './plugin-deprecate/plugin-deprecate-atoms';
import propsPlugin from './plugin-deprecate/plugin-deprecate-props';
import varsPlugin from './plugin-deprecate/plugin-deprecate-vars';

export function babelRecast(
  code: string,
  filename: string,
  report: API['report'],
) {
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
    configFile: false,
    babelrc: false,
    code: false,
    ast: true,
    filename,
    plugins: [propsPlugin, atomsPlugin, varsPlugin],
  };

  const { ast: transformedAST, ...rest } = transformFromAstSync(
    ast,
    code,
    options,
  );

  // @ts-expect-error
  const warnings = rest.metadata.warnings;
  if (warnings.length > 0) {
    report(warnings.join('\n'));
  }

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

const jsCodeShift: Transform = (file, api) =>
  babelRecast(file.source, file.path, api.report);

export default jsCodeShift;
