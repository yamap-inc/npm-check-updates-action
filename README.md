<p align="center">
  <a href="https://github.com/SotaSuzuki/npm-package-update-action/action"><img alt="javscript-action status" src="https://github.com/yamap-inc/ncu-action/workflows/package-update/badge.svg"></a>
</p>

# ncu-action

This action is to update npm package dependencies even major update using ncu.

## Inputs

### `package_manager`

- which package manager you are using in the project
- default: `npm`
- available values are: `npm` and `yarn`

## Outputs

### `has_update`

- whether new version available or not
- the result must be `yes` or `no`

### `formatted_as_json`

- new version information as json

### `formatted_as_columns`

- new version information as formatted with column style for markdown table
