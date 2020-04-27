import * as lib from '../src/lib';
import fixture from './fixtures/outdated_packages.json';

describe('convertToPackages', () => {
  test('updates exist', async (done) => {
    const packages = await lib.convertToPackages(fixture);
    expect(packages.length).toBe(4);
    done();
  });
});

describe('getLinkableName', () => {
  test('to be linkable', () => {
    const pkg: lib.Package = {
      name: 'jest',
      from: '25.4.0',
      to: '25.4.0',
      url: 'https://github.com/facebook/jest',
    };
    expect(lib.getLinkableName(pkg)).toBe(
      '[jest](https://github.com/facebook/jest)'
    );
  });
});

describe('haasMajorUpdate', () => {
  test('major update exists', () => {
    const pkg: lib.Package = {
      name: 'jest',
      from: '24.4.0',
      to: '25.4.0',
      url: 'https://github.com/facebook/jest',
    };
    expect(lib.hasMajorUpdate(pkg)).toBe(true);
  });
  test('major update does not exist', () => {
    const pkg: lib.Package = {
      name: 'jest',
      from: '25.4.0',
      to: '25.4.0',
      url: 'https://github.com/facebook/jest',
    };
    expect(lib.hasMajorUpdate(pkg)).toBe(false);
  });
});

describe('formatAsColumns', () => {
  test('works', async (done) => {
    const packages: lib.Package[] = [
      {
        name: 'jest',
        from: '25.4.0',
        to: '25.4.0',
        url: 'https://github.com/facebook/jest',
      },
    ];
    expect(await lib.formatAsColumns(packages)).toBeDefined();
    done();
  });
});
