# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.5] - 2021-08-21

### Fixed

- Exclude test files from build output
- Don't mutate original buffer while decoding
- Round half away from zero to match Photoshop's rounding

## [0.0.4] - 2021-08-07

### Changed

- Added typed on() overload for the book event for AcbStreamDecoder

### Fixed

- Made AcbStreamDecoder constructor options optional like it is in Transform

## [0.0.3] - 2021-08-07

### Added

- Added TypeScript definitions

### Added

- Added CHANGELOG.md

## [0.0.2] - 2021-08-06

### Fixed

- Use Rollup to create CJS and ESM bundles so that the package can be actually imported.

## [0.0.1] - 2021-07-16

_Deprecated. Can't be actually imported._

### Added

- Initial working implementation
