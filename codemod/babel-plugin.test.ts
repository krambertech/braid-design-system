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
    title: 'Visit Braid aliased Box elements',
    code: dedent`
    import { Box as BraidBox } from 'braid-design-system';
    const background = 'card';
    export default () => {
      return (
        <div background="card">
          <Box background={background} boxShadow="standard" />
        </div>
      );
    };`,
    output: dedent`
    import { Box as BraidBox } from 'braid-design-system';
    const background = 'card';
    export default () => {
      return (
        <div background="card">
          <Box background={background} boxShadow="standard" />
        </div>
      );
    };`,
  },
  // {
  //   title: 'Single line, single prop, implicit return',
  //   code: `() => <Box background="card" />;`,
  //   output: `() => <Box background="surface" />;`,
  // },
  // {
  //   title: 'Single line, many props, implicit return',
  //   code: `() => <Box width="full" background="card" />;`,
  //   output: `() => <Box width="full" background="surface" />;`,
  // },
  // {
  //   title: 'Multi-line, single prop, explicit return',
  //   code: dedent`() => {
  //     return <Box background="card" />;
  //   };`,
  //   output: dedent`() => {
  //     return <Box background="surface" />;
  //   };`,
  // },
  // {
  //   title: 'Multi-line, many props, explicit return',
  //   code: dedent`() => {
  //     return (
  //       <Box
  //         paddingLeft="small"
  //         paddingRight="small"
  //         height="full"
  //         width="full"
  //         background="card"
  //       />
  //     );
  //   };`,
  //   output: dedent`() => {
  //     return (
  //       <Box
  //         paddingLeft="small"
  //         paddingRight="small"
  //         height="full"
  //         width="full"
  //         background="surface"
  //       />
  //     );
  //   };`,
  // },
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
