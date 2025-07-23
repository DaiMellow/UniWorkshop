# UniWorkshop

<img src="https://github.com/user-attachments/assets/1659616b-711c-44dc-9319-1598696c96a8" alt="UniWorkshop Icon" width="256"/>

> **UniWorkshop** is a cross‑platform mod manager that lets you browse, install, and update Steam Workshop mods for games you own *outside* of Steam – no Steam license for the game required.

---

## ✨ Features

* **One‑click install** – fetch any Workshop item through **SteamCMD** automatically.
* **Profiles** – create isolated mod sets for different saves or play styles.
* **Rich previews** – view thumbnails, descriptions, likes, and ratings before installing.
* **Cross‑platform** – pre‑built binaries for Windows and Linux *(macOS planned).*

### 🚧 Planned

* **Automatic updates** – keep your mods in sync with the Workshop version.
* **Game modules** – community‑made modules to add support for additional games.

## 📸 Screenshots

| Mod Browser                                                                                      | Profile Manager                                                                              |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| ![Mod Previews](https://github.com/user-attachments/assets/cc2c084b-121f-421b-91a4-83175fde3b2d) | ![Profiles](https://github.com/user-attachments/assets/d43c6cc3-828f-4bc7-92b0-52cbd3b257ab) |

## 🚀 Getting Started

### Download

Grab the latest release from the **[Releases](https://github.com/TheGoldenFear/UniWorkshop/releases)** page and run the executable anywhere.

### Requirements

| Requirement                | Why                                                                |
| -------------------------- | ------------------------------------------------------------------ |
| **SteamCMD**               | Command‑line client used under the hood to download Workshop items |
| Windows 10+ / modern Linux | Supported operating systems                                        |
| Internet connection        | Needed to download mods                                            |
| **Steam API key**          | Required to view mod info (API‑free mode is in development)        |

> **Tip:** If **SteamCMD** isn’t found, UniWorkshop can download the latest build on first launch.
> *(Currently Windows‑only.)*

## 🛠️ Building from Source

**Prerequisites**

* [Node.js](https://nodejs.org/) ≥ 20
* npm ≥ 10
* Git

```bash
# Clone the repo
$ git clone https://github.com/DaiMellow/UniWorkshop.git
$ cd UniWorkshop

# Install dependencies
$ npm install

# Build the Electron app
$ npm run electron:build
```

The packaged executables will be placed in the `dist/` directory.

## 📒 Usage

1. Launch **UniWorkshop**.
2. Paste the Steam Workshop URL or item ID.
3. Pick a profile (or create a new one).
4. Click **Install** – done!

Mods are stored by default in your SteamCMD path if no profiles were used:

> If default installation path was used

* **Windows:** `%APPDATA%/UniWorkshop/SteamCmd/steamapps/workshop/content/[gameid]`
* **Linux:** `~/.config/UniWorkshop/SteamCmd/steamcmd/steamapps/workshop/content/[gameid]`

You can change this path under **Settings → Default Path**.

## 🙌 Contributing

Bug reports, feature requests are welcome! I don't plan on taking pull requests.

## License

This project is **source-visible** but not open source.  
See the [LICENSE](./LICENSE) file for full usage terms.

## Attribution

This project uses [Font Awesome Free](https://fontawesome.com), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See the [LICENSE](./LICENSE) file for details.

---

### Disclaimer

UniWorkshop is **not** affiliated with Valve Corporation or Steam. Use at your own risk and respect each game developer’s terms of service.
