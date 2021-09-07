import React, {
  useContext,
  forwardRef,
  ReactNode,
  AllHTMLAttributes,
} from 'react';
import { Box } from '..';
import { touchableText, useText } from '../../hooks/typography';
import { BoxProps } from '../Box/Box';
import buildDataAttributes, {
  DataAttributeMap,
} from '../private/buildDataAttributes';
import { FieldOverlay } from '../private/FieldOverlay/FieldOverlay';
import { virtualTouchable } from '../private/touchable/virtualTouchable';
import {
  BackgroundVariant,
  ColorContrastValue,
  useColorContrast,
} from '../Box/BackgroundContext';
import { TextProps } from '../Text/Text';
import { BoxShadow } from '../../css/atoms/atomicProperties';
import ActionsContext from '../Actions/ActionsContext';
import * as styles from './Button.css';

export const buttonVariants = [
  'solid',
  'ghost',
  'soft',
  'transparent',
] as const;

type ButtonSize = 'standard' | 'small';
type ButtonTone = 'brandAccent' | 'critical';
type ButtonVariant = typeof buttonVariants[number];
export interface ButtonStyleProps {
  size?: ButtonSize;
  tone?: ButtonTone;
  variant?: ButtonVariant;
  bleedY?: boolean;
  loading?: boolean;
}

type NativeButtonProps = AllHTMLAttributes<HTMLButtonElement>;
export interface ButtonProps extends ButtonStyleProps {
  id?: NativeButtonProps['id'];
  onClick?: NativeButtonProps['onClick'];
  type?: 'button' | 'submit' | 'reset';
  children?: ReactNode;
  'aria-controls'?: NativeButtonProps['aria-controls'];
  'aria-expanded'?: NativeButtonProps['aria-expanded'];
  'aria-describedby'?: NativeButtonProps['aria-describedby'];
  tabIndex?: NativeButtonProps['tabIndex'];
  data?: DataAttributeMap;
}

type ButtonStyles = {
  textTone: TextProps['tone'];
  background:
    | ColorContrastValue<BackgroundVariant>
    | BackgroundVariant
    | undefined;
  backgroundHover:
    | ColorContrastValue<BackgroundVariant>
    | BackgroundVariant
    | undefined;
  backgroundActive:
    | ColorContrastValue<BackgroundVariant>
    | BackgroundVariant
    | undefined;
  boxShadow: ColorContrastValue<BoxShadow> | BoxShadow | undefined;
};

const variants: Record<
  ButtonVariant,
  Record<'default' | ButtonTone, ButtonStyles>
> = {
  solid: {
    default: {
      textTone: undefined,
      background: 'formAccent',
      backgroundHover: 'formAccentHover',
      backgroundActive: 'formAccentActive',
      boxShadow: undefined,
    },
    brandAccent: {
      textTone: undefined,
      background: 'brandAccent',
      backgroundHover: 'brandAccentHover',
      backgroundActive: 'brandAccentActive',
      boxShadow: undefined,
    },
    critical: {
      textTone: undefined,
      background: 'critical',
      backgroundHover: 'criticalHover',
      backgroundActive: 'criticalActive',
      boxShadow: undefined,
    },
  },
  soft: {
    default: {
      textTone: 'formAccent',
      background: { light: 'formAccentSoft', dark: 'neutral' },
      backgroundHover: {
        light: 'formAccentSoftHover',
        dark: 'neutral',
      },
      backgroundActive: {
        light: 'formAccentSoftActive',
        dark: 'neutral',
      },
      boxShadow: undefined,
    },
    brandAccent: {
      textTone: 'brandAccent',
      background: { light: 'brandAccentSoft', dark: 'neutral' },
      backgroundHover: {
        light: 'brandAccentSoftHover',
        dark: 'neutral',
      },
      backgroundActive: {
        light: 'brandAccentSoftActive',
        dark: 'neutral',
      },
      boxShadow: undefined,
    },
    critical: {
      textTone: 'critical',
      background: { light: 'criticalSoft', dark: 'neutral' },
      backgroundHover: { light: 'criticalSoftHover', dark: 'neutral' },
      backgroundActive: {
        light: 'criticalSoftActive',
        dark: 'neutral',
      },
      boxShadow: undefined,
    },
  },
  transparent: {
    default: {
      textTone: 'formAccent',
      background: undefined,
      backgroundHover: {
        light: 'formAccentSoftHover',
        dark: 'neutral',
      },
      backgroundActive: {
        light: 'formAccentSoftActive',
        dark: 'neutral',
      },
      boxShadow: undefined,
    },
    brandAccent: {
      textTone: 'brandAccent',
      background: undefined,
      backgroundHover: {
        light: 'brandAccentSoftHover',
        dark: 'neutral',
      },
      backgroundActive: {
        light: 'brandAccentSoftActive',
        dark: 'neutral',
      },
      boxShadow: undefined,
    },
    critical: {
      textTone: 'critical',
      background: undefined,
      backgroundHover: { light: 'criticalSoftHover', dark: 'neutral' },
      backgroundActive: {
        light: 'criticalSoftActive',
        dark: 'neutral',
      },
      boxShadow: undefined,
    },
  },
  ghost: {
    default: {
      textTone: 'formAccent',
      background: undefined,
      backgroundHover: {
        light: 'formAccentSoftHover',
        dark: 'neutral',
      },
      backgroundActive: {
        light: 'formAccentSoftActive',
        dark: 'neutral',
      },
      boxShadow: {
        light: 'borderFormAccentLarge',
        dark: 'borderFormAccentLightLarge',
      },
    },
    brandAccent: {
      textTone: 'brandAccent',
      background: undefined,
      backgroundHover: {
        light: 'brandAccentSoftHover',
        dark: 'neutral',
      },
      backgroundActive: {
        light: 'brandAccentSoftActive',
        dark: 'neutral',
      },
      boxShadow: {
        light: 'borderBrandAccentLarge',
        dark: 'borderBrandAccentLightLarge',
      },
    },
    critical: {
      textTone: 'critical',
      background: undefined,
      backgroundHover: { light: 'criticalSoftHover', dark: 'neutral' },
      backgroundActive: {
        light: 'criticalSoftActive',
        dark: 'neutral',
      },
      boxShadow: {
        light: 'borderCriticalLarge',
        dark: 'borderCriticalLightLarge',
      },
    },
  },
} as const;

