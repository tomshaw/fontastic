# Fontastic

![Maintained][maintained-badge]
[![Make a pull request][prs-badge]][prs]
[![License][license-badge]](LICENSE.md)

[![Linux Build][linux-build-badge]][linux-build]
[![MacOS Build][macos-build-badge]][macos-build]
[![Windows Build][windows-build-badge]][windows-build]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

Fontastic is a cross-platform font management and cataloging application built with Angular and Electron.

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

[maintained-badge]: https://img.shields.io/badge/maintained-yes-brightgreen
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: https://github.com/tomshaw/fontastic/blob/main/LICENSE.md
[prs-badge]: https://img.shields.io/badge/PRs-welcome-red.svg
[prs]: http://makeapullrequest.com

[linux-build-badge]: https://github.com/tomshaw/fontastic/workflows/Linux%20Build/badge.svg
[linux-build]: https://github.com/tomshaw/fontastic/actions?query=workflow%3A%22Linux+Build%22
[macos-build-badge]: https://github.com/tomshaw/fontastic/workflows/MacOS%20Build/badge.svg
[macos-build]: https://github.com/tomshaw/fontastic/actions?query=workflow%3A%22MacOS+Build%22
[windows-build-badge]: https://github.com/tomshaw/fontastic/workflows/Windows%20Build/badge.svg
[windows-build]: https://github.com/tomshaw/fontastic/actions?query=workflow%3A%22Windows+Build%22

[github-watch-badge]: https://img.shields.io/github/watchers/tomshaw/fontastic.svg?style=social
[github-watch]: https://github.com/tomshaw/fontastic/watchers
[github-star-badge]: https://img.shields.io/github/stars/tomshaw/fontastic.svg?style=social
[github-star]: https://github.com/tomshaw/fontastic/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20fontastic!%20https://github.com/tomshaw/fontastic%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/tomshaw/fontastic.svg?style=social
