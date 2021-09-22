import dedent from 'dedent';
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

export const createHighlightedCodeFrame = (
  code: string,
  { start, end }: t.SourceLocation,
) => {
  const codeLines = code.split('\n');

  const codeLineNumber = start.line - 1;
  const beforeLineNumber = start.line - 2;
  const afterLineNumber = end.line;

  const codeLine = `${codeLineNumber} | ${codeLines[codeLineNumber]}`;

  const beforeLine =
    beforeLineNumber > 0
      ? `${beforeLineNumber} | ${codeLines[beforeLineNumber]}`
      : '';
  const afterLine =
    afterLineNumber < codeLines.length
      ? `${afterLineNumber} | ${codeLines[afterLineNumber]}`
      : '';

  const longestLineNumberLength = Math.max(
    ...[beforeLineNumber, codeLineNumber, afterLineNumber]
      .filter(Boolean)
      .map((lineNumber) => lineNumber.toString().length),
  );

  const propIndicatorLength = ''.padStart(end.column - start.column, '^');
  const lineNumberPadding = ''.padStart(longestLineNumberLength, ' ');
  const propIndicator = `
    ${beforeLine}
    ${codeLine}
    ${lineNumberPadding}   ${propIndicatorLength.padStart(end.column, ' ')}
    ${afterLine}
    `.trim();

  return dedent(propIndicator);
};
