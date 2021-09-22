import type { PluginPass, Visitor } from '@babel/core';
import { types as t } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import { deprecationMap } from './deprecationMap';
import {
  deArray,
  updateStringLiteral,
  createHighlightedCodeFrame,
} from './helpers';

interface Context extends PluginPass {
  importNames: Map<string, string>;
  namespace: string | null;
}

interface SubVisitorContext extends Context {
  componentName: string;
  propName?: string;
  propLocation?: t.SourceLocation;
  recurses: number;
}

export const subVisitor: Visitor<SubVisitorContext> = {
  StringLiteral(path) {
    if (this.recurses > 9) {
      // eslint-disable-next-line no-console
      console.error('Too many recurses');
      return;
    }

    updateStringLiteral(path, this.componentName, this.propName);
  },
  ObjectProperty(path) {
    const deprecations = deprecationMap[this.componentName];
    if (deprecations) {
      if (
        !path.node.computed &&
        t.isIdentifier(path.node.key) &&
        deprecations[path.node.key.name]
      ) {
        path.traverse(subVisitor, {
          ...this,
          propName: path.node.key.name,
          propLocation: path.node.loc,
          recurses: this.recurses + 1,
        });
      }

      if (path.node.computed) {
        if (
          t.isStringLiteral(path.node.key) &&
          deprecations[path.node.key.value]
        ) {
          path.traverse(subVisitor, {
            ...this,
            propName: path.node.key.value,
            propLocation: path.node.loc,
            recurses: this.recurses + 1,
          });
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
      }
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
          initPath as Parameters<typeof updateStringLiteral>[0],
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