const ButtonLoader = () => (
  <Box aria-hidden component="span" display="inlineBlock">
    <Box component="span" className={styles.loadingDot}>
      .
    </Box>
    <Box component="span" className={styles.loadingDot}>
      .
    </Box>
    <Box component="span" className={styles.loadingDot}>
      .
    </Box>
  </Box>
);

export const ButtonOverlays = ({
  variant = 'solid',
  size: sizeProp,
  tone,
  loading,
  children,
}: ButtonProps) => {
  const actionsContext = useContext(ActionsContext);
  const size = sizeProp ?? actionsContext?.size ?? 'standard';
  const stylesForVariant = variants[variant][tone ?? 'default'];
  const colorConstrast = useColorContrast();

  return (
    <>
      <FieldOverlay
        borderRadius="large"
        variant="focus"
        onlyVisibleForKeyboardNavigation
        className={styles.focusOverlay}
      />
      <FieldOverlay
        borderRadius="large"
        background={
          stylesForVariant.backgroundHover &&
          typeof stylesForVariant.backgroundHover !== 'string'
            ? colorConstrast(stylesForVariant.backgroundHover)
            : stylesForVariant.backgroundHover
        }
        className={styles.hoverOverlay}
      />
      <FieldOverlay
        borderRadius="large"
        background={
          stylesForVariant.backgroundActive &&
          typeof stylesForVariant.backgroundActive !== 'string'
            ? colorConstrast(stylesForVariant.backgroundActive)
            : stylesForVariant.backgroundActive
        }
        className={styles.activeOverlay}
      />
      {stylesForVariant.boxShadow ? (
        <Box
          boxShadow={
            stylesForVariant.boxShadow &&
            typeof stylesForVariant.boxShadow !== 'string'
              ? colorConstrast(stylesForVariant.boxShadow)
              : stylesForVariant.boxShadow
          }
          borderRadius="large"
          position="absolute"
          top={0}
          bottom={0}
          left={0}
          right={0}
          pointerEvents="none"
        />
      ) : null}
      <Box
        component="span"
        position="relative"
        display="block"
        overflow="hidden"
        pointerEvents="none"
        marginX={
          size === 'small' || variant === 'transparent' ? 'small' : 'medium'
        }
        paddingY={
          size === 'small' ? styles.constants.smallButtonPaddingSize : undefined
        }
        className={size === 'standard' ? touchableText.standard : undefined}
      >
        {children}
        {loading ? <ButtonLoader /> : null}
      </Box>
    </>
  );
};

export const useButtonStyles = ({
  variant = 'solid',
  size: sizeProp,
  tone,
  bleedY,
  loading,
}: ButtonProps): BoxProps => {
  const actionsContext = useContext(ActionsContext);
  const size = sizeProp ?? actionsContext?.size ?? 'standard';
  const stylesForVariant = variants[variant][tone ?? 'default'];
  const colorConstrast = useColorContrast();

  return {
    borderRadius: 'large',
    width: 'full',
    position: 'relative',
    display: 'block',
    transform: { active: 'touchable' },
    transition: 'touchable',
    outline: 'none',
    textAlign: 'center',
    userSelect: 'none',
    cursor: !loading ? 'pointer' : undefined,
    background:
      stylesForVariant.background &&
      typeof stylesForVariant.background !== 'string'
        ? colorConstrast(stylesForVariant.background)
        : stylesForVariant.background,
    className: [
      styles.root,
      useText({
        tone: stylesForVariant.textTone,
        weight: 'medium',
        size,
        baseline: false,
      }),
      size === 'small' ? virtualTouchable({ xAxis: false }) : null,
      size === 'standard' ? styles.standard : styles.small,
      bleedY ? styles.bleedY : null,
    ],
  } as const;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick,
      children,
      size,
      tone,
      bleedY,
      variant,
      loading,
      type = 'button',
      id,
      tabIndex,
      'aria-controls': ariaControls,
      'aria-expanded': ariaExpanded,
      'aria-describedby': ariaDescribedBy,
      data,
    },
    ref,
  ) => (
    <Box
      component="button"
      ref={ref}
      id={id}
      type={type}
      tabIndex={tabIndex}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-describedby={ariaDescribedBy}
      onClick={onClick}
      disabled={loading}
      {...(data ? buildDataAttributes(data) : undefined)}
      {...useButtonStyles({ variant, tone, size, bleedY, loading })}
    >
      <ButtonOverlays
        variant={variant}
        tone={tone}
        size={size}
        loading={loading}
      >
        {children}
      </ButtonOverlays>
    </Box>
  ),
);

Button.displayName = 'Button';
