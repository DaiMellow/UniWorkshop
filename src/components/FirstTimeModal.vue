<template>
    <div id="myModal" class="modal is-active" v-if="!OnboardingComplete">
        <div class="modal-background"></div>
        <div class="modal-card" style="height: 80%; width: 85%;">
            <div class="card" style="padding: 0px; height: 100%; width: 95%;">
                <div class="mod-info-header">
                    <div class="fakeButtons-container" style="padding-top: 5px;">
                        <div class="fakeButton"></div>
                        <div class="fakeButton"></div>
                        <div class="fakeButton"></div>
                        <p style="font-weight: bold; margin-left: 10px;">Onboarding.exe</p>
                    </div>
                </div>
                <div style="margin-top: 5px; padding: 10px; height: 80%; background-color: var(--secondary-color);">
                    <div v-if="loadedPage == 0">
                        <h1 class="title">Welcome to UniWorkshop</h1>
                        <h2 class="subtitle">This is a utility to simplify the installations of mods
                            using SteamCmd.</h2>
                        <h2>This program has a few prerequisite the following pages will help you set them up.</h2>
                        <br>
                        <h2>You will setup the following: </h2>
                        <ul style="font-weight: bold;">
                            <li>• SteamCmd</li>
                            <li>• A steam API key</li>
                        </ul>
                    </div>
                    <div v-if="loadedPage == 1">
                        <h1 class="title">What's SteamCmd and is it safe?</h1>
                        <h2>SteamCMD is a command-line tool made by Steam for installing and updating game servers that
                            allows the installation of files with anonymous accounts. This program uses SteamCmd in
                            order to request the mod's files. SteamCmd is an official tool offered by steam and wont
                            cause
                            any issues with your account.</h2>
                        <br>
                        <p>If you wish to read more about steamcmd or want to view the manual installation guide, you
                            may visit the Valve
                            Developer Community</p>
                    </div>
                    <div v-if="loadedPage == 2">
                        <h1 class="title">Installation of SteamCmd</h1>
                        <br>
                        <h2 class="subtitle" style="margin-bottom: 0px;">Click here to install SteamCmd</h2>
                        <p class="subtitle" style="font-size: smaller; font-weight: bold; color: var(--text-secondary-color);">Only available on Windows</p>

                        <div class="file has-name" v-if="!isInstalling && isWindows" @click="installSteamCmd">
                            <label class="file-label">
                                <span class="file-cta">
                                    <span class="file-icon">
                                        <i class="fas fa-download"></i>
                                    </span>
                                    <span class="file-label"> Install SteamCmd </span>
                                </span>
                                <span class="file-name" style="min-width: 600px;"> Save
                                    Location: {{ SteamCmdLocation
                                    }} </span>
                            </label>
                        </div>
                        <div class="file has-name" v-if="isInstalling">
                            <label class="file-label">
                                <span class="file-cta">
                                    <span class="file-icon">
                                        <i class="fas fa-hourglass-half"></i>
                                    </span>
                                    <span class="file-label"> Installing SteamCmd </span>
                                </span>
                                <span class="file-name" style="min-width: 600px;"> Save
                                    Location: {{ SteamCmdLocation
                                    }} </span>
                            </label>
                        </div>
                        <p v-if="isInstalling">This may take a few minutes. (Step {{ progressBarValue }}/4)</p>
                        <progress v-if="isInstalling" class="progress is-small is-primary" max="100"></progress>
                        <p>Change path?</p>
                        <div style="display: flex; align-items: center;">
                            <input v-if="!isInstalling" class="input is-link" v-model="SteamCmdLocation" type="text"
                                placeholder="C:/steamcmd/steamcmd.exe" />
                            <input v-else disabled class="input is-link" v-model="SteamCmdLocation" type="text"
                                placeholder="C:/steamcmd/steamcmd.exe" />
                            <button class="button folderButton" @click="selectFolder" style="margin-left: 10px;">
                                <i class="fas fa-folder-open"></i>
                            </button>
                        </div>
                        <p style="color: var(--success-secondary-color)">You can also point to
                            the folder with the steamcmd executable <b><u>if you already installed it !</u></b></p>
                        <p v-if="enabled && SteamCmdLocation != '' && !isInstalling"
                            style="color: var(--success-secondary-color);">
                            Found an installation.</p>
                        <div class="button-container" style="margin-top: 10px;">
                            <button class="animated-button button icon-button"
                                @click="openLink('https://developer.valvesoftware.com/wiki/SteamCMD')">
                                <i class="fas fa-globe"></i>
                                <span class="button-text">Manual Install</span>
                            </button>
                        </div>
                    </div>
                    <div v-if="loadedPage == 3">
                        <h1 class="title">What's Steam's API and is it safe?</h1>
                        <h2>The Steam API is a tool for developers that lets them connect their games and applications
                            to the Steam platform. It allows access to features like user accounts, game statistics,
                            achievements, workshop items and descriptions or in-game items. This app will only use it to
                            access mod info to display it to you.
                        </h2>
                        <br>
                        <p>If you wish to read more about Steam's API, you
                            may visit https://steamcommunity.com/dev</p>
                        <button class="animated-button button icon-button"
                            @click="openLink('https://steamcommunity.com/dev')">
                            <i class="fas fa-globe"></i>
                            <span class="button-text">Visit the website.</span>
                        </button>
                    </div>
                    <div v-if="loadedPage == 4">
                        <h1 class="title">Setting up your Steam Api Key</h1>
                        <h2>To setup a Steam api key, you will need to go to steam's website and request one. In the
                            domain field, you are free to input whatever you want.
                        </h2>
                        <div class="button-container" style="margin-top: 10px;">
                            <h1 class="subtitle">Open website: </h1>
                            <button class="animated-button button icon-button"
                                @click="openLink('https://steamcommunity.com/dev/apikey')">
                                <i class="fas fa-key"></i>
                                <span class="button-text">Request a key.</span>
                            </button>
                        </div>
                        <h2 class="subtitle" style="margin-bottom: 0px;">Insert the key here:</h2>
                        <input class="input is-link" v-model="SteamApiKey" type="text"
                            placeholder="A1A1A1A1A1A1A1A1A1A1A1A1A1" />
                        <p v-if="!enabled && SteamApiKey" style="color: var(--warning-color);">
                            The key appears to be invalid.</p>
                        <p style="margin-top: 10px">If you wish to read more about Steam's API, you
                            may visit https://steamcommunity.com/dev/apiterms</p>
                        <button class="animated-button button icon-button"
                            @click="openLink('https://steamcommunity.com/dev/apiterms')">
                            <i class="fas fa-globe"></i>
                            <span class="button-text">Visit the website.</span>
                        </button>
                    </div>
                    <div v-if="loadedPage == 5">
                        <h1 class="title">You're now ready to use the app!</h1>
                        <h2>If you wish to change any setting or reopen this prompt, you'll be able to do with on the
                            setting screen.</h2>
                    </div>
                </div>
                <div>
                    <div class="button-container" style="float: right; margin: 10px;">
                        <button v-if="loadedPage != 0" class="animated-button button icon-button" @click="goBack">
                            <i class="fas fa-arrow-left"></i>
                            <span class="button-text">Back</span>
                        </button>
                        <button v-if="enabled" class="animated-button button icon-button" @click="ChangePage">
                            <i class="fas fa-arrow-right"></i>
                            <span class="button-text">Continue</span>
                        </button>
                        <button v-else disabled class="animated-button button icon-button">
                            <i class="fas fa-ban"></i>
                            <span class="button-text">Cant Continue</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { loadSetting, saveSetting } from '../../utils/settings';
