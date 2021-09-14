import {
  assignVars,
  createThemeContract,
  styleVariants,
} from '@vanilla-extract/css';
import { darkMode } from '../../css/atoms/sprinkles.css';
import { vars } from '../../themes/vars.css';

const keylineVars = createThemeContract({
  promote: null,
  info: null,
  positive: null,
  caution: null,
  critical: null,
});

const lightModeVars = assignVars(keylineVars, {
  promote: vars.backgroundColor.promote,
  info: vars.backgroundColor.info,
  positive: vars.backgroundColor.positive,
  caution: vars.backgroundColor.caution,
  critical: vars.backgroundColor.critical,
});

const darkModeVars = assignVars(keylineVars, {
  promote: vars.borderColor.promoteLight,
  info: vars.borderColor.infoLight,
  positive: vars.borderColor.positiveLight,
  caution: vars.borderColor.cautionLight,
  critical: vars.borderColor.criticalLight,
});

export const tone = styleVariants({
  promote: { background: keylineVars.promote },
  info: { background: keylineVars.info },
  positive: { background: keylineVars.positive },
  caution: { background: keylineVars.caution },
  critical: { background: keylineVars.critical },
});

export const lightModeKeyline = styleVariants({
  light: {
    selectors: {
      [`html:not(${darkMode}) &`]: {
        vars: lightModeVars,
      },
    },
  },
  dark: {
    selectors: {
      [`html:not(${darkMode}) &`]: {
        vars: darkModeVars,
      },
    },
  },
});

export const darkModeKeyline = styleVariants({
  light: {
    selectors: {
      [`html${darkMode} &`]: {
        vars: lightModeVars,
      },
    },
  },
  dark: {
    selectors: {
      [`html${darkMode} &`]: {
        vars: darkModeVars,
      },
    },
  },
});
