import React from 'react';
import { BoxShadow } from '../../../css/atoms/atomicProperties';
import {
  ColorModeValue,
  normalizeColorModeValue,
} from '../../../css/atoms/sprinkles.css';
import { Overlay, OverlayProps } from '../Overlay/Overlay';

type FieldOverlayVariant =
  | 'default'
  | 'disabled'
  | 'focus'
  | 'hover'
  | 'transparent'
  | 'critical';
export interface FieldOverlayProps
  extends Pick<
    OverlayProps,
    | 'children'
    | 'visible'
    | 'onlyVisibleForKeyboardNavigation'
    | 'background'
    | 'borderRadius'
    | 'className'
  > {
  variant?: ColorModeValue<FieldOverlayVariant>;
}

const boxShadowForVariant: Record<FieldOverlayVariant, BoxShadow> = {
  transparent: 'none',
  default: 'borderField',
  disabled: 'borderStandard',
  focus: 'outlineFocus',
  hover: 'borderFormHover',
  critical: 'borderCritical',
};

export const FieldOverlay = ({ variant, ...restProps }: FieldOverlayProps) => {
  const normalisedVariant = variant ? normalizeColorModeValue(variant) : {};

  return (
    <Overlay
      borderRadius="standard"
      boxShadow={{
        lightMode: boxShadowForVariant[normalisedVariant.lightMode!],
        darkMode: boxShadowForVariant[normalisedVariant.darkMode!],
      }}
      transition="fast"
      {...restProps}
    />
  );
};
