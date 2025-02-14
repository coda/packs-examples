'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.rule = exports.MessageIds = void 0;
const typescript_estree_1 = require('@typescript-eslint/typescript-estree');
var MessageIds;
(function (MessageIds) {
  MessageIds['MultipleSpecifiersFound'] = 'MultipleSpecifiersFound';
})(MessageIds || (exports.MessageIds = MessageIds = {}));
exports.rule = Object.freeze({
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: {
      description: 'Requires a single specifier per import statement.',
      url: '',
    },
    fixable: 'code',
    messages: {
      [MessageIds.MultipleSpecifiersFound]: 'Imports from the same module should be split into multiple statements',
    },
    schema: [],
  },
  create: context => {
    return {
      ImportDeclaration: node => {
        if (node.specifiers.length > 1) {
          context.report({
            messageId: MessageIds.MultipleSpecifiersFound,
            node,
            fix: fixer => {
              const imports = node.specifiers.map(spec => {
                const importName = spec.local.name;
                let importText = 'import ';
                switch (spec.type) {
                  case typescript_estree_1.AST_NODE_TYPES.ImportDefaultSpecifier:
                    importText += `${importName} from `;
                    break;
                  case typescript_estree_1.AST_NODE_TYPES.ImportNamespaceSpecifier:
                    importText += `* as ${importName} from `;
                    break;
                  case typescript_estree_1.AST_NODE_TYPES.ImportSpecifier:
                    const importSourceName =
                      spec.imported.type === typescript_estree_1.AST_NODE_TYPES.Identifier
                        ? spec.imported.name
                        : spec.imported.value;
                    if (importSourceName !== importName) {
                      importText += `{${importSourceName} as ${importName}} from `;
                    } else {
                      importText += `{${importName}} from `;
                    }
                    break;
                }
                importText += `${node.source.raw};`;
                return importText;
              });
              return fixer.replaceText(node, imports.join('\n'));
            },
          });
        }
      },
    };
  },
});
