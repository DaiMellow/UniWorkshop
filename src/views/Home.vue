<template>
    <div class="backgroundColor" :class="{ expanded: isExpanded }">
        <img class="logo" alt="Vite logo" width="450" src="../assets/logo.png"
            style="padding-bottom: 40px; padding-top: 0px;" />
        <br>
        <div class="input-card-container">
            <div v-if="isExpanded" class="card mod-info-card"
                :style="page === 'SingleSteamInstall' ? { maxHeight: 'calc(100vh - 200px)' } : {}">
                <transition name="page-fade" mode="in-out" appear>
                    <span :key="page">
                        <SteamItemCard v-if="page == 'SingleSteamInstall' && !isLoading" :title="title" :tags="tags"
                            :key="mod_id" :favorites="favorites" :subs="subs" :views="views" :game_id="game_id"
                            :mod_id="mod_id" :rating="rating" :description="description" :preview_url="preview_url"
                            :user_id="user_id" :user_name="user_name" :user_avatarmedium="user_avatarmedium" />
                        <MassInstall @toggleExpand="toggleExpand" v-if="page == 'massInstall'" />
                        <Setting @closePage="toggleExpand('none')" v-if="page == 'Setting'" />
                        <GameProfiles @toggleExpand="toggleExpand" v-if="page == 'Profiles'" />
                    </span>
                </transition>
            </div>
            <div class="card input-card" v-if="page == 'SingleSteamInstall' || page == 'none'">
                <h1 class="subtitle" style="margin-bottom: 10px;">Insert mod id or mod url here: </h1>
                <div class="columns is-vcentered">
                    <div class="column is-10" :style="{ paddingBottom: isExpanded && isValid ? '20px' : '0px' }">
                        <!-- Adjust padding based on expansion state Todo: Find the bug that forces this. -->
                        <input class="input is-link" v-model="input" type="text"
                            placeholder="12345678 or https://steamcommunity.com/sharedfiles/filedetails/?d=12345678" />
                    </div>
                    <div class="column" :style="{ 'padding-bottom': isExpanded && isValid ? '20px' : '00px' }">
                        <!-- Adjust padding based on expansion state Todo: Find the bug that forces this. -->
                        <span class="button" v-if="!isLoading" @click="toggleExpand('SingleSteamInstall')">
                            <i :title="isExpanded ? 'Return to home' : 'Search Mod'"
                                :class="['fas', 'fa-arrow-right', { 'rotate-arrow': isExpanded }]"></i>
                        </span>
                        <span v-else class="icon">
                            <i class="fas fa-hourglass-half button"></i>
                        </span>
                        <i v-if="isExpanded && !isLoading" title="Reload" @click="triggerSearch"
                            class="fas fa-rotate-right button" style="padding-left: 10px;margin-left: 3px"></i>
                        <i v-if="isExpanded && isLoading" class="fas fa-hourglass-half"></i>
                    </div>
                </div>
                <p v-if="((!isValid && input != '') || fetchError) && shouldErrorbeShown"
                    style="color: var(--warning-color);">This id
                    or link is invalid
                </p>
                <p v-if="isSuspicious && shouldErrorbeShown">This does not appear to be a mod...
                </p>
                <span v-if="!isExpanded">
                    <div class="button-container">
                        <button v-if="1 == 3" class="animated-button button icon-button"
                            @click="toggleExpand('massInstall')" disabled>
                            <i class="fas fa-download"></i>
                            <span class="button-text">Goto mass downloads</span>
                        </button>
                        <button class="animated-button button icon-button" @click="toggleExpand('Setting')">
                            <i class="fas fa-cog"></i>
                            <span class="button-text">Open the Settings</span>
                        </button>
                        <button class="animated-button button icon-button" @click="openLink">
                            <i class="fas fa-brands fa-github"></i>
                            <span class="button-text">View on Github</span>
                        </button>
                        <button v-if="1 == 3" class="animated-button button icon-button" disabled
                            style="background-color: var(--warning-color)">
                            <i class="fas fa-cloud-arrow-down"></i>
                            <span class="button-text">Update the app</span>
                        </button>
                        <button v-if="1 == 3" @click="toggleExpand('Module')" class="button"
                            style="width: auto; margin-left: auto;">
                            <i class="fas fa-puzzle-piece" style="padding-right: 15px; font-size: 1.8em;"></i>
                            View modules</button>
                        <button @click="toggleExpand('Profiles')" class="button"
                            style="width: auto; margin-left: auto;">
                            <i class="fas fa-pager" style="padding-right: 15px; font-size: 1.8em;"></i>
                            View game profiles</button>
                    </div>
                </span>
            </div>
        </div>
        <!-- Popup for first time user -->
        <div v-if="!OnboardingComplete"> <!-- Initially hides it since most users will have already completed it -->
            <FirstTimeModal />
        </div>
    </div>
