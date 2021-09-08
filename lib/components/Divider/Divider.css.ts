import {
  assignVars,
  createThemeContract,
  style,
  styleVariants,
} from '@vanilla-extract/css';
import { braidDarkModeClass } from '../../css/atoms/sprinkles.css';
import { vars } from '../../themes/vars.css';

export const base = style({
  height: vars.borderWidth.standard,
});

const weightVars = createThemeContract({
  regular: null,
  strong: null,
});

export const regular = style({ background: weightVars.regular });
export const strong = style({ background: weightVars.strong });

export const weight = styleVariants({
  light: {
    selectors: {
      [`html:not(.${braidDarkModeClass}) &`]: {
        vars: assignVars(weightVars, {
          regular: vars.borderColor.standard,
          strong: vars.borderColor.neutral,
        }),
      },
    },
  },
  dark: {
    selectors: {
      [`html.${braidDarkModeClass} &`]: {
        vars: assignVars(weightVars, {
          regular: vars.borderColor.neutral,
          strong: vars.borderColor.standard,
        }),
      },
    },
  },
});
