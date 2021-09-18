import pluginTester from 'babel-plugin-tester';
import dedent from 'dedent';

import plugin from './babel-plugin';

// import * as Braid from 'braid-design-system';

const tests: Parameters<typeof pluginTester>[0]['tests'] = [
  {
    title: 'Visit Braid Box elements',
    code: dedent`
    import { Box } from 'braid-design-system';
    export default () => {
      return (
        <div background="card">
          <Box background="card" boxShadow="standard" />
        </div>
      );
    };`,
    output: dedent`
    import { Box } from 'braid-design-system';
    export default () => {
      return (
        <div background="card">
          <Box background="surface" boxShadow="neutralLight" />
        </div>
      );
    };`,
  },
  {
    title: 'Visit Braid aliased Box elements',
    code: dedent`
    import { Box as BraidBox } from 'braid-design-system';
    export default () => {
      return (
        <div background="card">
          <BraidBox background="card" boxShadow="standard" />
        </div>
      );
    };`,
    output: dedent`
    import { Box as BraidBox } from 'braid-design-system';
    export default () => {
      return (
        <div background="card">
          <BraidBox background="surface" boxShadow="neutralLight" />
        </div>
      );
    };`,
  },
  {
    title: 'Dont visit Box elements from other packages',
    code: dedent`
    import { Box } from 'package';
    export default () => {
      return (
        <div background="card">
          <Box background="card" boxShadow="standard" />
        </div>
      );
    };`,
    output: dedent`
    import { Box } from 'package';
    export default () => {
      return (
        <div background="card">
          <Box background="card" boxShadow="standard" />
        </div>
      );
    };`,
  },
  {
    title: 'Follow variables of background props',
    code: dedent`
    import { Box } from 'braid-design-system';
    const bgColor = true ? 'card' : 'body';
    export default () => {
      return (
        <div background="card">
          <Box background={bgColor} boxShadow="standard" />
        </div>
      );
    };`,
    output: dedent`
    import { Box } from 'braid-design-system';
    const bgColor = true ? 'surface' : 'body';
    export default () => {
      return (
        <div background="card">
          <Box background={bgColor} boxShadow="neutralLight" />
        </div>
      );
    };`,
  },
];

pluginTester({
  pluginName: 'babel-plugin-braid-codemod',
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
