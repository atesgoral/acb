# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][1],
and this project adheres to [Semantic Versioning][2].

[1]: https://keepachangelog.com/en/1.0.0/
[2]: https://semver.org/spec/v2.0.0.html

## [Unreleased]

### Changed

## [0.4.0] - 2021-08-24

- Handle trimming/padding of color codes internally

## [0.3.0] - 2021-08-24

### Changed

- Removed the redundant isSpot property. Lab color books are spot color books.

## [0.2.1] - 2021-08-22

### Fixed

- Rebuild dist folder

## [0.2.0] - 2021-08-22

_Deprecated. Updated .d.ts files weren't included._

### Changed

- Renamed properties with more accurate terms: colorSpace -> colorModel,
  colorNameSuffix -> colorNamePostfix, pageMidPoint -> pageKey

## [0.1.0] - 2021-08-21

### Added

- Add CI integration and add badges to README

## [0.0.6] - 2021-08-21

### Added

- Add property descriptions to README

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

- Use Rollup to create CJS and ESM bundles so that the package can be actually
  imported.

## [0.0.1] - 2021-07-16

_Deprecated. Can't be actually imported._

### Added

- Initial working implementation
