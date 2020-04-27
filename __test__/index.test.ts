import { execSync } from 'child_process';
import path from 'path';

test('test run', () => {
  const ip = path.join(__dirname, '..', 'dist', 'index.js');
  expect(execSync(`node ${ip}`).toString()).toBeTruthy();
});