</template>

<script>
import Setting from './Setting.vue';
import SteamItemCard from './SteamItemCard.vue'
import { loadSetting, saveSetting } from '../../utils/settings';
import FirstTimeModal from '../components/FirstTimeModal.vue';
import MassInstall from '../components/massInstall.vue';
import GameProfiles from './GameProfiles.vue';
import { eventBus } from '../../utils/eventBus';
import { changeBackground } from '../../utils/colorProcessing';
import { checkForCorruptData } from '../../utils/osFunctions.js';

const regexCombined = /^https?:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/(?:\?id=)?(\d{7,})($|&searchtext=.*)|^\d{7,}$/;

export default {
    components: {
        SteamItemCard,
        Setting,
        FirstTimeModal,
        MassInstall,
        GameProfiles
    },
    name: 'HomeView',
    data() {
        return {
            isExpanded: false,
            tags: [],
            input: '',
            fetchError: false,
            isSuspicious: false,
            title: '',
            mod_id: '',
            game_id: 0,
            user_id: '',
            backup_user_id: '',
            user_name: '',
            user_avatarmedium: '',
            favorites: 0,
            subs: 0,
            views: 0,
            rating: 0,
            description: '',
            preview_url: '',
            page: 'none',
            SteamApiKey: '',
            isLoading: false,
            lastSearch: '', // Used to find out if the user changed the input (to hide error messages)
            isDownloading: false,
            isModalActive: true, // Controls modal visibility
            OnboardingComplete: true,
            SteamCmdLocation: '',
            SaveLocation: '',
            SteamCmdModPath: '',
            enabled: false,
            isSteamPathValid: false,
        };
    },
    computed: {
        isValid() {
            return regexCombined.test(this.input)
        },
        shouldErrorbeShown() {
            if (this.input == this.lastSearch) {
                console.log('input does not differ from last search')
                return false;
            } else {
                console.log('input differs from last search')
                return true;
            }
        },
        recalculateOnboarding() {
            if (this.page != 'setting') {
                this.checkOnboarding()
            }
        }
    },
    async mounted() {
        await this.checkOnboarding()
    },
    methods: {
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
        async testForCorruptData() {
            console.log('Checking for corrupt data...')
            console.log('OnboardingComplete', this.OnboardingComplete)
            if (this.OnboardingComplete == true) {
                const Errors = await checkForCorruptData()

                if (Errors.length > 0) {
                    console.log('Database has a corruption...')
                    console.log('Errors found:', Errors)
                    eventBus.emit('notify', 'Currupted database forcing onboarding: ' + Errors.join(', '));
                    await saveSetting('OnboardingComplete', false);
                    this.OnboardingComplete = false;
                } else {
                    console.log('No errors found')
                    this.OnboardingComplete = true;
                    await saveSetting('OnboardingComplete', true);
                }
            } else { // This will also trigger on first load.
                console.log('Onboarding has not been completed')
                this.OnboardingComplete = false;
            }
        },
        async checkOnboarding() {
            console.log('Checking for onboarding...')
            await this.loadAllSettings()
            console.log('has onboarding been done?', this.OnboardingComplete)
            if (this.OnboardingComplete != true) {
                console.log('Starting onboarding...');
                this.toggleExpand('none');
            } else {
                console.log('Onboarding has been completed')
                // Checking for corrupt data
                await this.testForCorruptData()
            }
        },
        async triggerSearch() {
            this.isLoading = true;
            this.fetchError = false;
            if (this.isValid) {
                this.input = this.extractId(this.input)
                this.lastSearch = this.input
                try {
                    let response = await window.api.getWorkshopItemDetails(this.SteamApiKey, this.input);
                    if (!this.fetchError) {
                        await this.processData(response);
                    }
                } catch (err) {
                    console.log('Critial error-', err)
                    this.fetchError = true;
                }
                console.log(this.page)
            } else {
                console.log('Invalid input')
                this.fetchError = true;
            }
            this.isLoading = false;
        },
        async toggleExpand(page) {
            this.isLoading = true;
            this.page = page;
            console.log(page)
            if (this.page == 'SingleSteamInstall') {
                if ((!this.isExpanded && this.isValid) || (this.isExpanded))
                    if (!this.isExpanded && this.isValid) {
                        await this.triggerSearch()
                        if (!this.fetchError) {
                            this.isExpanded = !this.isExpanded;
                        }
                    }
                    else {
                        this.page = 'none';
                        console.log('page set to none')
                        this.isExpanded = !this.isExpanded;
                        // Change the background back to default
                        changeBackground('home');
                    }
            } else if (this.page == 'Setting') {
                this.isExpanded = true;
                changeBackground('settings');
            } else if (this.page == 'massInstall') {
                this.isExpanded = true;
                changeBackground('massInstall');
            } else if (this.page == 'Profiles') {
                this.isExpanded = true;
                changeBackground('profiles');
            } else {
                this.isExpanded = false;
                this.page = 'none'; // Reset page to none when invalid state
                // Change the background back to default
                changeBackground('home');
            }
            this.isLoading = false;
        },
        openLink() {
            const url = 'https://github.com/DaiMellow/UniWorkshop';
            window.api.openLink(url);
        },
        async processData(rep) {
            try {
                console.log('Processing data...')
                console.log(rep)
                const workshopItem = rep.details.response.publishedfiledetails[0];

                this.backup_user_id = this.user_id // backups the user_id in case the api returned garbage.
                this.user_id = workshopItem.creator; // Gets the user_id to then check for a username before processing the data.

                // Finding the real username behind the id... (this will also verify if the link makes sense)
                let userRep = await window.api.getSteamUserName(this.SteamApiKey, this.user_id)
                console.log('UserRep', userRep)
                this.user_name = userRep.username;
                this.user_avatarmedium = userRep.icon;

                this.title = workshopItem.title;
                this.mod_id = workshopItem.publishedfileid;
                this.game_id = workshopItem.consumer_appid;
                this.favorites = workshopItem.favorited;
                this.subs = workshopItem.subscriptions;
                this.views = workshopItem.views;
                this.description = workshopItem.file_description;
                this.preview_url = workshopItem.preview_url;
                this.tags = workshopItem.tags;
                this.rating = workshopItem.vote_data.score;

                // Checking if it's a mod
                if (this.subs == 0 || this.favorites == 0 || this.tags == []) {
                    console.log("Suspicious link")
                    this.isSuspicious = true;
                } else {
                    this.isSuspicious = false;
                }
            } catch (err) {
                console.log('Critial error ', err)
                this.fetchError = true;
                this.user_id = this.backup_user_id // attempt to recover the old data so a mod is still displayed.
            }
        },
        extractId(input) {
            const regex = /(?:[?&]id=)?(\d+)/; // Regex to match ID in URL or standalone
            const match = input.match(regex);
            return match ? match[1] : null;
        }
    },
}
</script>

