import { createElement, forwardRef } from 'react';
import { atoms } from '../../css/atoms/atoms';
import { useBraidTheme } from '../BraidProvider/BraidThemeContext';
import { renderBackgroundProvider } from './BackgroundContext';
import { BoxProps } from './Box';
import * as typographyStyles from '../../hooks/typography/typography.css';
import {
  mapColorModeValue,
  normalizeColorModeValue,
} from '../../css/atoms/sprinkles.css';

export interface ColoredBoxProps extends BoxProps {
  component: NonNullable<BoxProps['component']>;
  background: NonNullable<BoxProps['background']>;
}

export const useColoredBoxClasses = (
  background: ColoredBoxProps['background'],
) => {
  const { lightMode: lightModeBg, darkMode: darkModeBg } =
    normalizeColorModeValue(background);

  const { backgroundLightness } = useBraidTheme();

  const lightContext =
    typographyStyles.lightMode[backgroundLightness[lightModeBg!]];

  const lightNeutralOverride =
    typeof lightModeBg === 'string' &&
    lightModeBg in typographyStyles.lightModeNeutralOverride
      ? typographyStyles.lightModeNeutralOverride[
          lightModeBg as keyof typeof typographyStyles.lightModeNeutralOverride
        ]
      : undefined;

  const darkContext =
    typographyStyles.darkMode[backgroundLightness[darkModeBg!]];

  const darkNeutralOverride =
    typeof darkModeBg === 'string' &&
    darkModeBg in typographyStyles.darkModeNeutralOverride
      ? typographyStyles.darkModeNeutralOverride[
          darkModeBg as keyof typeof typographyStyles.darkModeNeutralOverride
        ]
      : undefined;

  return [
    atoms({
      background: mapColorModeValue(background, (value) =>
        // @ts-expect-error - mapping conditional values should support returning undefined
        value === 'customDark' || value === 'customLight' ? undefined : value,
      ),
    }),
    lightContext,
    lightNeutralOverride,
    darkContext,
    darkNeutralOverride,
  ].join(' ');
};

export const ColoredBox = forwardRef<HTMLElement, ColoredBoxProps>(
  ({ component, background, className, ...props }, ref) => {
    const colorClasses = useColoredBoxClasses(background);

    const element = createElement(component, {
      className: `${className} ${colorClasses}`,
      ...props,
      ref,
    });

    return renderBackgroundProvider(background, element);
  },
);

ColoredBox.displayName = 'ColoredBox';
