import type { PluginObj, PluginPass, Visitor } from '@babel/core';
import { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import dedent from 'dedent';
import { getPropReplacement, isDeprecatedProp } from './deprecatedPropMap';

const deArray = <T>(input: T | T[]) =>
  Array.isArray(input) ? input[0] : input;

interface Context extends PluginPass {
  componentNames: Set<string>;
}

type StringLiteralPath = NodePath<t.StringLiteral>;
const updateStringLiteral = (path: StringLiteralPath, propName: string) => {
  if (isDeprecatedProp(propName)) {
    path.node.value = getPropReplacement(propName, path.node.value);
  }
};

interface SubVisitorContext extends Context {
  propName: string;
  propLocation: t.SourceLocation;
  recurses: number;
}

const createHighlightedCodeFrame = (
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

const subVisitor: Visitor<SubVisitorContext> = {
  StringLiteral(path) {
    if (this.recurses > 9) {
      // eslint-disable-next-line no-console
      console.error('Too many recurses');
      return;
    }

    updateStringLiteral(path, this.propName);
  },
  Identifier(path) {
    if (this.recurses > 9) {
      // eslint-disable-next-line no-console
      console.error('Too many recurses');
      return;
    }
    const identifierName = path.node.name;
    const binding = path.scope.getBinding(identifierName);

    if (!binding) {
      return;
    }

    if (t.isVariableDeclarator(binding.path.node)) {
      const initPath = deArray(
        binding.path.get('init'),
      ) as NodePath<t.Expression>;

      if (t.isStringLiteral(initPath.node)) {
        updateStringLiteral(initPath as StringLiteralPath, this.propName);
      } else {
        initPath.traverse(subVisitor, {
          ...this,
          recurses: this.recurses + 1,
        });
      }
    }

    if (t.isImportSpecifier(binding.path.node)) {
      const bindingPath = binding.path as NodePath<t.ImportSpecifier>;
      const variableName = bindingPath.node.local.name;
      const variableLocation = bindingPath.node.loc;
      if (t.isImportDeclaration(bindingPath.parent)) {
        const importSource = bindingPath.parent.source.value;

        // eslint-disable-next-line no-console
        console.warn(`
Untraceable import: ${this.filename}

Variable \`${variableName}\` is assigned to the ${
          this.propName
        } prop of Box, but is imported from '${importSource}'.
You should check that there are no usages of deprecated values in that file.

Imported at
${createHighlightedCodeFrame(this.file.code, variableLocation)}

Used at
${createHighlightedCodeFrame(this.file.code, this.propLocation)}
        `);
      }
    }
  },
};

export default function (): PluginObj<Context> {
  return {
    pre() {
      this.componentNames = new Set<string>();
    },
    visitor: {
      Program: {
        enter(path) {
          const bodyPath = path.get('body');

          for (const statement of bodyPath) {
            if (
              t.isImportDeclaration(statement.node) &&
              statement.node.source.value === 'braid-design-system'
            ) {
              for (const specifier of statement.node.specifiers) {
                if (
                  t.isImportSpecifier(specifier) &&
                  t.isIdentifier(specifier.imported) &&
                  specifier.imported.name === 'Box'
                ) {
                  this.componentNames.add(specifier.local.name);
                }
              }
            }
          }
        },
      },
      JSXOpeningElement(path) {
        if (t.isJSXMemberExpression(path.node.name)) {
          // Not handled yet
          // path.node.name.property.name
          return;
        }

        const elementName = path.node.name.name;

        if (
          typeof elementName === 'string' &&
          this.componentNames.has(elementName)
        ) {
          path.get('attributes').forEach((attr) => {
            if (
              t.isJSXSpreadAttribute(attr.node) ||
              typeof attr.node.name.name !== 'string'
            ) {
              return;
            }

            const attributeValue = deArray(attr.get('value'));

            if (t.isStringLiteral(attributeValue.node)) {
              updateStringLiteral(
                attributeValue as StringLiteralPath,
                attr.node.name.name,
              );
            }

            attributeValue.traverse(subVisitor, {
              ...this,
              propName: attr.node.name.name,
              propLocation: attr.node.loc,
              recurses: 0,
            });
          });
        }
      },
    },
  };
}
