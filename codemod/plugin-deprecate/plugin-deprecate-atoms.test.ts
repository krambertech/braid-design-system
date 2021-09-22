import pluginTester from 'babel-plugin-tester';
import dedent from 'dedent';

import plugin from './plugin-deprecate-atoms';

const tests: Parameters<typeof pluginTester>[0]['tests'] = [
  {
    title: 'Visit Braid function calls',
    code: dedent`
      import { atoms } from 'braid-design-system/css';
      const className = atoms({
        boxShadow: 'borderStandard',
      });`,
    output: dedent`
      import { atoms } from 'braid-design-system/css';
      const className = atoms({
        boxShadow: 'borderNeutralLight',
      });`,
  },
  {
    title: 'Visit Braid aliased function calls',
    code: dedent`
      import { atoms as sprinkles } from 'braid-design-system/css';
      const className = sprinkles({
        boxShadow: 'borderStandard',
      });`,
    output: dedent`
      import { atoms as sprinkles } from 'braid-design-system/css';
      const className = sprinkles({
        boxShadow: 'borderNeutralLight',
      });`,
  },
  {
    title: 'Follow variables in object literals in function calls',
    code: dedent`
      import { atoms as sprinkles } from 'braid-design-system/css';
      const standardBorder = 'borderStandard';
      const hoverBorder = 'borderFormHover';
      const borderColor = true ? standardBorder : hoverBorder;
      const className = sprinkles({
        boxShadow: borderColor,
      });`,
    output: dedent`
      import { atoms as sprinkles } from 'braid-design-system/css';
      const standardBorder = 'borderNeutralLight';
      const hoverBorder = 'borderFormAccent';
      const borderColor = true ? standardBorder : hoverBorder;
      const className = sprinkles({
        boxShadow: borderColor,
      });`,
  },
  {
    title: 'Follow variable as argument in function calls',
    code: dedent`
      import { atoms as sprinkles } from 'braid-design-system/css';
      const standardBorder = 'borderStandard';
      const hoverBorder = 'borderFormHover';
      const borderColor = true ? standardBorder : hoverBorder;
      const properties = {
        boxShadow: borderColor,
      };
      const className = sprinkles(properties);`,
    output: dedent`
      import { atoms as sprinkles } from 'braid-design-system/css';
      const standardBorder = 'borderNeutralLight';
      const hoverBorder = 'borderFormAccent';
      const borderColor = true ? standardBorder : hoverBorder;
      const properties = {
        boxShadow: borderColor,
      };
      const className = sprinkles(properties);`,
  },
];

pluginTester({
  pluginName: 'babel-plugin-deprecate-atoms',
  plugin,
  babelOptions: {
    filename: 'test-file.tsx',
    plugins: [
      '@babel/plugin-syntax-jsx',
      ['@babel/plugin-syntax-typescript', { isTSX: true }],
    ],
  },
  tests,
});