import { getSteamCmdExeName, getOs, openFolderDialog, checkSteamCmdExists } from '../../utils/osFunctions';


export default {
    name: 'FirstTimeModal',
    props: {
    },
    data() {
        return {
            SteamCmdLocation: '',
            SteamCmdModPath: '',
            SaveLocation: '',
            SteamApiKey: '',
            UsesAnonymous: true,
            loadedPage: 0,
            userDataPath: '',
            enabled: true,
            isInstalling: false,
            input: '',
            OnboardingComplete: false,
            progressBarValue: 0,
            isWindows: false,
        };
    },
    watch: {
        SteamCmdLocation: {
            immediate: true,
            handler: async function () {
                if (this.loadedPage == 2) {
                    this.enabled = await this.isSteamPathValid();
                }
            }
        },
        SteamApiKey: {
            immediate: true,
            handler: async function () {
                if (this.loadedPage == 4) {
                    this.enabled = await this.isSteamApiKeyValid();
                }
            }
        },
    },
    computed: {
    },
    methods: {
        isSteamApiKeyValid() {
            console.log('checking', this.SteamApiKey)
            const regex = /^[A-Za-z0-9]{32}$/i;
            const test = regex.test(this.SteamApiKey);
            if (test) {
                return true;
            } else {
                return false;
            }
            return false;
        },
        async isSteamPathValid() {
            const steamExeName = await getSteamCmdExeName()
            let filePath = this.SteamCmdLocation;
            const os = await getOs()
            // Changes the path from a file to a folder if the user selects the file
            const isWindows = os === 'win32';
            if (filePath.endsWith('/' + steamExeName)) {
                filePath = isWindows ? filePath.slice(0, -13) : filePath.slice(0, -12); // Remove the filename from the path
                console.log(`File path ends with ${steamExeName}, removing it:`, filePath);
                this.SteamCmdLocation = filePath; // Update the path in the data property
                console.log('Updated SteamCmdLocation:', this.SteamCmdLocation);
            }
            if (this.progressBarValue == 4 || this.loadedPage != -1) {
                console.log('forcing a recheck')
            }
            const regex = /^(?:[a-zA-Z]:)?[\\/](?:[^<>:"/\\|?*]+[\\/])*(?:[^<>:"/\\|?*]+)?$/i;
            const test = regex.test(this.SteamCmdLocation);
            if (test) {
                const isValid = await checkSteamCmdExists(this.SteamCmdLocation);
                console.log('isPathValid returned:', isValid, 'for path:', this.SteamCmdLocation)
                return isValid;
            } else {
                console.log('Invalid path:', this.SteamCmdLocation);
                return false;
            }
            return false;
        },
        async installSteamCmd() {
            console.log('installing steam')
            this.isInstalling = true;
            try {
                const { success, error, message } = await window.api.installSteamCMD(this.SteamCmdLocation)
                if (!success) throw new Error(error || message)

                this.SteamCmdLocation = this.SteamCmdLocation; // should force a reload
            } catch (error) {
                console.error('Error installing SteamCMD:', error);
                this.isInstalling = false;
            }
        },
        selectFolder() {
            openFolderDialog().then((result) => {
                if (result) {
                    this.SteamCmdLocation = result;
                    console.log('Selected folder:', this.SteamCmdLocation);
                } else {
                    console.log('No folder selected');
                }
            }).catch((error) => {
                console.error('Error selecting folder:', error);
            });
        },
        async ChangePage() {
            this.enabled = true;
            console.log('user selected change page')
            this.loadedPage += 1;
            if ((this.loadedPage == 2 || this.loadedPage == 4) && this.enabled) {
                this.enabled = false
                if (!this.SteamCmdLocation) {
                    this.SteamCmdLocation = this.userDataPath
                }
                // Checks if the paths are valid and reenable the button
                if (this.loadedPage == 2) {
                    this.enabled = await this.isSteamPathValid();
                } else if (this.loadedPage == 4) {
                    this.enabled = await this.isSteamApiKeyValid();
                }
            }
            if (this.loadedPage == 6) {
                this.OnboardingComplete = true;
                await saveSetting('SteamCmd_Path', this.SteamCmdLocation)
                await saveSetting('SaveLocation', this.SteamCmdLocation)
                const os = await getOs()
                // For linux support, the path isn't the same
                if (os == 'linux') {
                    // Remove the last folder from the path
                    const modPath = this.SteamCmdLocation.replace(/\/steamcmd$/, '');
                    await saveSetting('SteamCmd_ModPath', modPath)
                } else if (os == 'win32') {
                    await saveSetting('SteamCmd_ModPath', this.SteamCmdLocation)
                } else {
                    console.error('Unknown OS:', os);
                }
                await saveSetting('SaveLocation', this.SaveLocation)
                await saveSetting('SteamApiKey', this.SteamApiKey)
                await saveSetting('OnboardingComplete', true)
                console.log('Onboarding complete, settings saved:', this.SteamCmdLocation, this.SteamApiKey, this.SaveLocation)
                window.location.reload();
            }
        },
        openLink(url) {
            window.api.openLink(url).then(() => {
                console.log('Opened link:', url);
            }).catch((error) => {
                console.error('Error opening link:', error);
            });
        },
        goBack() {
            console.log('user selected change page')
            this.enabled = true;
            this.loadedPage -= 1;
        },
        async loadAllSettings() {
            try {
                console.log('Loading the settings...');
                this.SteamCmdLocation = await loadSetting('SteamCmd_Path');
                this.SteamCmdModPath = await loadSetting('SteamCmd_ModPath');
                this.SaveLocation = await loadSetting('SaveLocation');
                this.SteamApiKey = await loadSetting('SteamApiKey');
                this.OnboardingComplete = !!parseInt(await loadSetting('OnboardingComplete'), 10);
                console.log(`data loaded from Home.vue SteamCmdLocation ${this.SteamCmdLocation}, Save Location ${this.SaveLocation}, SteamApi ${this.SteamApiKey}, Onboarding ${this.OnboardingComplete}`)
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
    },
    async mounted() {
        this.loadAllSettings()
        try {
            const basePath = await window.api.getUserDataPath();
            this.userDataPath = `${basePath}/SteamCmd`;
            console.log('User Data Path:', basePath);
        } catch (err) {
            console.error('Failed to fetch user data path:', err);
        }
        window.api.onModProgress(({ step, error, output }) => {
            // note: progress callback gives either a step number or an error object
            if (error) {
                console.error('Install error:', output);
                this.isInstalling = false;
                return;
            }

            console.log('Progress step:', step);
            switch (step) {
                case 'File extracted':
                    this.progressBarValue = 1;
                    break;
                case 'SteamCMD installed':
                    this.progressBarValue = 2;
                    break;
                case 'Install started':
                    this.progressBarValue = 3;
                    break;
                case 'Install finished':
                    this.progressBarValue = 4;
                    this.isInstalling = false;
                    break;
                default:
                    if (typeof step === 'number') {
                        this.progressBarValue = step;
                    }
            }
        });
        this.isWindows = await window.api.getOs() === 'win32';
    },
    beforeDestroy() {
        window.api.removeModProgress();
    },
}
</script>

<style scoped>
.modal-card {
    width: 600px;
    height: 400px;
    max-width: 90%;
    max-height: 90%;
    overflow: auto;
}

.fakeButtons-container {
    display: flex;
    align-items: center;
    gap: 5px;
}

.fakeButton {
    width: 25px;
    height: 10px;
    background-color: var(--text-secondary-color);
    border-radius: 3px;
    margin-left: 10px;
}
</style>