<template>
    <div id="myModal" class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-card">
            <div class="card">
                <div class="mod-info-header">
                    <div class="fakeButtons-container">
                        <div class="fakeButton"></div>
                        <div class="fakeButton"></div>
                        <div class="fakeButton"></div>
                        <p style="font-weight: bold; margin-left: 10px;">ProfileCreator.exe</p>
                    </div>
                </div>
                <div class="input-container">
                    <h2 class="subtitle" style="margin-bottom: 5px;">Profile name</h2>
                    <input class="input is-link" v-model="ProfileName" type="text" placeholder="My new profile" />
                    <p v-if="ProfileName == ''" style="font-weight: bold;color: var(--soft-critical-color);">This field
                        is required</p>
                    <h2 class="subtitle" style="margin-bottom: 5px; margin-top: 15px;">Mod folder</h2>
                    <div style="display: flex; align-items: center;">
                        <input class="input is-link" v-model="SaveLocation" type="text" placeholder="C:/game/mods" style="flex: 1;" />
                        <button class="button folderButton" @click="selectFolder" style="margin-left: 10px;">
                            <i class="fas fa-folder-open"></i>
                        </button>
                    </div>
                    <p v-if="!isPathValid && SaveLocation != ''"
                        style="font-weight: bold;color: var(--soft-critical-color);">This path is not valid</p>
                    <p v-if="SaveLocation == ''" style="font-weight: bold;color: var(--soft-critical-color);">This field
                        is required</p>
                    <p v-if="!FolderExists && isPathValid" style="font-weight: bold;color: var(--soft-critical-color);">
                        This folder does not exist</p>
                </div>
                <div>
                    <div class="button-container">
                        <button @click="closeModal" class="animated-button button icon-button">
                            <i class="fas fa-xmark"></i>
                            <span class="button-text">Cancel</span>
                        </button>
                        <button v-if="areFieldsValid" @click="createGameProfile"
                            class="animated-button button icon-button">
                            <i class="fas fa-save"></i>
                            <span class="button-text">Save</span>
                        </button>
                        <button v-else disabled class="animated-button button icon-button">
                            <i class="fas fa-ban"></i>
                            <span class="button-text">Cannot save</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { loadSetting } from '../../utils/settings';
import { createGameProfile, getGameProfileWithSteamId } from '../../utils/databaseQuery';
import { openFolderDialog } from '../../utils/osFunctions';

export default {
    name: 'NewProfileModal',
    props: {
        game_id: {
            type: String,
            required: true,
        },
        GameName: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            ProfileName: '',
            SaveLocation: '',
            isOpen: true,
            FolderExists: false,
            SteamCmdLocation: null,
            SteamCmdModPath: null,
            SteamApiKey: null,
        };
    },
    computed: {
        isPathValid() {
            const regex = /^(?:[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\?)*|\/(?:[^\/]+\/?)*)$/;
            return regex.test(this.SaveLocation);
        },
        areFieldsValid() {
            console.log('ProfileName:', this.ProfileName, 'SaveLocation:', this.SaveLocation, 'isPathValid:', this.isPathValid, 'FolderExists:', this.FolderExists);
            return this.ProfileName !== '' && this.SaveLocation !== '' && this.isPathValid && this.FolderExists;
        },
    },
    watch: {
        SaveLocation(newPath) {
            if (newPath) {
                this.doesFolderExist();
            }
        },
    },
    methods: {
        doesFolderExist() {
            window.api.checkFileExists(this.SaveLocation).then((exists) => {
                console.log('Received file existence result:', exists);

                if (typeof exists === 'boolean') {
                    this.FolderExists = exists; // Update FolderExists directly
                }
            }).catch((error) => {
                console.error('Error checking file existence:', error);
            });
        },
        closeModal() {
            this.$emit('closeModal');
        },
        closeModalAndAccess(id) {
            this.$emit('closeModalAndAccess', id);
        },
        async createGameProfile() {
            if (!this.areFieldsValid) {
                alert('Fields are not valid!');
                return;
            }
            // Create path for disabled mods
            const disabledPath = this.SaveLocation.replace(/\/?$/, '') + "_disabled";
            console.log('Creating game profile:', this.ProfileName, this.SaveLocation, disabledPath, this.game_id);

            const response = await createGameProfile(this.ProfileName, this.SaveLocation, disabledPath, this.game_id);
            console.log('Game profile created and responded with:', response);
            this.closeModalAndAccess(response);
        },
        async loadAllSettings() {
            try {
                console.log('Loading the settings...')
                this.SteamCmdLocation = await loadSetting('SteamCmd_Path');
                this.SaveLocation = await loadSetting('SaveLocation');
                this.SteamApiKey = await loadSetting('SteamApiKey');
                this.SteamCmdModPath = await loadSetting('SteamCmd_ModPath');
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
        selectFolder() {
            openFolderDialog().then((result) => {
                if (result) {
                    this.SaveLocation = result;
                    console.log('Selected folder:', this.SaveLocation);
                } else {
                    console.log('No folder selected');
                }
            }).catch((error) => {
                console.error('Error selecting folder:', error);
            });
        },
    },
    mounted() {
        this.loadAllSettings()
        console.log('Mounted NewProfileModal component with game_id:', this.game_id, "and gameName:", this.GameName);
        // Todo: fix the game finder, the database fetch works but the input does not update
        try {
            getGameProfileWithSteamId(this.game_id).then((result) => {
                console.log('Fetched game profiles:', result);
                if (result.length > 0) {
                    this.ProfileName = result[0].name + " 2";
                    this.SaveLocation = result[0].path;
                }
            }).catch((error) => {
                console.error('Error fetching game profiles:', error);
            });
        } catch (error) {
            console.log('Error fetching game profiles:', error);
        }
        if (this.ProfileName == '' && this.GameName != '') {
            this.ProfileName = this.GameName + " Profile";
        }
        else if (this.ProfileName == '') {
            this.ProfileName = "My new profile";
        } else {
            console.log("Something went wrong with the profile name, it is empty and the game name is also empty");
        }
    }
}
</script>

<style scoped>
.modal-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: auto;
    width: 35%;
    max-width: 90%;
    max-height: 90%;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    border-radius: 8px;
}

.card {
    padding: 0px;
    height: 100%;
    width: 95%;
}

.fakeButtons-container {
    padding-top: 5px;
}

.input-container {
    padding-top: 15px;
    padding-left: 10px;
    padding-right: 10px;
}

.button-container {
    float: right;
    margin: 10px;
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