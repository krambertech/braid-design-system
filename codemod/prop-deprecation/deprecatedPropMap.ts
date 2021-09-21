export const deprecatedPropMap = {
  Box: {
    background: {
      card: 'surface',
      formAccentDisabled: 'neutralLight',
      input: 'surface',
      inputDisabled: 'neutralSoft',
      selection: 'formAccentSoft',
    },
    boxShadow: {
      standard: 'neutralLight',
      borderStandardInverted: 'borderNeutralInverted',
      borderStandardInvertedLarge: 'borderNeutralInvertedLarge',
      borderFormHover: 'borderFormAccent',
    },
  },
  atoms: {
    boxShadow: {
      borderStandard: 'borderNeutralLight',
      borderStandardInverted: 'borderNeutralInverted',
      borderStandardInvertedLarge: 'borderNeutralInvertedLarge',
      borderFormHover: 'borderFormAccent',
    },
  },
  vars: {
    backgroundColor: {
      card: 'surface',
      formAccentDisabled: 'neutralLight',
      input: 'surface',
      inputDisabled: 'neutralSoft',
      selection: 'formAccentSoft',
    },
    borderColor: {
      standard: 'neutralLight',
      standardInverted: 'neutralInverted',
      formHover: 'formAccent',
    },
  },
} as const;

type DeprecatedProp = keyof typeof deprecatedPropMap;

export const isDeprecatedProp = (
  componentName: string,
  propName: string,
): propName is DeprecatedProp =>
  Boolean(deprecatedPropMap[componentName]?.[propName]);

export const getPropReplacement = (
  componentName: string,
  propName: DeprecatedProp,
  inputValue: string,
) => deprecatedPropMap[componentName]?.[propName]?.[inputValue] ?? inputValue;
