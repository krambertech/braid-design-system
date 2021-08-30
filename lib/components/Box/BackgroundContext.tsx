import React, { createContext, useContext, ReactElement } from 'react';
import { BoxProps } from './Box';
import { useBraidTheme } from '../BraidProvider/BraidThemeContext';
import { vars } from '../../themes/vars.css';

export type BackgroundVariant =
  | keyof typeof vars.backgroundColor
  | 'UNKNOWN_DARK'
  | 'UNKNOWN_LIGHT';

const lightModeBackgroundContext = createContext<BackgroundVariant>('body');
const darkModeBackgroundContext = createContext<BackgroundVariant>('bodyDark');

export const LightBackgroundProvider = lightModeBackgroundContext.Provider;
export const DarkBackgroundProvider = darkModeBackgroundContext.Provider;

export const renderBackgroundProvider = (
  background: BoxProps['background'],
  element: ReactElement | null,
) => {
  if (!background) {
    return element;
  }

  if (typeof background === 'string') {
    return (
      <LightBackgroundProvider value={background}>
        <DarkBackgroundProvider value={background}>
          {element}
        </DarkBackgroundProvider>
      </LightBackgroundProvider>
    );
  }

  let returnEl = element;

  if (background.lightMode) {
    returnEl = (
      <LightBackgroundProvider value={background.lightMode}>
        {returnEl}
      </LightBackgroundProvider>
    );
  }

  if (background.darkMode) {
    returnEl = (
      <LightBackgroundProvider value={background.darkMode}>
        {returnEl}
      </LightBackgroundProvider>
    );
  }

  return returnEl;
};

export const useBackground = () => ({
  lightMode: useContext(lightModeBackgroundContext),
  darkMode: useContext(darkModeBackgroundContext),
});

const useLightness = (
  color: BackgroundVariant,
  defaultColor: keyof typeof vars.backgroundColor,
) => {
  const { backgroundLightness } = useBraidTheme();

  if (color === 'UNKNOWN_DARK') {
    return 'dark';
  }

  if (color === 'UNKNOWN_LIGHT') {
    return 'light';
  }

  return color
    ? backgroundLightness[color] || backgroundLightness[defaultColor]
    : backgroundLightness[defaultColor];
};

export const useBackgroundLightness = (
  backgroundOverride?: ReturnType<typeof useBackground>,
) => {
  const backgroundFromContext = useBackground();
  const background = backgroundOverride || backgroundFromContext;

  return {
    lightMode: useLightness(background.lightMode, 'body'),
    darkMode: useLightness(background.darkMode, 'bodyDark'),
  };
};
