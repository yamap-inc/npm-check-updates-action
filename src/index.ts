import * as core from '@actions/core';
import * as io from '@actions/io';
import ncu from 'npm-check-updates';

import { executeOutdated, convertToPackages, formatAsColumns } from './lib';

async function run() {
  try {
    await io.which('npm', true);

    const outdatedPackages = await executeOutdated();
    const packages = await convertToPackages(outdatedPackages);

    await ncu.run({ packageManager: 'npm' });

    core.setOutput('has_update', packages.length > 0 ? 'yes' : 'no');
    core.setOutput('formatted_as_json', JSON.stringify(packages));
    core.setOutput('formatted_as_columns', await formatAsColumns(packages));
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();

export default run;
