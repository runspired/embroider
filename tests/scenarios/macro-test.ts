import { appScenarios } from './scenarios';
import { PreparedApp, Project } from 'scenario-tester';
import QUnit from 'qunit';
import merge from 'lodash/merge';
import { dirname } from 'path';
import { loadFromFixtureData } from './helpers';
const { module: Qmodule, test } = QUnit;

appScenarios
  .map('macro-tests', project => {
    let macroSampleAddon = Project.fromDir(dirname(require.resolve('../addon-template/package.json')), {
      linkDeps: true,
    });
    let funkySampleAddon = Project.fromDir(dirname(require.resolve('../addon-template/package.json')), {
      linkDeps: true,
    });

    macroSampleAddon.pkg.name = 'macro-sample-addon';
    funkySampleAddon.pkg.name = '@embroider/funky-sample-addon';

    merge(macroSampleAddon.files, loadFromFixtureData('macro-sample-addon'));
    merge(funkySampleAddon.files, loadFromFixtureData('funky-sample-addon'));
    merge(project.files, loadFromFixtureData('macro-test'));

    funkySampleAddon.linkDependency('broccoli-merge-trees', { baseDir: __dirname });
    funkySampleAddon.linkDependency('broccoli-funnel', { baseDir: __dirname });
    funkySampleAddon.linkDependency('@embroider/macros', { baseDir: __dirname });
    macroSampleAddon.linkDependency('@embroider/macros', { baseDir: __dirname });
    project.linkDevDependency('@embroider/macros', { baseDir: __dirname });

    project.addDevDependency(macroSampleAddon);
    project.addDevDependency(funkySampleAddon);
  })
  .forEachScenario(scenario => {
    Qmodule(scenario.name, function (hooks) {
      let app: PreparedApp;
      hooks.before(async () => {
        app = await scenario.prepare();
      });

      ['production', 'development'].forEach(env => {
        test(`yarn test: ${env}`, async function (assert) {
          let result = await app.execute('yarn test');
          assert.equal(result.exitCode, 0, result.output);
        });
      });
    });
  });
