[![Fontastic Logo](/docs/logo.png)](https://github.com/tomshaw/fontastic) 

![Maintained][maintained-badge]
[![Make a pull request][prs-badge]][prs]
[![License][license-badge]](LICENSE.md)

[![Linux Build][linux-build-badge]][linux-build]
[![MacOS Build][macos-build-badge]][macos-build]
[![Windows Build][windows-build-badge]][windows-build]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]

# Introduction

Fontastic is a gorgeous font management and cataloging application. Features include temporary & permanent font installation, a breathtakingly beautiful interface, custom themes, glyph support, displayable table names, multi database support and much more.

## Screen Shots
As part of the documentation you can check out [screenshots here.](docs/screenshots/readme.md)

## Libraries Used

Fontastic was created with [Angular Electron](https://github.com/maximegris/angular-electron) boilerplate for quickly creating Angular Electron applications

+ [Electron.js](https://electronjs.org) - Build cross platform desktop apps with JavaScript, HTML, and CSS.
+ [Angular.js](https://github.com/angular/angular) - Development platform for building web and desktop applications
+ [Typeorm](https://github.com/typeorm/typeorm) - Data-Mapper ORM for TypeScript, ES7, ES6, ES5 with multi database support.
+ [opentype.js](https://github.com/opentypejs/opentype.js) - JavaScript parser and writer for TrueType and OpenType fonts.

## Getting Started

*Clone this repository locally:*

``` bash
git clone https://github.com/tomshaw/fontastic.git
```

There is an issue with `yarn` and `node_modules` when the application is built by the packager. Please use `npm` as dependencies manager. 

This project follows [Electron Builder two package.json structure](https://www.electron.build/tutorials/two-package-structure) in order to optimize final bundle and still support Angular `ng add` feature.

*Install dependencies with npm (used by Electron renderer process):*

``` bash
npm install
```

*Install NodeJS dependencies with npm (used by Electron main process):*

``` bash
cd app/
npm install
```

Finally run the application in development mode.

``` bash
npm start
```

## Resources
Need free fonts for testing? Checkout [www.typewolf.com](https://www.typewolf.com/google-fonts) an outstanding typography resource for designers.

## Contributing

The contribution guide can be found here [Contribution Guide](CONTRIBUTING.md).

## Code of Conduct

Please review and abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Fontastic is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

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