<style>
.logo {
    padding: 40px;
    transition: all 0.5s ease;
    width: 450px;
    position: relative;
    z-index: 10;
}

.animated-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 10px;
    font-size: 16px;
    transition: width 0.4s ease;
    background-color: var(--accent-color);
    cursor: pointer;
    overflow: hidden;
    white-space: nowrap;
    width: 50px;
}

.icon-button i {
    font-size: 1.5em;
    transition: margin-right 0.4s ease;
}

.icon-button .button-text {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.4s ease, visibility 0.4s ease;
    margin-left: 10px;
}

.icon-button:hover {
    width: 250px;
}

.icon-button:hover .button-text {
    opacity: 1;
    visibility: visible;
}

.icon-button:hover i {
    margin-right: 10px;
}

.icon i {
    transition: transform 1.3s ease;
}

.rotate-arrow {
    transform: rotate(-180deg);
}

@keyframes spinClockwise {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes spinCounterclockwise {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(-360deg);
    }
}

.icon-button:hover i {
    animation: spinClockwise 0.6s ease forwards;
    margin-right: 10px;
}

.icon-button i {
    animation: spinCounterclockwise 0.6s ease forwards;
}

.icon-button:hover i {
    animation: spinClockwise 0.6s ease forwards;
}

.button-container {
    display: flex;
    gap: 10px;
}

.button-container {
    align-items: center;
}


.backgroundColor.expanded .logo {
    width: 100px;
    padding: 2px;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
}


.backgroundColor.expanded .mod-info-card {
    transform: scale(1);
    opacity: 1;
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

.input-card {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    transition: all 0.5s ease;
    z-index: 1;
}

.backgroundColor.expanded .input-card {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
}

.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button {
    background-color: var(--accent-color);
}

.page-fade-enter-active {
    transition: opacity 0.4s cubic-bezier(.25, .8, .25, 1),
        transform 0.4s cubic-bezier(.25, .8, .25, 1);
}

.page-fade-enter-from {
    opacity: 0;
    transform: translateY(-5px) scale(0.98);
}

.page-fade-enter-to {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.page-fade-leave-active {
    transform-origin: top center;
    transition: opacity 0.4s ease-in,
        transform 0.4s ease-in;
}

.page-fade-leave-to {
    opacity: 0;
    transform: scaleY(0);
}

.page-fade-leave-from {
    opacity: 1;
    transform: scaleY(1);
}
</style>
