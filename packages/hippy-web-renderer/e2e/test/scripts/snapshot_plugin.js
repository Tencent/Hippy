const filepath = require('path');
const { declare } = require('@babel/helper-plugin-utils');
const { types } = require('@babel/core');

module.exports = declare((api, opts) => {
  api.assertVersion(7);

  return {
    name: 'transform-snapshot',

    visitor: {
      CallExpression(path, file) {
        const { filename } = file;
        const callee = path.get('callee');
        if (callee.node.name === 'snapshot') {
          const args = callee.container.arguments;
          const snapshotFilepath = filepath.relative(
            opts.workspacePath,
            filepath.join(
              opts.snapshotPath,
              filepath.relative(opts.testPath, filename),
            ),
          );

          const testIdentifier = types.identifier('test');
          const parentIdentifier = types.identifier('parent');
          const titleIdentifier = types.identifier('title');

          const thisExpression = types.thisExpression();
          const testExpression = types.memberExpression(thisExpression, testIdentifier);
          const parentExpression = types.memberExpression(testExpression, parentIdentifier);
          if (args.length === 0) {
            // snapshot() => snapshot(null, this.test.title, this.test.parent.title, filename)
            args.push(types.nullLiteral());
            args.push(types.memberExpression(testExpression, titleIdentifier));
            args.push(types.memberExpression(parentExpression, titleIdentifier));
            args.push(types.stringLiteral(snapshotFilepath));
          } else if (args.length === 1) {
            // snapshot(0.1) => snapshot(0.1, this.test.title, this.test.parent.title, filename)
            args.push(types.memberExpression(testExpression, titleIdentifier));
            args.push(types.memberExpression(parentExpression, titleIdentifier));
            args.push(types.stringLiteral(snapshotFilepath));
          }
        }
      },
    },
  };
});
