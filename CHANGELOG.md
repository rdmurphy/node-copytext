# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- It's now possible to pass a function (instead of an Array) to `include` or `exclude` for supplying custom logic for filtering. A supplied function will be given a list of the sheets available as a parameter, and is expected to return an Array of sheets to include or exclude.

### Changed

- The `includeSheets` option is now called `include`.
- The `excludeSheets` option is now called `exclude`.

### Removed

- It is no longer possible to pass a single string to `include` or `exclude` - an Array is **always** required, even for single values.

## [2.1.0]

### Added

- Add support for `includeSheets` and `excludeSheets` options on `copytext.process`

## [2.0.0]

### Added

- First steps for adding custom processors
- Better testing and coverage reporting overall

### Changed

- Change API to use `copytext.process` instead of `copytext` to be more future-friendly

### Removed

- Remove `marked` dependency and Markdown support
