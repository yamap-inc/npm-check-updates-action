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

export const executeOutdated = async () => {
  let stdout = '';

  const execOptions: object = {
    ignoreReturnCode: true,
    listeners: {
      stdout: (data: Buffer) => {
        stdout += data.toString();
      },
    },
  };
  const args = ['--long', '--json'];

  await exec('npm outdated', args, execOptions);

  if (stdout.trim().length === 0) {
    return [];
  }

  const json = JSON.parse(stdout);
  return Object.keys(json).map((key) => {
    const { current, wanted, latest, homepage } = json[key];
    return { name: key, current, wanted, latest, homepage };
  });
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
    linkableName += ':zap:';
  }
  return `| ${linkableName} | ${pkg.from} | ${pkg.to} |`;
};

export const formatAsColumns = async (packages: Package[]) => {
  if (packages.length === 0) {
    return '';
  }

  const keys = Object.keys(packages[0]).filter((key) => key !== 'homepage');

  const headerRow = `| ${keys.join('|')} |`;
  const alignRow = `| ${keys.map(() => ':--').join('|')} |`;
  const itemRows = packages.map((pkg) => getItemRow(pkg));

  return [headerRow, headerRow, alignRow, ...itemRows].join(os.EOL);
};
