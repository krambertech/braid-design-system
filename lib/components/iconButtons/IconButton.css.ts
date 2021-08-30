import { style } from '@vanilla-extract/css';
import { braidDarkModeClass } from '../../css/atoms/sprinkles.css';

export const button = style({
  ':hover': {
    zIndex: 1,
  },
  selectors: {
    [`&::-moz-focus-inner`]: {
      border: 0,
    },
  },
});

export const forceActive = style({});
export const darkBackgroundLightMode = style({});
export const darkBackgroundDarkMode = style({});

export const hoverOverlay = style({
  selectors: {
    [`${button}:hover &, ${button}:focus &`]: {
      opacity: 1,
    },
    [`
      html:not(.${braidDarkModeClass}) ${button}:hover &${darkBackgroundLightMode},
      html:not(.${braidDarkModeClass}) ${button}:focus &${darkBackgroundLightMode},
      html.${braidDarkModeClass} ${button}:hover &${darkBackgroundDarkMode},
      html.${braidDarkModeClass} ${button}:focus &${darkBackgroundDarkMode}
    `]: {
      opacity: 0.2,
    },
    [`${button}:active &, ${forceActive}&`]: {
      opacity: 0.8,
    },
    [`
      html:not(.${braidDarkModeClass}) ${button}:active &${darkBackgroundLightMode},
      html:not(.${braidDarkModeClass}) ${forceActive}&${darkBackgroundLightMode},
      html.${braidDarkModeClass} ${button}:active &${darkBackgroundDarkMode},
      html.${braidDarkModeClass} ${forceActive}&${darkBackgroundDarkMode}
    `]: {
      opacity: 0.075,
    },
  },
});

export const focusOverlay = style({
  selectors: {
    [`${button}:focus &`]: {
      opacity: 1,
    },
    [`${button}:focus &${darkBackgroundLightMode}`]: {
      opacity: 0.15,
    },
  },
});
