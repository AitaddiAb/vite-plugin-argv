# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-05

### Added
- Initial release of `vite-plugin-argv`.
- Support for `--before-serve` and `--after-serve` hooks in dev mode.
- Support for `--before-build` and `--after-build` hooks in build mode.
- Support for both `--key=value` and `--key value` CLI argument formats.
- Complete shell command support via `child_process.spawn`.
- Build failure tracking to skip post-build hooks on error.
- Full TypeScript type definitions.
- Unit and integration tests.
