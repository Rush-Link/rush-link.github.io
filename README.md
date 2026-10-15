# RushLink by Cygma Audio

This public repository hosts the [RushLink website](https://rush-link.github.io/) and its release-download catalog.

RushLink by Cygma Audio is a free, open-source companion app for HeadRush Prime, Flex Prime and Core. Its ToneMod and StageHand workspaces make tone auditioning, rig management and live control easier away from the pedal screen.

RushLink retains its cyan, blue and violet identity, with Cygma Audio as its maker credit. The website offers Dark, Light and System appearance choices and remembers the selection locally.

## Early alpha

RushLink is under active development. Back up important rigs before using an early build. Current Windows installers are unsigned, so Windows SmartScreen may display a warning.

## Download

Get [RushLink 0.1.3 for HeadRush firmware 5.2.0](https://github.com/Rush-Link/rush-link.github.io/releases/tag/rushlink-v0.1.3) from the release catalog. The [application repository release](https://github.com/Rush-Link/RushLink-App/releases/tag/rushlink-v0.1.3) contains matching source and release information. Installer binaries belong in Releases and are not committed here.

Windows x64 EXE/MSI and macOS Apple Silicon/Intel DMG builds are desktop alphas.
Linux x64 Debian/AppImage, Android ARM64 device and x86-64 emulator APKs, and iOS
unsigned IPA/simulator ZIP packages are previews. The catalog lists the assets
currently available. An unsigned IPA needs developer signing and provisioning
before physical installation; it is not an App Store or TestFlight package.

The application version remains **0.1.3**; **5.2.0** identifies the target HeadRush
firmware. Installer and preview filenames carry the `headrush-5.2.0` marker,
for example `RushLink_0.1.3_windows_x64_setup_headrush-5.2.0.exe` and
`RushLink_0.1.3_ios-simulator-arm64_headrush-5.2.0.app.zip`. The marker precedes
the entire compound `.app.zip` extension. Physical verification covers Flex Prime
on firmware 5.2.0; Prime, Core and native mobile hardware remain unverified.

## Contribute

The [application source](https://github.com/Rush-Link/RushLink-App) contains the
app, developer setup and [contribution guide](https://github.com/Rush-Link/RushLink-App/blob/main/CONTRIBUTING.md).
This repository contains the canonical website and its release-download catalog.
Changes to the application belong in the source repository; website copy,
accessibility and styling fixes belong here.

Serve `site/` with a static HTTP server to preview changes. Read
[site/README.md](site/README.md) for the structure, forms, validation and Pages
deployment. Submit a pull request with the change and how you checked it. Do not
commit installers, credentials or personal/device data.

## Feedback and support

- [Report an application problem or suggest an improvement](https://github.com/Rush-Link/RushLink-App/issues)
- [Report a website problem](https://github.com/rush-link/rush-link.github.io/issues)
- [Support continued development on Ko-fi](https://ko-fi.com/mattc_)
- [Visit the RushLink website](https://rush-link.github.io/)

The website code and documentation are available under the [MIT License](LICENSE).
The application is also MIT licensed. Its runtime font and dependency licenses
are documented in the
[application third-party notices](https://github.com/Rush-Link/RushLink-App/blob/main/THIRD_PARTY_NOTICES.md).
Trademark rights are separate from the code license.

RushLink is an independent project and is not affiliated with or endorsed by HeadRush or inMusic Brands.
