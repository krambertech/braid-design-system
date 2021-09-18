import type { PluginObj, PluginPass, Visitor } from '@babel/core';
import { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';

const deprecatedPropMap = {
  background: {
    card: 'surface',
  },
  boxShadow: {
    standard: 'neutralLight',
  },
} as const;

const deArray = <T>(input: T | T[]) =>
  Array.isArray(input) ? input[0] : input;

interface Context extends PluginPass {
  componentNames: Set<string>;
}

type StringLiteralPath = NodePath<t.StringLiteral>;
const updateStringLiteral = (path: StringLiteralPath, propName: string) => {
  if (deprecatedPropMap[propName][path.node.value]) {
    path.node.value = deprecatedPropMap[propName][path.node.value];
  }
};

interface SubVisitorContext {
  propName: string;
  recurses: number;
}

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
          propName: this.propName,
          recurses: this.recurses + 1,
        });
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
              propName: attr.node.name.name,
              recurses: 0,
            });
          });
        }
      },
    },
  };
}
