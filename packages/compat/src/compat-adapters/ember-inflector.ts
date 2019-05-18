import V1Addon from '../v1-addon';
import AddToTree from '../add-to-tree';
import { Tree } from 'broccoli-plugin';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { removeSync } from 'fs-extra';

const makeConfigurable = `
if (Ember.ENV.EXTEND_PROTOTYPES === true || Ember.ENV.EXTEND_PROTOTYPES.String) {
  Object.defineProperty(String.prototype, 'pluralize', { configurable: true });
  Object.defineProperty(String.prototype, 'singularize', { configurable: true });
  Object.defineProperty(Ember, 'Inflector', { configurable: true });
  Object.defineProperty(Ember.String, 'singularize', { configurable: true });
  Object.defineProperty(Ember.String, 'pluralize', { configurable: true });
}
`;

const patch = `import './make-configurable';`;

export default class extends V1Addon {
  get v2Tree(): Tree {
    return new AddToTree(super.v2Tree, outputDir => {
      let target = join(outputDir, 'index.js');
      let source = readFileSync(target);
      // we need to remove first because we might be dealing with a
      // broccoli-produced symlink to a file we really don't want to alter.
      removeSync(target);
      writeFileSync(target, patch + source);
      writeFileSync(join(outputDir, 'make-configurable.js'), makeConfigurable);
    });
  }
}
