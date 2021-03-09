import * as core from '@actions/core';
import * as io from '@actions/io';
import { exec } from '@actions/exec';
import ncu from 'npm-check-updates';

import { executeOutdated, convertToPackages, formatAsColumns } from './lib';

async function run() {
  try {
    const packageManager = (core.getInput('package_manager', {
      required: false,
    }) || 'npm') as 'yarn' | 'npm';
    if (packageManager === 'yarn') {
      await exec('npm install -g yarn');
    }
    await io.which(packageManager, true);

    const outdatedPackages = await executeOutdated({ packageManager });
    const packages = await convertToPackages(outdatedPackages);

    await ncu.run({ packageManager, upgrade: true });
    if (packageManager === 'npm') {
      await exec('npm install');
    } else if (packageManager === 'yarn') {
      await exec('yarn install');
    }

    core.setOutput('has_update', packages.length > 0 ? 'yes' : 'no');
    core.setOutput('formatted_as_json', JSON.stringify(packages));
    core.setOutput('formatted_as_columns', await formatAsColumns(packages));
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();

export default run;
