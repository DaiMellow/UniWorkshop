<template>
    <div class="mod-info-header">
        <div class="fakeButtons-container">
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
        </div>
        <div class="mod-info-content">
            <h1>Steam Workshop</h1>
            <img class="circle-image" alt="Steam Logo" src="../assets/SteamLogo.png" />
        </div>
    </div>
    <div class="columns is-mobile">
        <div class="column is-3">
            <div class="card modIconCard rotate">
                <img class="modIcon" :src="preview_url">
            </div>
            <div class="rotate" style="padding-left: 15px;">
                <span v-for="n in starArray.full" :key="'full-' + n">
                    <i class="fa-solid fa-lg fa-star"></i>
                </span>
                <span v-if="starArray.half">
                    <i class="fas fa-lg fa-solid fa-star-half-stroke"></i>
                </span>
                <span v-for="n in starArray.empty" :key="'empty-' + n">
                    <i class="fa-regular fa-lg fa-star"></i>
                </span>
            </div>
            <div class="icon-text-container">
                <div class="icon-text">
                    <i class="fas fa-lg fa-user-pen"></i>
                    <p>by: </p>
                    <img :src="user_avatarmedium" alt="User Icon" class="user-icon" />
                    <p>{{ user_name }}</p>
                </div>
                <div class="icon-text">
                    <i class="fas fa-lg fa-heart"></i>
                    <p>{{ favorites }} Favorites</p>
                </div>
                <div class="icon-text">
                    <i class="fas fa-lg fa-star"></i>
                    <p>{{ subs }} Subs</p>
                </div>
                <div class="icon-text">
                    <i class="fas fa-lg fa-eye"></i>
                    <p>{{ views }} views</p>
                </div>
            </div>
        </div>
        <div class="column is-9" style="padding-top: 0px;">
            <h1 class="title">{{ title || 'No Title' }}</h1>
            <div class="tags-container" style="max-height: calc(100vh - 699px);">
                <h3 class="subtitle">Tags:</h3>
                <div class="tags-wrapper">
                    <div class="tag" v-for="(tagObj, index) in tags.slice(0, 4)" :key="index">
                        <div class="card tags">
                            <p class="has-text-white" style="font-weight: bold;">{{ tagObj.tag }}</p>
                        </div>
                    </div>
                    <div v-if="tags.length > 4" class="tag">
                        <div class="card tags" :title="tags.slice(4).map(tagObj => tagObj.tag).join(', ')">
                            <p class="has-text-white" style="font-weight: bold;">{{ tags.length - 4 }} more</p>
                        </div>
                    </div>
                    <div v-if="tags.length == 0" class="tag">
                        <div class="card tags">
                            <p class="has-text-white" style="font-weight: bold;">No tags</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card" style="padding: 0; margin-left: 0;">
                <span>
                    <p style="background-color: #2D2A3F; padding: 5px;">Description</p>
                </span>
                <div class="desc-content" style="max-height: calc(100vh - 500px);min-height: calc(100vh - 500px)"
                    v-html="parsedDescription"></div>
            </div>
            <img src="../assets/weirdCross.svg" style="float: right;" alt="icon" />
            <div class="button-container">
                <button v-if="!isInstalling && !isInstalled" class="animated-button button icon-button"
                    @click="installMod">
                    <i class="fas fa-download"></i>
                    <span class="button-text">Download now</span>
                </button>
                <button v-if="!isInstalling && isInstalled" class="animated-button button icon-button"
                    @click="installMod">
                    <i class="fas fa-rotate"></i>
                    <span class="button-text">ReDownload now</span>
                </button>
                <button v-if="isInstalling" class="animated-button button" style="width: 250px;">
                    <i class="fas fa-download" style="font-size: 1.5em;"></i>
                    <div class="progress-container" style="padding-left: 15px;">
                        <span class="button-text" v-if="isInstalled && !hasFailed" style="float: left;">Installed
                            🌟</span>
                        <span class="button-text" v-if="isInstalled && hasFailed" style="float: left;">Install
                            failed!</span>
                        <span class="button-text" v-if="isInstalling && !isInstalled" style="float: left;">Installing...
                            ({{ progress }}/7)</span>
                        <progress style="height: 2px; width: 150px;" class="progress is-primary" :value="progress"
                            max="7"></progress>
                    </div>
                </button>
                <button class="animated-button button icon-button" @click="openLink">
                    <i class="fas fa-brands fa-steam"></i>
                    <span class="button-text">View on Steam</span>
                </button>
                <button v-if="isInstalled" class="animated-button button icon-button" @click="openModFolder">
                    <i class="fa-solid fa-folder"></i>
                    <span class="button-text">Open mod folder</span>
                </button>
                <DropDownComponent :elements="profiles" :preselectedElement="assignedProfile" dropDirection="up"
                    :shouldDropDownShowSelection="true" dropDownTitle="Profile: None" newItemText="Create New Profile"
                    noneItemText="None" @select="selectProfile" @create-new="isModalOpen = true" />
            </div>
            <div v-if="compatibility == 0">
                <p class="has-text-danger">This game may not support anonymous installs!</p>
            </div>
        </div>
    </div>
    <NewProfileModal v-if="isModalOpen" @closeModalAndAccess="(id) => closeModalAndAccess(id)" :GameName="GameName"
        :game_id="String(game_id)" @closeModal="closeModal" />
