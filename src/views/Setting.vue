<template>
    <div class="mod-info-header">
        <div class="fakeButtons-container">
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
        </div>
        <div class="mod-info-content">
            <h1 class="title">Settings</h1>
        </div>
    </div>
    <div class="tabs is-boxed" style="margin-bottom: 0px;">
        <ul>
            <li :class="{ 'is-active': pageSelected === 'steamcmd' }">
                <a @click="pageSelected = 'steamcmd'">
                    <span class="icon is-small"><i class="fas fa-terminal" aria-hidden="true"></i></span>
                    <span>SteamCmd</span>
                </a>
            </li>
            <li :class="{ 'is-active': pageSelected === 'uniworkshop' }">
                <a @click="pageSelected = 'uniworkshop'">
                    <span class="icon is-small"><i class="fas fa-wrench" aria-hidden="true"></i></span>
                    <span>UniWorkshop</span>
                </a>
            </li>
            <li :class="{ 'is-active': pageSelected === 'other' }">
                <a @click="pageSelected = 'other'">
                    <span class="icon is-small"><i class="fas fa-screwdriver-wrench" aria-hidden="true"></i></span>
                    <span>Other</span>
                </a>
            </li>
        </ul>
    </div>
    <div
        style="padding-top: 0px; padding-left: 0px; padding-right: 10px; overflow-y: auto; overflow-x: hidden; min-height: calc(100vh - 250px); max-height: calc(100vh - 250px);">
        <div v-if="pageSelected === 'steamcmd'">
            <h1 class="title" style="margin-top: 10px;">SteamCmd Settings</h1>
            <p class="subtitle" style="color: var(--text-secondary-color); padding-top: 10px;">Change the settings of
                SteamCmd and other
                related settings.</p>
            <!-- SteamCmd Path -->
            <h2 class="subtitle">Change SteamCmd's path</h2>
            <div style="display: flex; align-items: center;">
                <input class="input is-link" v-model="SteamCmdLocation" type="text"
                    placeholder="C:/steamcmd/steamcmd.exe" style="flex: 1;" />
                <button class="button folderButton" @click="selectFolder('steamcmd')" style="margin-left: 10px;">
                    <i class="fas fa-folder-open"></i>
                </button>
            </div>
            <p v-if="!steamPathIsValid" style="font-weight: bold;color: var(--soft-critical-color);">This
                path is not valid</p>
            <p v-else-if="SteamCmdLocation == ''" style="font-weight: bold;color: var(--soft-critical-color);">This
                field
                is required</p>

            <!-- Download Path -->
            <h2 class="subtitle">Change base SteamCmd download path <span
                    style="font-size: x-small;padding-left: 5px;">(Optional)</span></h2>
            <p style="font-size: 0.9em; color: #ffc107; margin-top: 5px;">
                Note: This setting is optional and should only be modified if necessary.
            </p>
            <div style="display: flex; align-items: center;">
                <input class="input is-link" v-model="SaveLocation" type="text" placeholder="C:/game/mods"
                    style="flex: 1;" />
                <button class="button folderButton" @click="selectFolder('save')" style="margin-left: 10px;">
                    <i class="fas fa-folder-open"></i>
                </button>
                <button class="button is-danger" title="Reset" @click="SaveLocation = SteamCmdLocation"
                    style="margin-left: 10px;">
                    <i class="fas fa-rotate-right"></i>
                </button>
            </div>
            <p v-if="!saveLocationValid" style="font-weight: bold;color: var(--soft-critical-color);">This
                path is not valid</p>

            <!-- Api Key -->
            <h2 class="subtitle">Change Steam's API key</h2>
            <div style="display: flex; align-items: center;">
                <input class="input is-link" :type="showApiKey ? 'text' : 'password'" v-model="SteamApiKey"
                    placeholder="12313213213123123213" style="flex: 1;" />
                <button class="button" @click="toggleShowApiKey" style="margin-left: 10px;">
                    <i :class="showApiKey ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
            </div>
            <p v-if="!isSteamApiKeyValid && SteamApiKey != ''"
                style="font-weight: bold;color: var(--soft-critical-color);">
                This
                key is not valid</p>
            <p v-if="SteamApiKey == ''" style="font-weight: bold;color: var(--soft-critical-color);">This field
                is required</p>
        </div>
        <div v-if="pageSelected === 'uniworkshop'">
            <h1 class="title" style="margin-top: 10px;">UniWorkshop Settings</h1>
            <p class="subtitle" style="color: var(--text-secondary-color); padding-top: 10px;">Change the settings of
                the app.</p>
            <!-- Performance Mode -->
            
            <h2 class="subtitle">Performance Mode<span
                    style="font-size: x-small;padding-left: 5px;">(Recommended)</span></h2>
            <div style="display: flex; align-items: center;">
                <label for="performanceMode" style="flex: 1;">Locks the framerate of the background animations to
                    5fps (Performance) or makes it static (Ultra Performance).</label>
                <DropDownComponent style="padding-left: 10px;" :elements="PerformanceProfiles" :preselectedElement="assignedPerformanceProfile"
                    dropDirection="down" :shouldDropDownShowSelection="true" @select="selectPerformanceProfile"
                    :allowCreateNew="false" :allowNone="false" />
            </div>
        </div>
        <div v-if="pageSelected === 'other'">
            <h1 class="title" style="margin-top: 10px;">Other Settings</h1>
            <p class="subtitle" style="color: var(--text-secondary-color); margin-top: 10px;">Other settings that are
                not directly related to
                SteamCmd or UniWorkshop.</p>
            <h2 class="subtitle">Restart Onboarding</h2>
            <p class="smaller-subtitle" style="color: var(--text-secondary-color);">Opens the onboarding popup.</p>
            <button @click="restartOnboarding" class="button"
                style="width: auto; margin-top: 10px; margin-right: 10px;">
                <i class="fas fa-rotate-right" style="padding-right: 15px; font-size: 1.5em;"></i>
                Restart first time setup</button>
            <h2 class="subtitle">Clear all data</h2>
            <p class="smaller-subtitle" style="color: var(--text-secondary-color);">This will clear all data from the
                app,
                including settings and downloaded mods.</p>
            <button @click="clearAllData" class="button" style="width: auto; margin-top: 10px; margin-right: 10px;">
                <i class="fas fa-trash" style="padding-right: 15px; font-size: 1.5em;"></i>
                Reset the app</button>
            <h2 class="subtitle">Open logs</h2>
            <p class="smaller-subtitle" style="color: var(--text-secondary-color);">Opens the logs file in your default
                text
                editor.</p>
            <p class="warning-text">The log contains confidential data do not share with non-trusted users.</p>
            <button @click="openLogs" class="button" style="width: auto; margin-top: 10px; margin-right: 10px;">
                <i class="fas fa-newspaper" style="padding-right: 15px; font-size: 1.5em;"></i>
                Open Logs</button>
            <h2 class="subtitle">Get all data</h2>
            <p class="smaller-subtitle" style="color: var(--text-secondary-color);">Fetches all data from the app and
                logs it
                to the console and log file.</p>
            <button @click="getAllData" class="button" style="width: auto; margin-top: 10px; margin-right: 10px;">
                <i class="fas fa-list" style="padding-right: 15px; font-size: 1.5em;"></i>
                Log all data</button>
        </div>
    </div>
    <div class="button-container" style="padding-top: 10px;">
        <button v-if="steamPathIsValid && isSteamApiKeyValid && saveLocationValid"
            class="animated-button button icon-button" style="background-color: var(--success-color)"
            @click="saveNewSettings">
            <i class="fas fa-floppy-disk"></i>
            <span v-if="!hasSaved" class="button-text">Save</span>
            <span v-else class="button-text">Saved 🌟</span>
        </button>
        <button v-else disabled class="animated-button button icon-button">
            <i class="fas fa-ban"></i>
            <span class="button-text">Cannot save</span>
        </button>
        <button class="animated-button button icon-button" @click="closeThePage">
            <i class="fas fa-arrow-right-from-bracket"></i>
            <span class="button-text">Exit</span>
        </button>
    </div>
