export const deprecatedPropMap = {
  Box: {
    background: {
      card: 'surface',
    },
    boxShadow: {
      standard: 'neutralLight',
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