</template>

<script>
import { loadSetting } from '../../utils/settings';
import { getGameProfileWithSteamId, addModToProfile, createSteamIdName, getGameNameBySteamId, updateModCompatibility, getGameProfileWithUniqueId } from '../../utils/databaseQuery';
import DropDownComponent from '../components/DropDownComponent.vue';
import NewProfileModal from '../components/NewProfileModal.vue';
import { eventBus } from '../../utils/eventBus.js'
import { changeBackground } from '../../utils/colorProcessing.js';
import ScrollingTextComponent from '../components/ScrollingTextComponent.vue';
import DOMPurify from 'dompurify';

export default {
    name: 'ModInfo',
    components: {
        NewProfileModal,
        ScrollingTextComponent,
        DropDownComponent,
    },
    props: {
        title: {
            type: String,
            required: true
        },
        tags: {
            type: Array,
            required: true,
            default: () => []
        },
        favorites: {
            type: Number,
            required: true
        },
        subs: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            required: true
        },
        game_id: {
            type: [String, Number],
            required: true
        },
        mod_id: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        preview_url: {
            type: String,
            required: true
        },
        user_id: {
            type: String,
            required: true
        },
        user_name: {
            type: String,
            required: true
        },
        user_avatarmedium: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            isInstalling: false,   // Tracks if the mod is being installed
            progress: 0,           // Tracks the current progress (1-7 steps)
            isInstalled: false,
            SteamCmdLocation: '',
            SteamCmdModPath: '',
            SteamApiKey: '',
            SaveLocation: '',
            OnboardingComplete: false,
            modLocation: '',
            hasFailed: false,
            assignedProfile: null,
            dropdownActive: false, // Controls the dropdown visibility
            profiles: [],
            profilePath: '',
            isModalOpen: false, // Controls the modal visibility
            GameName: '',
            compatibility: 1,
            start_array: 0,
            end_array: 8,
        };
    },
    computed: {
        parsedDescription() {
            return this.parseSteamDescription(this.description);
        },
        starArray() {
            console.log('stars:', this.rating * 5);
            const roundedRating = Math.round((this.rating * 5) * 2) / 2; // Round to nearest 0.5
            const fullStars = Math.floor(roundedRating);
            const halfStar = roundedRating % 1 === 0.5 ? 1 : 0;
            const emptyStars = 5 - fullStars - halfStar;
            return {
                full: fullStars,
                half: halfStar,
                empty: emptyStars,
            };
        },
    },
    methods: {
        toggleDropdown() {
            this.dropdownActive = !this.dropdownActive;
        },
        selectProfile(profile) {
            this.assignedProfile = profile;
            this.dropdownActive = false; // Close the dropdown after selection
            console.log('Selected profile:', profile);
        },
        async loadAllSettings() {
            try {
                console.log('Loading the settings...');
                this.SteamCmdLocation = await loadSetting('SteamCmd_Path');
                this.SaveLocation = await loadSetting('SaveLocation');
                this.SteamApiKey = await loadSetting('SteamApiKey');
                this.SteamCmdModPath = await loadSetting('SteamCmd_ModPath');
                this.OnboardingComplete = !!parseInt(await loadSetting('OnboardingComplete'), 10);
                console.log(`data loaded from Home.vue SteamCmdLocation ${this.SteamCmdLocation}, Save Location ${this.SaveLocation}, SteamApi ${this.SteamApiKey}, Onboarding ${this.OnboardingComplete}`)
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
        openModFolder() {
            console.log(this.modLocation)
            window.api.openFolder(this.modLocation)
                .then((response) => {
                    if (response.success) {
                        console.log('Folder opened successfully.');
                    } else {
                        console.error('Failed to open folder:', response.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
        async installMod() {
            if (!this.isInstalling) {
                console.log('Starting mod installation...');
                this.isInstalling = true;
                this.progress = 0;
                this.isInstalled = false;
                this.hasFailed = false;

                let SteamCmdLocation = await loadSetting('SteamCmd_Path');
                let InstallLocation = await loadSetting('SaveLocation');
                if (this.assignedProfile != null) { // If a profile is selected, use the legacy installer
                    console.log('Starting legacy installer with profile:', this.assignedProfile.name);
                    window.api.anonInstallMod(this.mod_id, this.game_id, SteamCmdLocation)
                        .then((response) => {
                            if (response.success) {
                                console.log('Mod installed successfully.');
                            } else {
                                console.error('Failed to install mod:', response.error);
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                } else if (InstallLocation && InstallLocation != SteamCmdLocation) { // If no profile is selected, use the "custom" installer
                    console.log('Found a custom path!' + InstallLocation + ' ' + SteamCmdLocation);
                    window.api.anonInstallModCustomDirectory(this.mod_id, this.game_id, SteamCmdLocation, InstallLocation)
                        .then((response) => {
                            if (response.success) {
                                console.log('Mod installed successfully.');
                            } else {
                                console.error('Failed to install mod:', response.error);
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                } else {
                    console.warn('No profile selected and no custom path set!');
                    window.api.anonInstallMod(this.mod_id, this.game_id, SteamCmdLocation) // Fallback to the legacy installer
                        .then((response) => {
                            if (response.success) {
                                console.log('Mod installed successfully.');
                            } else {
                                console.error('Failed to install mod:', response.error);
                            }
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                }
            } else {
                console.log('Already installing!');
                eventBus.emit('notify', 'You are already installing a mod!');
            }
        },
        openLink() {
            const url = 'https://steamcommunity.com/sharedfiles/filedetails/?id=' + this.mod_id;
            window.api.openLink(url)
                .then((response) => {
                    if (response.success) {
                        console.log('Link opened successfully.');
                    } else {
                        console.error('Failed to open link:', response.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
        parseSteamDescription(description) {
            // Replace custom tags with HTML
            let html = description
                .replace(/\[h1\](.*?)\[\/h1\]/g, '<h1>$1</h1>')
                .replace(/\[h2\](.*?)\[\/h2\]/g, '<h2>$1</h2>')
                .replace(/\[h3\](.*?)\[\/h3\]/g, '<h3>$1</h3>')
                .replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
                .replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
                .replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
                .replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1" alt="image" />')
                .replace(/\r\n/g, '<br>'); // convert CRLF to <br>

            // Handle horizontal rules
            html = html.replace(/\[hr\]/g, '<hr>');

            // Handle unordered lists
            html = html.replace(/\[list\](.*?)\[\/list\]/gs, (match, content) => {
                const items = content.match(/(\[\*\].*?)(?=\[\*]|$)/gs);
                return '<ul>' + (items ? items.map(item => `<li>${item.replace(/^\[\*\]/, '').trim()}</li>`).join('') : '') + '</ul>';
            });

            // Handle ordered lists (if applicable)
            html = html.replace(/\[olist\](.*?)\[\/olist\]/gs, (match, content) => {
                const items = content.match(/(\[\*\].*?)(?=\[\*]|$)/gs);
                return '<ol>' + (items ? items.map(item => `<li>${item.replace(/^\[\*\]/, '').trim()}</li>`).join('') : '') + '</ol>';
            });

            // Fix for nested lists
            html = html.replace(/<ul>(.*?)<ul>(.*?)<\/ul>(.*?)<\/ul>/gs, (match, before, nested, after) => {
                return `<ul>${before}<li>${nested}</li>${after}</ul>`;
            });

            // Remove any <script> tags for security
            html = html.replace(/<script.*?>.*?<\/script>/gs, '');

            return DOMPurify.sanitize(html, { // Last step: sanitize the HTML
                ALLOWED_TAGS: [
                    'h1', 'h2', 'h3', 'strong', 'em', 'a', 'img',
                    'ul', 'ol', 'li', 'br', 'hr'
                ],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
                ALLOWED_URI_REGEXP: /^(?:https?:|\/\/|data:image\/)/
            });
        },
        async moveModToProfile() {
            if (this.assignedProfile == null) {
                console.info('No profile selected to install the mod to!');
                return;
            }

            console.log('Starting to move mod to profile folder...');
            const modPath = this.SteamCmdModPath + `/steamapps/workshop/content/${this.game_id}/${this.mod_id}`;
            const profilePath = this.assignedProfile.path;

            console.log('Calling the api to move the mod to the folder...');

            return window.api.moveFolder(modPath, profilePath)
                .then((response) => {
                    console.log('got response from the api:', response);
                    if (response.success) {
                        console.log("Mod moved successfully.");
                        this.modLocation = profilePath + `/${this.mod_id}`;
                        console.log("Mod location updated to:", this.modLocation);
                    } else {
                        console.error("Failed to move mod:", response.error);
                        eventBus.emit('notify', 'Critical error while moving mod: ' + response.error);
                        throw new Error(response.error);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    throw error;
                });
        },
        async createModEntry() {
            // This function is called when the user creates a new mod entry
            // It should create a new entry in the database for the mod and the profile
            console.log('Creating mod entry in the database...');
            if (this.assignedProfile == null) {
                console.info('No profile selected to create the mod entry for!');
                return;
            }
            // If a profile is selected, proceed to create the mod entry
            addModToProfile(this.title, this.modLocation, this.assignedProfile.id, this.game_id, this.mod_id, this.user_name, this.description, null, this.preview_url, "enabled", 0)
                .then((response) => {
                    if (response.success) {
                        console.log("Mod entry created successfully. Id: ", response.value);
                        return response.value;
                    } else {
                        console.error("Failed to create mod entry:", response);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        },
        queryDatabaseForProfiles() {
            getGameProfileWithSteamId(this.game_id).then((result) => {
                if (result) {
                    this.profiles = result;
                    console.log('Fetched game profiles:', result);
                } else {
                    console.info('No profile found for this game!');
                }
            });
        },
        closeModal() {
            this.isModalOpen = false;
            this.queryDatabaseForProfiles(); // Refresh the profiles after closing the modal
        },
        closeModalAndAccess(id) {
            console.log('Closing modal and accessing profile with ID:', id);
            this.isModalOpen = false;
            this.queryDatabaseForProfiles(); // Refresh the profiles after closing the modal
            getGameProfileWithUniqueId(id).then((result) => {
                if (result) {
                    console.log('Fetched profile:', result);
                    this.selectProfile(result[0]); // Set the assigned profile to the selected one
                } else {
                    console.error('Could not fetch the new profile with ID:', id);
                }
            })
        },
        async processInstalledMod() {
            try {
                console.log("Calling moveModToProfile...");
                await this.moveModToProfile();
                console.log("Calling createModEntry...");
                await this.createModEntry();
            } catch (error) {
                console.error('Error processing installed mod:', error);
                throw error; // Re-throw the error to handle it in the caller
            }
        },
        async getGameTitle() {
            const result = await getGameNameBySteamId(this.game_id);
            if (result) {
                console.log('Game name found:', result);
                this.GameName = result.game_name;
                this.compatibility = result.is_compatible;
                return result.game_name;
            } else {
                console.log('Game name/SteamId not found, creating new entry...');
                const response = await createSteamIdName(this.game_id);
                if (response) {
                    console.log('New game name created:', response.name);
                    this.GameName = response.name;
                    return response.name;
                } else {
                    console.error('Failed to create new game name!', response);
                }
            }
            console.log('Game name:', this.GameName);
        },
        errorHandler(error) {
            console.log(error);
            if (this.isInstalling && !this.hasFailed) {
                eventBus.emit('notify', 'Critical error while installing mod: ' + error);
                this.isInstalling = false; // Reset the install state on error
                this.hasFailed = true; // Set the failed state to true
                this.compatibility = 0; // Set the compatibility to false if an error occurred.
                console.log('Compatibility status set to false due to error:', this.compatibility);
                // Update compatibility status in the database
                updateModCompatibility(this.game_id, this.compatibility).then((result) => {
                    if (result.success) {
                        console.log('Compatibility status updated successfully.');
                    } else {
                        console.error('Failed to update compatibility status:', error);
                    }
                });
            }
            setTimeout(() => { // waits a little before closing the button and allows the display of a failed message
                this.isInstalling = false; // Reset the install state on success
            }, 3000);
        },
        cleanUpListener() {
            window.api.removeModListener()
                .then(() => {
                    console.log('Listener removed successfully.');
                })
                .catch((error) => {
                    console.error('Error removing listener:', error);
                });
        },
    },
    async mounted() {
        this.loadAllSettings()

        this.cleanUpListener(); // Clean up any previous listeners to avoid issues on reload 

        if (window.api?.onModProgress) {
            window.api.onModProgress(({ step }) => {
                this.progress = step;
            });
        }

        window.api.onModResult(async (result) => {
            console.log(`Mod download process result received: ${JSON.stringify(result)}`);

            if (result.success) {
                console.log('Mod download was successful:', result);
                console.log('Proceeding with processing the installed mod...');
                this.isInstalled = true;
                this.modLocation = this.SteamCmdModPath + `/steamapps/workshop/content/${this.game_id}/${this.mod_id}`
                this.compatibility = 1;
                try {
                    console.log('Updating compatibility status to true...');
                    const result = await updateModCompatibility(this.game_id, 1);
                    if (result.success) {
                        console.log('Compatibility status updated successfully.');
                    } else {
                        console.error('Failed to update compatibility status:', result);
                    }
                } catch (err) {
                    console.error('Error updating compatibility:', err);
                }
                console.log('Mod compatibility done');
                console.log('Starting to process the installed mod...');
                try {
                    console.log('Processing installed mod...');
                    await this.processInstalledMod(); // Call the function to process the installed mod
                    setTimeout(() => { // waits a little before closing the button and allows the display of a success message
                        this.isInstalling = false; // Reset the install state on success
                    }, 3000);
                } catch (error) {
                    console.error('Error processing installed mod:', error);
                    this.errorHandler(error);
                }
            } else {
                this.errorHandler(result.message); 
                this.isInstalled = true;
            }
        });

        this.queryDatabaseForProfiles(); // Fetch the profiles when the component is mounted
        await this.getGameTitle(); // Fetch the game title when the component is mounted

        changeBackground("download")
    },
}
</script>

<style scoped>
.circle-image {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
}


.tags-container {
    display: flex;
    align-items: center;
}

.tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-left: 10px;
}

.tag {
    flex: 0 1 auto;
}

.card.tags {
    padding: 10px;
    background-color: var(--secondary-color);
    border-radius: 5px;
    box-shadow: 0 8px 13px rgba(0, 0, 0, 0.1);
    margin: 0px;
}

.subtitle {
    margin: 0;
    display: flex;
    align-items: center;
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

.desc-content {
    width: 100%;
    height: auto;
    max-height: 33vh;
    overflow-y: auto;
    overflow-x: hidden;
    white-space: normal;
    word-wrap: break-word;
    padding: 10px;
    background-color: #353246;
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

.modIcon {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.modIconCard {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    margin: 0px;
    margin-bottom: 10px;
    background-color: var(--accent-color);
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

}

.rotate {
    transform: rotate(2.05deg);
}

.icon-text-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 20px;
}

.icon-text {
    display: flex;
    align-items: center;
    gap: 8px;
}

.icon-text i {
    font-size: 24px;
    color: white;
}

.icon-text p {
    margin: 0;
    color: white;
    font-weight: bolder;
}

.rotate i {
    color: white;
}

.user-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 2px;
}

.arrow-down {
    transform: rotate(180deg);
    transform-origin: center;
    transition: transform 0.3s ease;
}

.arrow-up {
    transform: rotate(0deg);
    transform-origin: center;
    transition: transform 0.3s ease;
}
</style>
