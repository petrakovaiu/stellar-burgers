const fs = require('node:fs');

const filename = 'package.json';
if (!fs.existsSync(filename)) {
  throw new Error(
    'Запустите скрипт из корня вашего проекта, где лежит package.json.'
  );
}
const pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
pkg.scripts = {
  ...pkg.scripts,
  test: 'jest --config jest.config.cjs',
  'test:watch': 'jest --config jest.config.cjs --watch',
  'test:coverage': 'jest --config jest.config.cjs --coverage',
  'test:e2e': 'playwright test --config playwright.config.ts',
  'test:e2e:ui': 'playwright test --config playwright.config.ts --ui',
};
pkg.devDependencies = {
  ...pkg.devDependencies,
  '@playwright/test': '1.55.1',
  jest: '29.7.0',
  '@types/jest': '29.5.14',
  'ts-jest': '29.4.14',
};
fs.writeFileSync(filename, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(
  'Команды тестирования и devDependencies добавлены в package.json. Теперь выполните npm install.'
);
