import { useContext } from 'react';
import clsx from 'clsx';
import type { StyleRule } from '@vanilla-extract/css';
import assert from 'assert';

import {
  useBackground,
  useBackgroundLightness,
} from '../../components/Box/BackgroundContext';
import { useDefaultTextProps } from '../../components/private/defaultTextProps';
import TextLinkRendererContext from '../../components/TextLinkRenderer/TextLinkRendererContext';
import { vars } from '../../themes/vars.css';
import { responsiveStyle } from '../../css/responsiveStyle';
import { atoms } from '../../css/atoms/atoms';
import * as styles from './typography.css';

type TextTone =
  | 'brandAccent'
  | 'caution'
  | 'critical'
  | 'formAccent'
  | 'info'
  | 'positive'
  | 'promote'
  | 'secondary'
  | 'neutral'
  | 'link';

export interface UseTextProps {
  weight?: keyof typeof styles.fontWeight;
  size?: keyof typeof styles.text;
  tone?: TextTone;
  baseline: boolean;
  backgroundContext?: ReturnType<typeof useBackground>;
}

export const globalTextStyle = ({
  weight = 'regular',
  size = 'standard',
}: Pick<UseTextProps, 'weight' | 'size'> = {}): StyleRule => ({
  fontFamily: vars.fontFamily,
  fontWeight: vars.textWeight[weight],
  color: vars.foregroundColor.neutral,
  ...responsiveStyle({
    mobile: {
      fontSize: vars.textSize[size].mobile.fontSize,
      lineHeight: vars.textSize[size].mobile.lineHeight,
    },
    tablet: {
      fontSize: vars.textSize[size].tablet.fontSize,
      lineHeight: vars.textSize[size].tablet.lineHeight,
    },
  }),
});

export function useText({
  weight = 'regular',
  size = 'standard',
  tone = 'neutral',
  baseline,
  backgroundContext,
}: UseTextProps) {
  const textTone = useTextTone({ tone, backgroundContext });

  return clsx(
    styles.fontFamily,
    textTone,
    styles.fontWeight[weight],
    baseline ? styles.text[size].trimmed : styles.text[size].untrimmed,
  );
}

export type HeadingLevel = keyof typeof styles.heading;
export type HeadingWeight = 'regular' | 'weak';

interface UseHeadingProps {
  weight?: HeadingWeight;
  level: HeadingLevel;
  baseline: boolean;
  backgroundContext?: ReturnType<typeof useBackground>;
}

export const globalHeadingStyle = ({
  weight = 'regular',
  level,
}: Pick<UseHeadingProps, 'weight' | 'level'>): StyleRule => ({
  fontFamily: vars.fontFamily,
  fontWeight: vars.headingWeight[weight],
  color: vars.foregroundColor.neutral,
  ...responsiveStyle({
    mobile: {
      fontSize: vars.headingLevel[level].mobile.fontSize,
      lineHeight: vars.headingLevel[level].mobile.lineHeight,
    },
    tablet: {
      fontSize: vars.headingLevel[level].tablet.fontSize,
      lineHeight: vars.headingLevel[level].tablet.lineHeight,
    },
  }),
});

export function useHeading({
  weight = 'regular',
  level,
  baseline,
  backgroundContext,
}: UseHeadingProps) {
  const textTone = useTextTone({ tone: 'neutral', backgroundContext });

  return clsx(
    styles.fontFamily,
    styles.headingWeight[weight],
    baseline ? styles.heading[level].trimmed : styles.heading[level].untrimmed,
    textTone,
  );
}

export function textSize(size: keyof typeof styles.text) {
  return styles.text[size].untrimmed;
}

export function useWeight(weight: keyof typeof styles.fontWeight) {
  const inTextLinkRenderer = useContext(TextLinkRendererContext);

  return inTextLinkRenderer ? undefined : styles.fontWeight[weight];
}

const neutralToneOverrideForBackground: Partial<
  Record<keyof typeof vars.backgroundColor, TextTone>
> = {
  formAccentSoft: 'formAccent',
  formAccentSoftActive: 'formAccent',
  formAccentSoftHover: 'formAccent',
  criticalLight: 'critical',
  criticalSoft: 'critical',
  criticalSoftActive: 'critical',
  criticalSoftHover: 'critical',
  caution: 'caution',
  cautionLight: 'caution',
  positiveLight: 'positive',
  infoLight: 'info',
  promoteLight: 'promote',
};

const darkToneMap: Record<
  TextTone | 'neutralInverted' | 'secondaryInverted',
  keyof typeof vars.foregroundColor
> = {
  critical: 'criticalLight',
  caution: 'cautionLight',
  info: 'infoLight',
  promote: 'promoteLight',
  positive: 'positiveLight',
  brandAccent: 'brandAccent',
  formAccent: 'formAccent',
  neutral: 'neutralInverted',
  neutralInverted: 'neutral',
  secondary: 'secondaryInverted',
  secondaryInverted: 'secondary',
};

export function useTextTone({
  tone: toneProp,
  backgroundContext: backgroundContextOverride,
}: {
  tone: TextTone;
  backgroundContext?: ReturnType<typeof useBackground>;
}) {
  const textLinkContext = useContext(TextLinkRendererContext);
  const backgroundContext = useBackground();
  const background = backgroundContextOverride || backgroundContext;
  const backgroundLightness = useBackgroundLightness(background);
  const { tone } = useDefaultTextProps({ tone: toneProp });

  if (
    tone === 'neutral' &&
    (background.lightMode in neutralToneOverrideForBackground ||
      background.darkMode in neutralToneOverrideForBackground)
  ) {
    const lightToneOverride =
      neutralToneOverrideForBackground[
        background.lightMode as keyof typeof neutralToneOverrideForBackground
      ];

    const darkToneOverride =
      neutralToneOverrideForBackground[
        background.darkMode as keyof typeof neutralToneOverrideForBackground
      ];

    assert(
      lightToneOverride,
      `Tone override not found for tone: ${lightToneOverride}`,
    );
    // assert(
    //   darkToneOverride,
    //   `Tone override not found for tone: ${darkToneOverride}`,
    // );

    return atoms({
      color: {
        lightMode: lightToneOverride,
        darkMode: darkToneOverride,
      },
    });
  }

  if (tone === 'neutral' && textLinkContext && textLinkContext !== 'weak') {
    return styles.tone.link;
    // return atoms({ color: 'link' });
  }

  return atoms({
    color: {
      lightMode:
        backgroundLightness.lightMode === 'light' ? tone : darkToneMap[tone],
      darkMode:
        backgroundLightness.darkMode === 'light' ? tone : darkToneMap[tone],
    },
  });
}

export const touchableText = styles.touchable;
