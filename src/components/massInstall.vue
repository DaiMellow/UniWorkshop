<template>
    <div class="mod-info-header">
        <div class="fakeButtons-container" style="padding-bottom: 20px;">
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
            <div class="fakeButton"></div>
        </div>
    </div>
    <div class="tags-container">
        <h1 class="title">Mass Install</h1>
        <div class="tags-wrapper">
            <div class="tag">
                <div class="card tags">
                    <p class="has-text-white" style="font-weight: bold;">{{ no_mods }} mods</p>
                </div>
            </div>
        </div>
    </div>
    <div class="card" style="padding: 0; margin-left: 0;">
        <span>
            <p style="background-color: #2D2A3F; padding: 5px;">Add your modlist here</p>
        </span>
        <textarea class="desc-content textarea" style="resize: none;" placeholder="banana" rows="10"
            v-model="input"></textarea>
    </div>
    <div class="subtitle" style="padding-top: 20px;">
        <p>Errors: {{ errors }}</p>
    </div>
    <img src="../assets/weirdCross.svg" style="float: right;" alt="icon" />
    <div class="button-container">
        <button class="animated-button button icon-button" @click="toggleExpand('none')">
            <i class="fas fa-arrow-right-from-bracket"></i>
            <span class="button-text">Go back</span>
        </button>
        <button v-if="isValid" class="animated-button button icon-button" @click="">
            <i class="fas fa-download"></i>
            <span class="button-text">Install mods</span>
        </button>
        <button v-else class="animated-button button icon-button" disabled>
            <i class="fas fa-download"></i>
            <span class="button-text">Install mods</span>
        </button>
    </div>
</template>

<script>
import { loadSetting } from '../../utils/settings';

export default {
    name: 'massInstall',
    props: {

    },
    data() {
        return {
            OnboardingComplete: false,
            input: '',
            no_mods: 0,
            errors: [],
            isValid: false,
            isInstalling: false,
            isInstalled: false,
            hasFailed: false,
            progress: 0,
            mod_id: null,
            game_id: null,
        };
    },
    computed: {
        isValid() {
            // Step 1: Normalize input by collapsing multiple spaces/newlines/commas into a single comma
            let processInput = this.input.replace(/[\s,]+/g, ',');
            let isValid = true;
            this.errors = [];

            // Step 2: Split by commas and validate each entry
            for (let line of processInput.split(',')) {
                this.no_mods = processInput.split(',').length;
                const regex = /^https?:\/\/steamcommunity\.com\/sharedfiles\/filedetails\/(?:\?id=)?(\d{7,})($|&searchtext=.*)|^\d{7,}$/;
                const matches = line.trim().match(regex); // Trim to handle stray spaces
                if (!matches) { // Return false if an invalid entry is found
                    isValid = false;
                    this.errors.push(line);
                }
            }
            return isValid;
        }

    },
    methods: {
        toggleExpand(page) {
            this.$emit('toggleExpand', page);
        },
        async installMod() {
            this.isInstalling = true;
            this.progress = 0;
            this.isInstalled = false;

            let SteamCmdLocation = await loadSetting('SteamCmd_Path');
            window.api.anonInstallMod(this.mod_id, this.game_id, SteamCmdLocation)
        },
        openLink() {
            const url = 'https://steamcommunity.com/sharedfiles/filedetails/?id=' + this.mod_id;
            require('electron').shell.openExternal(url);
        },
    },
    mounted() {
        window.api.onModProgress(({ step }) => {
            this.progress = step;
        });

        window.api.onModResult((result) => {
            console.log(result.message);

            if (result.success) {
                this.isInstalled = true;
            } else {
                this.isInstalled = true;
                this.hasFailed = true;
            }

            setTimeout(() => {
                this.isInstalling = false;
            }, 3000);
        });
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
</style>