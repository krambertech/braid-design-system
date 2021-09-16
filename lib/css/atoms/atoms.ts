import * as resetStyles from '../reset/reset.css';
import { vars } from '../../themes/vars.css';

import { sprinkles, RequiredResponsiveValue } from './sprinkles.css';
import dedent from 'dedent';
import { BoxShadow } from './atomicProperties';
import { BackgroundVariant } from '../../components/Box/BackgroundContext';

type Sprinkles = Parameters<typeof sprinkles>[0];

export type Space = keyof typeof vars.space | 'none';
export type ResponsiveSpace = RequiredResponsiveValue<Space>;

export interface Atoms extends Sprinkles {
  reset?: keyof JSX.IntrinsicElements;
}

const internalAtoms = ({ reset, ...rest }: Atoms, isBox?: boolean) => {
  if (process.env.NODE_ENV !== 'production') {
    const deprecatedShadowMap: Partial<Record<BoxShadow, BoxShadow>> = {
      borderStandard: 'borderNeutralLight',
      borderStandardInverted: 'borderNeutralInverted',
      borderStandardInvertedLarge: 'borderNeutralInvertedLarge',
      borderFormHover: 'borderFormAccent',
    };

    const deprecatedBackgroundMap: Partial<
      Record<BackgroundVariant, BackgroundVariant>
    > = {
      card: 'surface',
      formAccentDisabled: 'neutralLight',
      input: 'surface',
      inputDisabled: 'neutralSoft',
      selection: 'formAccentSoft',
    };

    if (
      'background' in rest &&
      rest.background &&
      deprecatedBackgroundMap[rest.background]
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        dedent`
          The "${
            rest.background
          }" value of "background"  has been deprecated. Please use "${
          deprecatedBackgroundMap[rest.background]
        }" instead.

          ${
            isBox
              ? `
          %c- <Box background="${rest.background}" />
          %c+ <Box background="${
            deprecatedBackgroundMap[rest.background]
          }" />%c`
              : `  atoms({
          %c-   background: '${rest.background}',
          %c+   background: '${deprecatedBackgroundMap[rest.background]}',
          %c  });
          `
          }
        `,
        'color: red',
        'color: green',
        'color: inherit',
      );
    }

    if (
      'boxShadow' in rest &&
      rest.boxShadow &&
      deprecatedShadowMap[rest.boxShadow]
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        dedent`
          The "${
            rest.boxShadow
          }" value of "boxShadow"  has been deprecated. Please use "${
          deprecatedShadowMap[rest.boxShadow]
        }" instead.

          ${
            isBox
              ? `
          %c- <Box boxShadow="${rest.boxShadow}" />
          %c+ <Box boxShadow="${deprecatedShadowMap[rest.boxShadow]}" />%c`
              : `  atoms({
          %c-   boxShadow: '${rest.boxShadow}',
          %c+   boxShadow: '${deprecatedShadowMap[rest.boxShadow]}',
          %c  });
          `
          }
        `,
        'color: red',
        'color: green',
        'color: inherit',
      );
    }
  }

  if (!reset) {
    return sprinkles(rest);
  }

  const elementReset =
    resetStyles.element[reset as keyof typeof resetStyles.element];

  const sprinklesClasses = sprinkles(rest);

  return `${resetStyles.base}${elementReset ? ` ${elementReset}` : ''}${
    sprinklesClasses ? ` ${sprinklesClasses}` : ''
  }`;
};

export const atoms = (properties: Atoms) => internalAtoms(properties);

export const boxAtoms = (properties: Atoms) => internalAtoms(properties, true);
