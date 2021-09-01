import { createElement, forwardRef } from 'react';
import { useBraidTheme } from '../BraidProvider/BraidThemeContext';
import { renderBackgroundProvider } from './BackgroundContext';
import { BoxProps } from './Box';
import * as typographyStyles from '../../hooks/typography/typography.css';

export interface ColouredBoxProps extends BoxProps {
  component: NonNullable<BoxProps['component']>;
  background: NonNullable<BoxProps['background']>;
}

export const useColouredBoxClasses = (
  background: ColouredBoxProps['background'],
) => {
  const { lightMode: lightModeBg, darkMode: darkModeBg } =
    typeof background === 'string'
      ? ({ lightMode: background, darkMode: background } as const)
      : background;

  const { backgroundLightness } = useBraidTheme();

  const lightContext =
    typographyStyles.lightMode[backgroundLightness[lightModeBg!]];
  const lightNeutralOverride =
    typographyStyles.lightModeNeutralOverride[lightModeBg!];
  const darkContext =
    typographyStyles.darkMode[backgroundLightness[darkModeBg!]];
  const darkNeutralOverride =
    typographyStyles.darkModeNeutralOverride[darkModeBg!];

  return [
    lightContext,
    lightNeutralOverride,
    darkContext,
    darkNeutralOverride,
  ].join(' ');
};

export const ColouredBox = forwardRef<HTMLElement, ColouredBoxProps>(
  ({ component, background, className, ...props }, ref) => {
    const colourClasses = useColouredBoxClasses(background);

    const element = createElement(component, {
      className: `${className} ${colourClasses}`,
      ...props,
      ref,
    });

    return renderBackgroundProvider(background, element);
  },
);

ColouredBox.displayName = 'ColouredBox';
