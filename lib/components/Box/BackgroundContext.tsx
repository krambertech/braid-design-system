import React, { createContext, useContext, ReactElement } from 'react';
import { BoxBackgroundVariant, BoxProps } from './Box';
import { useBraidTheme } from '../BraidProvider/BraidThemeContext';
import { mapColorModeValue } from '../../css/atoms/sprinkles.css';

export type BackgroundContextValue = Exclude<
  BoxBackgroundVariant,
  'transparent'
>;

const lightModeBackgroundContext =
  createContext<BackgroundContextValue>('body');
const darkModeBackgroundContext =
  createContext<BackgroundContextValue>('bodyDark');

export const LightBackgroundProvider = lightModeBackgroundContext.Provider;
export const DarkBackgroundProvider = darkModeBackgroundContext.Provider;

export const renderBackgroundProvider = (
  background: BoxProps['background'],
  element: ReactElement | null,
) => {
  if (!background || background === 'transparent') {
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

  if (background.lightMode && background.lightMode !== 'transparent') {
    returnEl = (
      <LightBackgroundProvider value={background.lightMode}>
        {returnEl}
      </LightBackgroundProvider>
    );
  }

  if (background.darkMode && background.darkMode !== 'transparent') {
    returnEl = (
      <DarkBackgroundProvider value={background.darkMode}>
        {returnEl}
      </DarkBackgroundProvider>
    );
  }

  return returnEl;
};

export const useBackground = () => ({
  lightMode: useContext(lightModeBackgroundContext),
  darkMode: useContext(darkModeBackgroundContext),
});

export const useBackgroundLightness = (
  backgroundOverride?: ReturnType<typeof useBackground>,
) => {
  const backgroundFromContext = useBackground();
  const background = backgroundOverride || backgroundFromContext;
  const { backgroundLightness } = useBraidTheme();

  return {
    lightMode: backgroundLightness[background.lightMode],
    darkMode: backgroundLightness[background.darkMode],
  };
};

export type ColorContrastValue<Value> =
  | { light: Value; dark: Value }
  | ((contrast: 'light' | 'dark', background: BackgroundContextValue) => Value);
export const useColorContrast = () => {
  const background = useBackground();
  const backgroundLightness = useBackgroundLightness();

  return <Value extends string>(map: ColorContrastValue<Value>) =>
    mapColorModeValue(backgroundLightness, (lightness, mode) =>
      typeof map === 'function'
        ? map(lightness, background[mode])
        : map[lightness],
    );
};
