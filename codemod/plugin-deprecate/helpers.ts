import { getReplacement, isDeprecated } from './deprecationMap';
import { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';

type StringLiteralPath = NodePath<t.StringLiteral>;
export const updateStringLiteral = (
  path: StringLiteralPath,
  componentName: string,
  propName: string,
) => {
  if (isDeprecated(componentName, propName)) {
    path.node.value = getReplacement(componentName, propName, path.node.value);
  }
};

export const deArray = <T>(input: T | T[]) =>
  Array.isArray(input) ? input[0] : input;
