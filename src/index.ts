import * as core from '@actions/core';
import * as io from '@actions/io';
import { exec } from '@actions/exec';
// import ncu from 'npm-check-updates';
import path from 'path';

import { executeOutdated, convertToPackages, formatAsColumns } from './lib';

async function run() {
  const workingDir = core.getInput('path', { required: false });

  try {
    const packageManager = (core.getInput('package_manager', {
      required: false,
    }) || 'npm') as 'yarn' | 'npm';
    await io.which(packageManager, true);

    const outdatedPackages = await executeOutdated({ packageManager });
    const packages = await convertToPackages(outdatedPackages);

    console.log('outdated: ', outdatedPackages);

    // await ncu.run({
    //   packageFile: './' + path.join(workingDir || '', './package.json'),
    //   packageManager,
    //   upgrade: true,
    // });
    const execOptions = workingDir ? { cwd: workingDir } : {};
    if (packageManager === 'npm') {
      await exec('npm install', [], execOptions);
    } else if (packageManager === 'yarn') {
      await exec('yarn install', [], execOptions);
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
