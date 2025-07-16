<template>
    <div class="card"
        style="background-color: #2D2A3F; padding: 0; margin-left: 0; border-radius: 10px; margin-right: 0px; margin-top: 0px; margin-bottom: 20px; overflow: hidden;">
        <span style="display: flex; align-items: center; padding: 5px;">
            <h1 class="title"
                style="margin: 0; padding: 5px; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; flex-direction: column; align-items: flex-start;">
                {{ name }}
                <span style="font-size: 12px; color: #868686; margin-top: 2px;"
                    :title="gameName.game_name ? `Steam ID: ${steam_id}` : ''">
                    {{ gameName.game_name || steam_id }}
                </span>
            </h1>
            <button style="padding: 2px 5px;" @click="openProfileFolder" title="Open folder">
                <i class="fas fa-folder-open" style="font-size: 20px;"></i>
            </button>
            <div class="button-container" style="margin-left: auto;">
                <button class="animated-button button icon-button" style="background-color: #95222d; min-width: 100px;"
                    @click="deleteProfile">
                    <i class="fas fa-trash"></i>
                    <p style="padding-left: 10px;">Delete</p>
                    <span style="padding-left: -15px;" class="button-text">profile and mods</span>
                </button>
            </div>
        </span>
        <div class="tags-wrapper" style="padding: 5px; margin: 0;">
            <span class="tag"
                style="background-color: #338f36; color: white; padding: 5px 10px; margin-left: 5px; border-radius: 5px; margin-right: 5px;">
                {{ activeModsCount }}
                actives</span>
            <span class="tag"
                style="background-color: #8686865a; color: white; padding: 5px 10px; border-radius: 5px; margin-right: 5px;">
                {{ disabledModsCount }}
                disabled</span>
            <span class="tag"
                style="background-color: #95222d; color: white; padding: 5px 10px; border-radius: 5px; margin-right: 5px;">
                {{ errorModsCount }}
                Errors</span>
        </div>
        <div class="mod-summery" style="background-color: #2D2A3F;">
            <div class="installed-mods">
                <div class="mod-list">
                    <ModSummeryComponent v-if="mods.length != 0" @mod-deleted="fetchModsFromProfile" v-for="mod in mods"
                        :key="mod.id" :modData="mod" :disabledPath="disabledPath" @mod-toggled="fetchModsFromProfile"
                        :enabledPath="enabledPath" />
                    <div v-else style="position: relative;">
                        <p class="has-text-white subtitle"
                            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1;">
                            Add a mod and you will be able to manage it here!
                        </p>
                        <FakeModSummeryComponent style="filter: blur(2px); opacity: 0.6; pointer-events: none;" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ModSummeryComponent from './ModSummeryComponent.vue';
import { getModsFromProfile, getGameNameBySteamId } from '../../utils/databaseQuery';
import FakeModSummeryComponent from './FakeModSummeryComponent.vue';

export default {
    name: 'GameProfileComponent',
    components: {
        ModSummeryComponent,
        FakeModSummeryComponent
    },
    props: {
        name: {
            type: String,
            default: 'Game Profile'
        },
        path: {
            type: String,
            default: ''
        },
        steam_id: {
            type: String,
            default: ''
        },
        id: {
            type: String,
            default: ''
        },
        disabledPath: {
            type: String,
            default: ''
        },
        enabledPath: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            mods: [],
            activeModsCount: 0,
            disabledModsCount: 0,
            errorModsCount: 0,
            gameName: { game_name: '' },
            gameProfiles: [],
        };
    },
    computed: {
    },
    methods: {
        openProfileFolder() {
            console.log(this.path)
            window.api.openFolder(this.path)
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
        async fetchModsFromProfile() {
            try {
                this.activeModsCount = 0;
                this.disabledModsCount = 0;
                this.errorModsCount = 0;
                console.log('Fetching mods for profile... with id:', this.id)
                this.mods = await getModsFromProfile(this.id);
                for (let i = 0; i < this.mods.length; i++) {
                    if (this.mods[i].status === 'enabled') {
                        this.activeModsCount++;
                    } else if (this.mods[i].status === 'disabled') {
                        this.disabledModsCount++;
                    } else {
                        this.errorModsCount++;
                    }
                }
            } catch (error) {
                console.error('Failed to fetch mods for profile:', error);
            }
        },
        deleteProfile() { // Since we're dealing with file operations, we directly ask the main process to delete the profile
            console.log('Deleting profile... with id:', this.id);
            window.api.deleteProfileByUniqueId(this.id)
                .then((response) => {
                    if (response.success) {
                        console.log('Profile deleted successfully.');
                        this.$emit('profile-deleted');
                    } else {
                        console.error('Failed to delete profile:', response.error);
                    }
                });
        }
    },
    mounted() {
        this.fetchModsFromProfile()
            .then(() => {
                console.log('Game profiles loaded successfully:', this.gameProfiles);
            })
            .catch((error) => {
                console.error('Error loading game profiles:', error);
            });
        console.log('Game Profiles:', this.gameProfiles);

        console.log('Fetching game name for steam_id:', this.steam_id);
        getGameNameBySteamId(this.steam_id)
            .then((gameName) => {
                this.gameName = gameName;
                console.log('Game name fetched successfully:', this.gameName);
            })
            .catch((error) => {
                console.error('Error fetching game name:', error);
            });
    }
}
</script>

<style>
.mod-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px;
    background-color: #1e1e2f;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
</style>