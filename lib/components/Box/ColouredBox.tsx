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

export interface ColouredBoxProps extends BoxProps {
  component: NonNullable<BoxProps['component']>;
  background: NonNullable<BoxProps['background']>;
}

export const useColouredBoxClasses = (
  background: ColouredBoxProps['background'],
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
