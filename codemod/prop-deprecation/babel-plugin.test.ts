import pluginTester from 'babel-plugin-tester';
import dedent from 'dedent';

import { varsPlugin as plugin } from './babel-plugin';

const tests: Parameters<typeof pluginTester>[0]['tests'] = [
  // {
  //   title: 'Visit Braid Box elements',
  //   code: dedent`
  //   import { Box } from 'braid-design-system';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background="card" boxShadow="standard" />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'braid-design-system';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background="surface" boxShadow="neutralLight" />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Visit Braid aliased Box elements',
  //   code: dedent`
  //   import { Box as BraidBox } from 'braid-design-system';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <BraidBox background="card" boxShadow="standard" />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box as BraidBox } from 'braid-design-system';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <BraidBox background="surface" boxShadow="neutralLight" />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Visit Braid Box elements used as a member expression',
  //   code: dedent`
  //   import * as Braid from 'braid-design-system';
  //   import Box from 'braid-design-system2';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Braid.Box background="card" boxShadow="standard" />
  //         <Box background="card" boxShadow="standard" />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import * as Braid from 'braid-design-system';
  //   import Box from 'braid-design-system2';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Braid.Box background="surface" boxShadow="neutralLight" />
  //         <Box background="card" boxShadow="standard" />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Dont visit Box elements from other packages',
  //   code: dedent`
  //   import { Box } from 'package';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background="card" boxShadow="standard" />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'package';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background="card" boxShadow="standard" />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Follow variables of background props',
  //   code: dedent`
  //   import { Box } from 'braid-design-system';
  //   const bgColor = true ? 'card' : 'body';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background={bgColor} boxShadow="standard" />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'braid-design-system';
  //   const bgColor = true ? 'surface' : 'body';
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background={bgColor} boxShadow="neutralLight" />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Follow multiple layers of variables of background props',
  //   code: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'card';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background={bgColor} boxShadow={'standard'} />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'surface';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background={bgColor} boxShadow={'neutralLight'} />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Follow spread object with non-computed keys as props',
  //   code: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'card';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   const boxProps = {
  //     background: bgColor,
  //   };
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box {...boxProps} />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'surface';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   const boxProps = {
  //     background: bgColor,
  //   };
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box {...boxProps} />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Follow spread object with computed string literal keys as props',
  //   code: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'card';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   const boxProps = {
  //     ['background']: bgColor,
  //   };
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box {...boxProps} />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'surface';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   const boxProps = {
  //     ['background']: bgColor,
  //   };
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box {...boxProps} />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Follow spread object literal as props',
  //   code: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'card';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box {...{
  //             background: bgColor,
  //           }}
  //         />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'braid-design-system';
  //   const cardBackground = 'surface';
  //   const bodyBackground = 'body';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box
  //           {...{
  //             background: bgColor,
  //           }}
  //         />
  //       </div>
  //     );
  //   };`,
  // },
  // {
  //   title: 'Visit Braid function calls',
  //   code: dedent`
  //     import { atoms } from 'braid-design-system/css';
  //     const className = atoms({
  //       boxShadow: 'borderStandard',
  //     });`,
  //   output: dedent`
  //     import { atoms } from 'braid-design-system/css';
  //     const className = atoms({
  //       boxShadow: 'borderNeutralLight',
  //     });`,
  // },
  // {
  //   title: 'Visit Braid aliased function calls',
  //   code: dedent`
  //     import { atoms as sprinkles } from 'braid-design-system/css';
  //     const className = sprinkles({
  //       boxShadow: 'borderStandard',
  //     });`,
  //   output: dedent`
  //     import { atoms as sprinkles } from 'braid-design-system/css';
  //     const className = sprinkles({
  //       boxShadow: 'borderNeutralLight',
  //     });`,
  // },
  // {
  //   title: 'Follow variables in object literals in function calls',
  //   code: dedent`
  //     import { atoms as sprinkles } from 'braid-design-system/css';
  //     const standardBorder = 'borderStandard';
  //     const hoverBorder = 'borderFormHover';
  //     const borderColor = true ? standardBorder : hoverBorder;
  //     const className = sprinkles({
  //       boxShadow: borderColor,
  //     });`,
  //   output: dedent`
  //     import { atoms as sprinkles } from 'braid-design-system/css';
  //     const standardBorder = 'borderNeutralLight';
  //     const hoverBorder = 'borderFormAccent';
  //     const borderColor = true ? standardBorder : hoverBorder;
  //     const className = sprinkles({
  //       boxShadow: borderColor,
  //     });`,
  // },
  // {
  //   title: 'Follow variable as argument in function calls',
  //   code: dedent`
  //     import { atoms as sprinkles } from 'braid-design-system/css';
  //     const standardBorder = 'borderStandard';
  //     const hoverBorder = 'borderFormHover';
  //     const borderColor = true ? standardBorder : hoverBorder;
  //     const properties = {
  //       boxShadow: borderColor,
  //     };
  //     const className = sprinkles(properties);`,
  //   output: dedent`
  //     import { atoms as sprinkles } from 'braid-design-system/css';
  //     const standardBorder = 'borderNeutralLight';
  //     const hoverBorder = 'borderFormAccent';
  //     const borderColor = true ? standardBorder : hoverBorder;
  //     const properties = {
  //       boxShadow: borderColor,
  //     };
  //     const className = sprinkles(properties);`,
  // },
  {
    title: 'Visit Braid theme vars',
    code: dedent`
      import { vars } from 'braid-design-system/css';
      const className = style({
        border: vars.borderColor.standard,
      });`,
    output: dedent`
      import { vars } from 'braid-design-system/css';
      const className = style({
        border: vars.borderColor.neutralLight,
      });`,
  },
  {
    title: 'Visit Braid theme vars in variables',
    code: dedent`
      import { vars } from 'braid-design-system/css';
      const border = vars.borderColor;
      const className = style({
        border: border.standard,
      });`,
    output: dedent`
      import { vars } from 'braid-design-system/css';
      const border = vars.borderColor;
      const className = style({
        border: border.neutralLight,
      });`,
  },
  {
    title: 'Visit Braid theme vars via destructuring',
    code: dedent`
      import { vars } from 'braid-design-system/css';
      const { borderColor, space, ...rest } = vars;
      const className = style({
        border: borderColor.standard,
      });`,
    output: dedent`
      import { vars } from 'braid-design-system/css';
      const { borderColor, space, ...rest } = vars;
      const className = style({
        border: borderColor.neutralLight,
      });`,
  },
  {
    title: 'Visit Braid theme vars via destructuring with rename',
    code: dedent`
      import { vars } from 'braid-design-system/css';
      const { borderColor: border, space, ...rest } = vars;
      const className = style({
        border: border.standard,
      });`,
    output: dedent`
      import { vars } from 'braid-design-system/css';
      const { borderColor: border, space, ...rest } = vars;
      const className = style({
        border: border.neutralLight,
      });`,
  },
  {
    title: 'Visit Braid theme vars via destructuring via rest',
    code: dedent`
      import { vars } from 'braid-design-system/css';
      const { space, ...rest } = vars;
      const className = style({
        border: rest.borderColor.standard,
      });`,
    output: dedent`
      import { vars } from 'braid-design-system/css';
      const { space, ...rest } = vars;
      const className = style({
        border: rest.borderColor.neutralLight,
      });`,
  },
  // This one will need to be a regular jest test, with expect console to have been called
  // {
  //   title: 'Follow imports of variables of background props',
  //   code: dedent`
  //   import { Box } from 'braid-design-system';
  //   import { cardBackground, bodyBackground } from './styleTokens';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background={bgColor} boxShadow={'standard'} />
  //       </div>
  //     );
  //   };`,
  //   output: dedent`
  //   import { Box } from 'braid-design-system';
  //   import { cardBackground, bodyBackground } from './styleTokens';
  //   const bgColor = true ? cardBackground : bodyBackground;
  //   export default () => {
  //     return (
  //       <div background="card">
  //         <Box background={bgColor} boxShadow={'neutralLight'} />
  //       </div>
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