</template>

<script>
import { getAllData, loadSetting, saveSetting } from '../../utils/settings';
import { openFolderDialog, checkSteamCmdExists, doesFolderExist } from '../../utils/osFunctions';
import DropDownComponent from '../components/DropDownComponent.vue';

export default {
    name: 'Setting',
    components: { DropDownComponent },
    props: {
    },
    emits: ['closePage'],
    data() {
        return {
            SteamCmdLocation: '',
            Saved_SteamCmdLocation: '',
            Last_SteamCmdLocation: '',
            SaveLocation: '',
            Last_SaveLocation: '',
            SteamApiKey: '',
            UsesAnonymous: true,
            hasSaved: false,
            steamPathIsValid: false,
            saveLocationValid: false,
            showApiKey: false,
            enabled: false,
            SteamCmdModPath: null,
            SteamCmdModPathValid: false,
            performanceProfile: "",
            pageSelected: 'steamcmd',
            dropdownActivePerformanceProfile: false,
            assignedPerformanceProfile: {},
            PerformanceProfiles: [{
                id: "0",
                name: 'Off',
            }, {
                id: "1",
                name: 'Performance',
            }, {
                id: "2",
                name: 'Ultra Performance',
            }],
        };
    },
    watch: {
        SteamCmdLocation: {
            immediate: true,
            handler: async function () {
                this.steamPathIsValid = await this.isSteamPathValid();
            }
        },
        SaveLocation: {
            immediate: true,
            async handler() {
                console.log('SaveLocation changed:', this.SaveLocation, 'Last_SaveLocation:', this.Last_SaveLocation);
                if ((this.SaveLocation == null && this.Last_SaveLocation == null) || this.SaveLocation == this.SteamCmdLocation) {
                    this.saveLocationValid = true;
                } else if (this.SaveLocation !== this.Last_SaveLocation) {
                    this.saveLocationValid = await doesFolderExist(this.SaveLocation);
                } else if (this.SaveLocation == this.Last_SaveLocation) {
                    this.saveLocationValid = true;
                } else {
                    this.saveLocationValid = false;
                }
            },
        },
    },
    computed: {
        isSteamApiKeyValid() {
            console.log('checking', this.SteamApiKey)
            const regex = /^[A-Za-z0-9]{32}$/i;
            const test = regex.test(this.SteamApiKey);
            if (test) {
                this.enabled = true;
            } else {
                this.enabled = false;
            }
            return test;
        },
    },
    methods: {
        selectPerformanceProfile(profile) {
            this.assignedPerformanceProfile = profile;
            this.dropdownActivePerformanceProfile = false; // Close the dropdown after selection
            console.log('Selected profile:', profile);
        },
        closeThePage() {
            this.$emit('closePage');
        },
        toggleShowApiKey() {
            this.showApiKey = !this.showApiKey;
        },
        async isSteamPathValid() {
            if (this.SteamCmdLocation == this.Saved_SteamCmdLocation) {
                return true;
            } else if (this.SteamCmdLocation == '') {
                return false;
            } else if (this.SteamCmdLocation != this.Last_SteamCmdLocation) {
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
            } else {
                // Should not reach here, but just in case
                console.error('Unexpected case: SteamCmdLocation is neither empty nor different from Saved_SteamCmdLocation');
                return false;
            }
        },
        async selectFolder(type) {
            try {
                const result = await openFolderDialog();
                if (result) {
                    if (type === 'steamcmd') {
                        this.SteamCmdLocation = result;
                    } else if (type === 'save') {
                        this.SaveLocation = result;
                    }
                } else {
                    console.log('No folder selected');
                }
            } catch (error) {
                console.error('Error selecting folder:', error);
            }
        },
        saveNewSettings() {
            saveSetting('SteamCmd_Path', this.SteamCmdLocation)
            saveSetting('SaveLocation', this.SaveLocation)
            saveSetting('SteamApiKey', this.SteamApiKey)
            saveSetting('PerformanceMode', this.assignedPerformanceProfile.id)
            this.hasSaved = true;
            setTimeout(() => {
                this.hasSaved = false;
            }, 3000);
        },
        async loadAllSettings() {
            try {
                console.log('Loading the settings...')
                this.SteamCmdLocation = await loadSetting('SteamCmd_Path');
                this.SaveLocation = await loadSetting('SaveLocation');
                this.Last_SaveLocation = this.SaveLocation;
                this.SteamApiKey = await loadSetting('SteamApiKey');
                this.SteamCmdModPath = await loadSetting('SteamCmd_ModPath');
                let perfMode = await loadSetting('PerformanceMode');
                // Converts it to the correct type
                this.assignedPerformanceProfile = this.PerformanceProfiles.find(profile => profile.id === perfMode) || this.PerformanceProfiles[1];
                console.log('SteamCmdModPath:', this.SteamCmdModPath)
                console.log('SteamCmdPath:', this.SteamCmdLocation)
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
        async clearAllData() {
            window.api.clearDatabase()
                .then(() => {
                    console.log('Database cleared successfully.');
                })
                .catch((error) => {
                    console.error('Failed to clear database:', error);
                });
        },
        async restartOnboarding() {
            await saveSetting('OnboardingComplete', false)
            const result = await loadSetting('OnboardingComplete')
            console.log('saved:', result)
            window.location.reload();
            this.closeThePage();
        },
        async getAllData() {
            console.log('Fetching all data...')
            const data = await getAllData()
            console.log('all data:', data)
        },
        async openLogs() {
            window.api.openLogFile()
                .then(() => {
                    console.log('Logs opened successfully.');
                })
                .catch((error) => {
                    console.error('Failed to open logs:', error);
                });
        },
    },
    mounted() {
        this.loadAllSettings()
    }
}
</script>

<style scoped>
.circle-image {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
}

.subtitle {
    margin: 0;
    display: flex;
    align-items: center;
}

.smaller-subtitle {
    font-size: 0.9em;
    color: var(--text-secondary-color);
}

.warning-text {
    color: var(--warning-color);
    font-size: 0.9em;
    font-weight: bold;
}

.fakeButtons-container {
    display: flex;
    gap: 5px;
}

.fakeButton {
    width: 25px;
    height: 10px;
    background-color: var(--text-secondary-color);
    border-radius: 3px;
    margin-left: 10px;
}

::-webkit-scrollbar {
    width: 20px;
}

::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: var(--text-secondary-color);
    border-radius: 10px;
}


.mod-info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.mod-info-content {
    display: flex;
    align-items: center;
    gap: 10px;
}

.fakeButtons-container {
    display: flex;
    gap: 5px;
}

.fakeButton {
    width: 25px;
    height: 10px;
    background-color: var(--text-secondary-color);
    border-radius: 3px;
    margin-left: 10px;
}

.mod-info-card {
    transition: opacity 0.5s ease, transform 0.5s ease;
    transform: scale(0);
    opacity: 0;
    z-index: 1;
    margin-bottom: 20px;
    width: 95%;
    display: flex;
    flex-direction: column;
}

h2 {
    margin-top: 15px;
    padding-top: 10px;
}

input {
    margin-top: 2px;
}
</style>