<template>
    <div class="mod-info-header">
        <div class="fakeButtons-container">
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
        </div>
        <div class="mod-info-content">
            <h1 class="title">Game Profiles</h1>
        </div>
    </div>
    <div
        style="padding-top: 40px; padding-left: 10px; padding-right: 10px; overflow-y: auto; max-height: calc(100vh - 200px);">
        <div v-if="gameProfiles.length != 0" class="ProfileCard" v-for="(gameProfile) in gameProfiles"
            :key="gameProfile.id">
            <GameProfileComponent @profile-deleted="fetchGameProfiles" :disabledPath="gameProfile.disabledPath"
                :enabledPath="gameProfile.path" :name="gameProfile.name" :path="gameProfile.path"
                :steam_id="gameProfile.steam_id" :id="gameProfile.id" />
        </div>
        <div v-else>
            <div style="position: relative;">
                <p class="has-text-white subtitle"
                    style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1;">
                    Create a profile by installing a mod. Then you will be able to manage it here!
                </p>
                <FakeGameProfileComponent style="filter: blur(2px); opacity: 0.6; pointer-events: none;" />
            </div>
        </div>
    </div>
    <div class="button-container" style="padding-top: 10px;">
        <button class="animated-button button icon-button" @click="toggleExpand('none')">
            <i class="fas fa-arrow-right-from-bracket"></i>
            <span class="button-text">Exit</span>
        </button>
    </div>
</template>

<script>
import { loadSetting } from '../../utils/settings';
import { getGameProfiles } from '../../utils/databaseQuery';
import GameProfileComponent from '../components/GameProfileComponent.vue';
import FakeGameProfileComponent from '../components/FakeGameProfileComponent.vue';

export default {
    name: 'Setting',
    emits: ['toggleExpand'],
    components: {
        GameProfileComponent,
        FakeGameProfileComponent
    },
    props: {
    },
    data() {
        return {
            gameProfiles: [],
            hasSaved: false,
            SteamCmdLocation: null,
            SteamCmdModPath: null,
            SaveLocation: null,
            SteamApiKey: null,
        };
    },
    computed: {
    },
    methods: {
        toggleExpand(page) {
            this.$emit('toggleExpand', page);
        },
        async loadAllSettings() {
            try {
                console.log('Loading the settings...')
                this.SteamCmdLocation = await loadSetting('SteamCmd_Path');
                this.SteamCmdModPath = await loadSetting('SteamCmd_ModPath');
                this.SaveLocation = await loadSetting('SaveLocation');
                this.SteamApiKey = await loadSetting('SteamApiKey');
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        },
        async fetchGameProfiles() {
            try {
                console.log('Fetching game profiles...')
                this.gameProfiles = await getGameProfiles();
                console.log('Game profiles fetched:', this.gameProfiles);
            } catch (error) {
                console.error('Failed to fetch game profiles:', error);
            }
        },
    },
    mounted() {
        this.loadAllSettings()

        this.fetchGameProfiles()
            .then(() => {
                console.log('Game profiles loaded successfully:', this.gameProfiles);
            })
            .catch((error) => {
                console.error('Error loading game profiles:', error);
            });
        console.log('Game Profiles:', this.gameProfiles);
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