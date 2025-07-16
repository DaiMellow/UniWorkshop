<template>
    <div class="card"
        style="background-color: #2D2A3F; padding: 0; margin-left: 0; border-radius: 10px; overflow: hidden;">
        <span style="display: flex; align-items: center; padding: 5px;">
            <h1 class="title"
                style="margin: 0; padding: 5px; border-top-left-radius: 10px; border-top-right-radius: 10px; display: flex; flex-direction: column; align-items: flex-start;">
                My Game Profile
                <span style="font-size: 12px; color: #868686; margin-top: 2px;">
                    My favorite game
                </span>
            </h1>
            <button style="padding: 2px 5px;" title="Open folder">
                <i class="fas fa-folder-open" style="font-size: 20px;"></i>
            </button>
            <div class="button-container" style="margin-left: auto;">
                <button class="animated-button button icon-button" style="background-color: #95222d; min-width: 100px;"
                    @click="">
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
                    <ModSummeryComponent v-for="mod in mods" :key="mod.id" :modData="mod" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ModSummeryComponent from './ModSummeryComponent.vue';

export default {
    name: 'FakeGameProfileComponent',
    components: {
        ModSummeryComponent
    },
    props: {
    },
    data() {
        return {
            activeModsCount: 1,
            disabledModsCount: 1,
            errorModsCount: 0,
            mods: [
                {
                    "id": 1,
                    "title": "My favorite mod",
                    "path": "C:\\notavalidpath",
                    "game_profile_id": 1,
                    "steam_id": "1234",
                    "mod_id": "1234",
                    "author": "DaiMellow",
                    "description": "no",
                    "version": null,
                    "img": "https://placehold.co/600x400",
                    "status": "enabled",
                    "autoUpdate": 1,
                    "created_at": "2025-04-10 18:16:44",
                    "updated_at": "2025-04-10 18:16:44"
                },
                {
                    "id": 2,
                    "title": "My 2nd favorite mod",
                    "path": "C:\\notavalidpath",
                    "game_profile_id": 1,
                    "steam_id": "1234",
                    "mod_id": "1234",
                    "author": "DaiMellow",
                    "description": "no",
                    "version": null,
                    "img": "https://placehold.co/600x400",
                    "status": "disabled",
                    "autoUpdate": 0,
                    "created_at": "2025-04-10 18:16:44",
                    "updated_at": "2025-04-10 18:16:44"
                },
            ],
        };
    },
    computed: {
    },
    methods: {
    },
    mounted() {
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