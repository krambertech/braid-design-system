export const deprecatedPropMap = {
  background: {
    card: 'surface',
  },
  boxShadow: {
    standard: 'neutralLight',
  },
} as const;

type DeprecatedProp = keyof typeof deprecatedPropMap;

export const isDeprecatedProp = (
  propName: string,
): propName is DeprecatedProp =>
  Object.keys(deprecatedPropMap).includes(propName);

export const getPropReplacement = (
  propName: DeprecatedProp,
  inputValue: string,
) => deprecatedPropMap[propName][inputValue] ?? inputValue;
