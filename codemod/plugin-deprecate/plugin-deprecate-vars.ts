import type { PluginObj, PluginPass } from '@babel/core';
import { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import { deprecationMap } from './deprecationMap';
import { createHighlightedCodeFrame } from './helpers';

const walk = ({
  path,
  deprecations,
  code,
  filename,
}: {
  path: NodePath<t.Node>;
  deprecations: Record<string, string | Record<string, string>>;
  code: string;
  filename: string;
}) => {
  if (t.isMemberExpression(path.parent)) {
    if (t.isIdentifier(path.parent.property)) {
      const prop = deprecations[path.parent.property.name];
      if (typeof prop === 'object') {
        walk({ path: path.parentPath, deprecations: prop, code, filename });
      }

      if (typeof prop === 'string') {
        path.parent.property.name = prop;
      }
    }

    if (path.parent.computed) {
      if (t.isStringLiteral(path.parent.property)) {
        const prop = deprecations[path.parent.property.value];
        if (typeof prop === 'object') {
          walk({ path: path.parentPath, deprecations: prop, code, filename });
        }

        if (typeof prop === 'string') {
          path.parent.property.value = prop;
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(`
Untraceable computed object property:
  ${filename}

You should check that there are no usages of deprecated properties in this object.

${createHighlightedCodeFrame(code, path.parent.property.loc)}
`);
      }
    }
  }
  if (t.isVariableDeclarator(path.parent)) {
    if (t.isIdentifier(path.parent.id)) {
      const binding = path.scope.getBinding(path.parent.id.name);
      if (binding) {
        for (const refPath of binding.referencePaths) {
          walk({ path: refPath, deprecations, code, filename });
        }
      }
    }
    if (t.isObjectPattern(path.parent.id)) {
      for (const property of path.parent.id.properties) {
        if (t.isObjectProperty(property)) {
          if (t.isIdentifier(property.value) && t.isIdentifier(property.key)) {
            const binding = path.scope.getBinding(property.value.name);
            const deprecationValue = deprecations[property.key.name];
            if (typeof deprecationValue === 'string') {
              throw new Error(`
Untraceable object key:
  ${filename}

You should check that there are no usages of deprecated properties in this object.

${createHighlightedCodeFrame(code, property.key.loc)}
`);
            }

            if (binding && deprecationValue) {
              for (const refPath of binding.referencePaths) {
                walk({
                  path: refPath,
                  deprecations: deprecationValue,
                  code,
                  filename,
                });
              }
            }
          }
        }
        if (t.isRestElement(property)) {
          if (t.isIdentifier(property.argument)) {
            const binding = path.scope.getBinding(property.argument.name);
            if (binding) {
              for (const refPath of binding.referencePaths) {
                walk({ path: refPath, deprecations, code, filename });
              }
            }
          }
        }
      }
    }
  }
};

export default function (): PluginObj<PluginPass> {
  return {
    visitor: {
      Program: {
        enter(path) {
          const bodyPath = path.get('body');

          for (const statement of bodyPath) {
            if (
              t.isImportDeclaration(statement.node) &&
              /braid-design-system(?:\/css)?$/.test(statement.node.source.value)
            ) {
              for (const specifier of statement.node.specifiers) {
                if (
                  t.isImportSpecifier(specifier) &&
                  t.isIdentifier(specifier.imported) &&
                  specifier.imported.name === 'vars'
                ) {
                  const binding = path.scope.getBinding(specifier.local.name);
                  if (!binding) {
                    return;
                  }

                  for (const refPath of binding.referencePaths) {
                    walk({
                      path: refPath,
                      deprecations: deprecationMap.vars,
                      code: this.file.code,
                      filename: this.filename,
                    });
                  }
                }
              }
            }
          }
        },
      },
    },
  };
}
