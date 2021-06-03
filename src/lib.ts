import * as core from '@actions/core';
import { exec } from '@actions/exec';
import os from 'os';

export interface OutdatedPackage {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  homepage: string;
}

export interface Package {
  name: string;
  from: string;
  to: string;
  url: string;
}

// @see https://github.com/masawada/yarn-outdated-formatter/blob/main/lib/parseYarnOutdatedJSON.js
export const parseYarnOutdatedJSON = (jsonString: string) => {
  // yarn <= 1.0.2
  try {
    const json = JSON.parse(jsonString);
    return json;
  } catch (e) {} // eslint-disable-line no-empty

  // yarn >= 1.2.1
  // try parsing multiple context json string
  let tokens = '';

  for (const token of jsonString.split(os.EOL)) {
    tokens += token;

    try {
      const json = JSON.parse(tokens);
      if (json.type === 'table') {
        return json;
      }
      tokens = '';
    } catch (e) {} // eslint-disable-line no-empty
  }

  return null;
};

export const getOutdatedPackagesByNpm = (jsonString: string) => {
  const json = JSON.parse(jsonString);
  return Object.keys(json).map((key) => {
    const { current, wanted, latest, homepage } = json[key];
    return { name: key, current, wanted, latest, homepage };
  });
};

export const getOutdatedPackagesByYarn = (jsonString: string) => {
  const json = parseYarnOutdatedJSON(jsonString);
  if (!json) throw new Error('Failed to parse yarn outdated JSON');
  delete json.type;
  delete json.data.head;
  return json.data.body.map((item: any) => {
    const [name, current, wanted, latest, , homepage] = item;
    return { name, current, wanted, latest, homepage };
  });
};

export const executeOutdated = async (
  options: {
    packageManager: 'yarn' | 'npm';
  } = {
    packageManager: 'npm',
  }
) => {
  let stdout = '';

  const path = core.getInput('path');
  const execOptions: object = {
    cwd: path,
    ignoreReturnCode: true,
    listeners: {
      stdout: (data: Buffer) => {
        // console.log('buffer:', data.toString());
        stdout += data.toString();
      },
    },
  };

  console.log('pre yarn outdated');

  if (options.packageManager === 'yarn') {
    const args = ['--json'];
    await exec('yarn outdated', args, execOptions);
  } else {
    const args = ['--long', '--json'];
    await exec('npm outdated', args, execOptions);
  }

  if (stdout.trim().length === 0) {
    return [];
  }

  if (options.packageManager === 'yarn') {
    const packages = getOutdatedPackagesByYarn(stdout);
    return packages;
  } else {
    return getOutdatedPackagesByNpm(stdout);
  }
};

export const convertToPackages = async (
  outdatedPackages: OutdatedPackage[]
) => {
  return outdatedPackages.map(({ name, current, latest, homepage }) => {
    return { name, from: current, to: latest, url: homepage };
  });
};

export const getLinkableName = ({ name, url }: Package) => {
  return `[${name}](${url})`;
};

export const hasMajorUpdate = ({ from, to }: Package) => {
  const fromMajorVer = parseInt(from.split('.')[0]);
  const toMajorVer = parseInt(to.split('.')[0]);
  return toMajorVer > fromMajorVer;
};

export const getItemRow = (pkg: Package) => {
  let linkableName = getLinkableName(pkg);
  if (hasMajorUpdate(pkg)) {
    linkableName = `:warning: ${linkableName}`;
  }
  return `| ${linkableName} | ${pkg.from} | ${pkg.to} |`;
};

export const formatAsColumns = async (packages: Package[]) => {
  if (packages.length === 0) {
    return '';
  }

  const keys = Object.keys(packages[0]).filter((key) => key !== 'url');

  const headerRow = `| ${keys.join('|')} |`;
  const alignRow = `| ${keys.map(() => ':--').join('|')} |`;
  const itemRows = packages.map((pkg) => getItemRow(pkg));

  return [headerRow, alignRow, ...itemRows].join(os.EOL);
};
