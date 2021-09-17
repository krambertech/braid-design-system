import type { PluginObj, PluginPass, Visitor } from '@babel/core';
import { types as t } from '@babel/core';

const deprecatedPropMap = {
  background: {
    card: 'surface',
  },
  boxShadow: {
    standard: 'neutralLight',
  },
} as const;

interface Context extends PluginPass {
  componentNames: Set<string>;
}

interface SubVisitorContext extends PluginPass {
  propName: string;
}

const subVisitor: Visitor<SubVisitorContext> = {
  StringLiteral(path) {
    if (deprecatedPropMap[this.propName][path.node.value]) {
      path.node.value = deprecatedPropMap[this.propName][path.node.value];
    }
  },
  Identifier(path) {
    const identifierName = path.node.name;
    const binding = path.scope.getBinding(identifierName);

    if (!binding) {
      return;
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
        const elementName = t.isJSXMemberExpression(path.node.name)
          ? path.node.name.property.name
          : path.node.name.name;

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

            if (t.isJSXExpressionContainer(attr.node.value)) {
              const attrValue = attr.get('value');
              const expressionContainer = Array.isArray(attrValue)
                ? attrValue[0]
                : attrValue;

              const rawExpression = expressionContainer.get('expression');
              const expression = Array.isArray(rawExpression)
                ? rawExpression[0]
                : rawExpression;
              if (t.isIdentifier(expression.node)) {
                const variable = expression.node.name;
                const binding = expression.scope.getBinding(variable);

                console.log(binding);
              }

              // conditional
            }

            if (
              t.isStringLiteral(attr.value) &&
              deprecatedPropMap[attr.name.name]
            ) {
              attr.value.value =
                deprecatedPropMap[attr.name.name][attr.value.value] ||
                attr.value.value;
            }
          });
        }
      },
    },
  };
}
