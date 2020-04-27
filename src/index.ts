import * as core from '@actions/core';

async function run() {
  try {
    core.setOutput('has_update', 'yes');
    core.setOutput('formatted_as_json', '[]');
    core.setOutput('formatted_as_columns', '|--|');
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();

export default run;
