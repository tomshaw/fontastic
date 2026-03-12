# Fontastic

[![Angular](https://img.shields.io/badge/Angular-21-dd0031?style=plastic&logo=angular&logoColor=white)](https://angular.dev)
[![Electron](https://img.shields.io/badge/Electron-40-47848f?style=plastic&logo=electron&logoColor=white)](https://electronjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=plastic)](LICENSE.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-22c55e?style=plastic)](http://makeapullrequest.com)

[![Linux Build][linux-build-badge]][linux-build]
[![MacOS Build][macos-build-badge]][macos-build]
[![Windows Build][windows-build-badge]][windows-build]

[![GitHub Stars](https://img.shields.io/github/stars/tomshaw/fontastic?style=plastic&logo=github&label=Stars)](https://github.com/tomshaw/fontastic/stargazers)
[![GitHub Watchers](https://img.shields.io/github/watchers/tomshaw/fontastic?style=plastic&logo=github&label=Watchers)](https://github.com/tomshaw/fontastic/watchers)

Fontastic is an Electron-based font management and cataloging application built for organizing, browsing, and inspecting font libraries.

## Features

- Nested collections — organize fonts into hierarchical groups with drag-and-drop
- Smart collections — auto-populate collections using rule-based filters on font metadata
- Advanced search — quickly find fonts with powerful search and filtering
- Glyph inspector — browse and examine individual characters and Unicode points
- Waterfall preview — compare text rendering across multiple sizes at a glance
- Font table viewer — read raw OpenType and TrueType metadata tables
- Cross-platform — builds for Windows, macOS, and Linux

## Getting Started

*Clone this repository locally:*

``` bash
git clone https://github.com/tomshaw/fontastic.git
```

Install dependencies with npm:

``` bash
npm install
```

Run the application in development mode:

``` bash
npm start
```

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Angular](https://angular.dev) 21 |
| Desktop | [Electron](https://electronjs.org) 40 |
| Language | [TypeScript](https://www.typescriptlang.org) 5.9 |
| Database | [TypeORM](https://typeorm.io) + SQLite |
| Font Parsing | [Fontkit](https://github.com/foliojs/fontkit) |
| Styling | [Tailwind CSS](https://tailwindcss.com) 4 + SCSS |
| i18n | [@ngx-translate](https://github.com/ngx-translate/core) |
| Testing | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) |
| Linting | [ESLint](https://eslint.org) + [Prettier](https://prettier.io) |
| Packaging | [electron-builder](https://www.electron.build) |

## Requirements

- Node.js >= 22.12.0

## Resources

Need free fonts for testing?

+ [IBM Plex](https://github.com/IBM/plex) - IBM's corporate typeface family.
+ [Inter](https://github.com/rsms/inter) - A typeface designed for computer screens.
+ [Type Wolf](https://www.typewolf.com/google-fonts) - Typography resource for designers.
+ [Font Squirrel](https://www.fontsquirrel.com/) - Hand-picked, high-quality, commercial-use fonts.
+ [Google Fonts](https://github.com/google/fonts) - Download all Google Fonts.

## Contributing

See the [Contribution Guide](CONTRIBUTING.md).

## License

Fontastic is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

[repo]: https://github.com/tomshaw/fontastic

[linux-build-badge]: https://github.com/tomshaw/fontastic/workflows/Linux%20Build/badge.svg
[linux-build]: https://github.com/tomshaw/fontastic/actions?query=workflow%3A%22Linux+Build%22
[macos-build-badge]: https://github.com/tomshaw/fontastic/workflows/MacOS%20Build/badge.svg
[macos-build]: https://github.com/tomshaw/fontastic/actions?query=workflow%3A%22MacOS+Build%22
[windows-build-badge]: https://github.com/tomshaw/fontastic/workflows/Windows%20Build/badge.svg
[windows-build]: https://github.com/tomshaw/fontastic/actions?query=workflow%3A%22Windows+Build%22

