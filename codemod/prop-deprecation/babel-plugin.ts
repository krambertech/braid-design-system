import type { PluginObj, PluginPass, Visitor } from '@babel/core';
import { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import dedent from 'dedent';
import {
  deprecatedPropMap,
  getPropReplacement,
  isDeprecatedProp,
} from './deprecatedPropMap';

const deArray = <T>(input: T | T[]) =>
  Array.isArray(input) ? input[0] : input;

interface Context extends PluginPass {
  importNames: Map<string, string>;
  namespace: string | null;
}

type StringLiteralPath = NodePath<t.StringLiteral>;
const updateStringLiteral = (
  path: StringLiteralPath,
  componentName: string,
  propName: string,
) => {
  if (isDeprecatedProp(componentName, propName)) {
    path.node.value = getPropReplacement(
      componentName,
      propName,
      path.node.value,
    );
  }
};

interface SubVisitorContext extends Context {
  componentName: string;
  propName?: string;
  propLocation?: t.SourceLocation;
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

    updateStringLiteral(path, this.componentName, this.propName);
  },
  ObjectProperty(path) {
    if (
      !this.propName &&
      !path.node.computed &&
      t.isIdentifier(path.node.key)
    ) {
      this.propName = path.node.key.name;
      this.propLocation = path.node.key.loc;
    } else if (t.isStringLiteral(path.node.key)) {
      this.propName = path.node.key.value;
      this.propLocation = path.node.key.loc;
    } else {
      // eslint-disable-next-line no-console
      console.warn(`
Untraceable computed object property:
  ${this.filename}

The following object is being spread onto '${
        this.componentName
      }' and contains computed properties.
You should check that there are no usages of deprecated properties in this object.

${createHighlightedCodeFrame(this.file.code, path.node.key.loc)}
        `);
    }
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
        updateStringLiteral(
          initPath as StringLiteralPath,
          this.componentName,
          this.propName,
        );
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

Variable \`${variableName}\` is assigned to the ${this.propName} prop of ${
          this.componentName
        }, but is imported from '${importSource}'.
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
      this.importNames = new Map<string, string>();
      this.namespace = null;
    },
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
                  Object.keys(deprecatedPropMap).includes(
                    specifier.imported.name,
                  )
                ) {
                  this.importNames.set(
                    specifier.local.name,
                    specifier.imported.name,
                  );
                } else if (t.isImportNamespaceSpecifier(specifier)) {
                  this.namespace = specifier.local.name;
                }
              }
            }
          }
        },
      },
      JSXOpeningElement(path) {
        let elementName = null as string | null;

        if (t.isJSXMemberExpression(path.node.name)) {
          elementName =
            t.isJSXIdentifier(path.node.name.object) &&
            path.node.name.object.name === this.namespace
              ? path.node.name.property.name
              : null;
        } else if (
          typeof path.node.name.name === 'string' &&
          this.importNames.has(path.node.name.name)
        ) {
          elementName = this.importNames.get(path.node.name.name);
        }

        if (elementName) {
          path.get('attributes').forEach((attr) => {
            if (t.isJSXAttribute(attr.node)) {
              if (typeof attr.node.name.name !== 'string') {
                return;
              }

              const attributeValue = deArray(attr.get('value'));

              if (t.isStringLiteral(attributeValue.node)) {
                updateStringLiteral(
                  attributeValue as StringLiteralPath,
                  elementName,
                  attr.node.name.name,
                );
              } else {
                attributeValue.traverse(subVisitor, {
                  ...this,
                  componentName: elementName,
                  propName: attr.node.name.name,
                  propLocation: attr.node.loc,
                  recurses: 0,
                });
              }
            } else if (t.isJSXSpreadAttribute(attr.node)) {
              attr.traverse(subVisitor, {
                ...this,
                componentName: elementName,
                recurses: 0,
              });
            }
          });
        }
      },
      CallExpression(path) {
        if (
          t.isV8IntrinsicIdentifier(path.node.callee) ||
          !t.isIdentifier(path.node.callee)
        ) {
          return;
        }

        const callee = this.importNames.get(path.node.callee.name);
        if (callee) {
          path.node.arguments.forEach((arg) => {
            if (t.isIdentifier(arg)) {
              const argBinding = path.scope.getBinding(arg.name);
              if (!argBinding) {
                return;
              }
              argBinding.path.traverse(subVisitor, {
                ...this,
                componentName: callee,
                recurses: 0,
              });
            } else if (t.isObjectExpression(arg)) {
              const argumentsValue = deArray(path.get('arguments'));
              argumentsValue.traverse(subVisitor, {
                ...this,
                componentName: callee,
                recurses: 0,
              });
            }
          });
        }
      },
    },
  };
}

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

export function varsPlugin(): PluginObj<Context> {
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
                      deprecations: deprecatedPropMap.vars,
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
