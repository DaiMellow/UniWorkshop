<template>
    <div class="mod-item" :class="{ disabled: modData.status !== 'enabled' }">
        <div class="mod-details">
            <img class="preview-image" :src="modData.img" alt="Mod Image 1"
                :class="{ disabled: modData.status !== 'enabled' }">
            <div>
                <h2 class="mod-title" :class="{ disabled: modData.status !== 'enabled' }">{{ modData.title }} {{
                    modData.version ? "(v" + modData.version + ")" : "" }} <span v-if="modData.status != 'enabled'"
                        style="font-size: x-small; color: gray; text-decoration: none;"> (disabled)</span>
                </h2>
                <p class="mod-author">By: {{ modData.author }}</p>
            </div>
        </div>
        <div class="mod-actions">
            <div class="button-row">
                <button @click="deleteMod" class="button" style="background-color: #95222d;">
                    <i class="fas mini-icon fa-trash-alt"></i> Delete
                </button>
                <button class="button" v-if="modData.status == 'enabled' && !processing" @click="toggleMod"
                    style="background-color: #353535;">
                    <i class="fas mini-icon fa-ban"></i> Disable
                </button>
                <button class="button" v-if="processing" @click="toggleMod" style="background-color: #4a4a6a;">
                    <i class="fas mini-icon fa-hourglass-half"></i> Processing...
                </button>
                <button class="button" v-if="modData.status != 'enabled' && !processing" @click="toggleMod"
                    style="background-color: #077903cb;">
                    <i class="fas mini-icon fa-check"></i> Re-Enable
                </button>
                <button @click="openModFolder" class="button">
                    <i class="fas mini-icon fa-folder-open"></i> Open Folder
                </button>
            </div>
            <div class="auto-update-row">
                <label v-if="1 == 3" class="auto-update">
                    <input type="checkbox" v-model="autoUpdateToggle" />
                    Auto Update
                </label>
            </div>
        </div>
    </div>
</template>

<script>
import { updateAutoUpdateModByUniqueId, deleteModFromProfile, updateModPath, updateModStatus } from '../../utils/databaseQuery';

export default {
    name: 'ModSummeryComponent',
    components: {
    },
    props: {
        modData: {
            type: Object,
            required: true
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
            autoUpdateToggle: false,
            processing: false,
        };
    },
    computed: {
    },
    methods: {
        openModFolder() {
            console.log(this.modData.path);
            window.api.openFolder(this.modData.path)
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
        updateAutoUpdate(value) {
            console.log('Auto-update setting changed:', value);
            window.api.updateAutoUpdateModByUniqueId(this.modData.id, value)
                .then(() => {
                    console.log('Auto-update setting updated successfully.');
                })
                .catch((error) => {
                    console.error('Failed to update auto-update setting:', error);
                });
        },
        deleteMod() {
            console.log('Deleting mod:', this.modData.id);
            deleteModFromProfile(this.modData.id)
                .then(() => {
                    console.log('Mod deleted successfully.');
                    this.$emit('mod-deleted');
                })
                .catch((error) => {
                    console.error('Failed to delete mod:', error);
                });
        },
        async toggleMod() {
            console.log('Moving mod and toggling status...');
            this.processing = true; // Set processing to true when starting the operation (locks buttons)
            let sourcePath = "";
            let destinationPath = "";

            if (this.modData.status === 'enabled') {
                console.log('Mod is currently enabled. Moving to disabled folder...');
                sourcePath = this.modData.path;
                destinationPath = `${this.disabledPath}`;
            } else {
                console.log('Mod is currently disabled. Moving to enabled folder...');
                sourcePath = `${this.disabledPath}/${this.modData.mod_id}`;
                destinationPath = `${this.enabledPath}`;
            }

            if (!sourcePath || !destinationPath) {
                console.error('Source or destination path is not set.');
                return false;
            }

            try {
                const response = await window.api.moveFolder(sourcePath, destinationPath);

                if (!response.success) {
                    console.error("Failed to move mod:", response.error);
                    throw new Error(response.error);
                }

                console.log("Mod moved successfully.");

                // Update the DB path
                await window.api.updateModPathByUniqueId(this.modData.id, this.modData.path);
                console.log("Mod path updated successfully.");

                // Toggle enabled/disabled
                const newStatus = this.modData.status === "enabled" ? "disabled" : "enabled";
                await window.api.updateStatusModByUniqueId(this.modData.id, newStatus);
                console.log("Mod status updated successfully.");

                this.processing = false;                       // Reset processing state
                this.$emit("mod-toggled", newStatus);          // Notify parent of the change
            } catch (error) {
                console.error("Error during toggleModStatus:", error);
            }
        }
    },
    mounted() {
        console.log('ModSummeryComponent mounted with data:', this.modData);
        this.autoUpdateToggle = this.modData.autoUpdate ? true : false;
    },
    watch: {
        autoUpdateToggle(newVal) {
            this.updateAutoUpdate(newVal);
        }
    }
}
</script>

<style>
.mini-icon {
    padding-right: 10px;
}

.mod-author {
    margin: 0;
    font-size: 14px;
    color: #b0b0b0;
    font-style: italic;
}

.mod-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    background-color: #2d2a3f;
    border-radius: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mod-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.mod-details {
    display: flex;
    align-items: center;
    gap: 15px;
}

.preview-image {
    width: 100px;
    height: 80px;
    border-radius: 20%;
    object-fit: cover;
    border: 2px solid #4a4a6a;
}

.mod-details h2 {
    margin: 0;
    font-size: 18px;
    color: #ffffff;
    font-weight: 600;
}

.mod-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-direction: column;
}

.button-row {
    display: flex;
    gap: 10px;
}

.button {
    padding: 8px 12px;
    font-size: 14px;
    color: #ffffff;
    background-color: #4a4a6a;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.button:hover {
    background-color: #5c5c8a;
}

.auto-update-row {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-top: 10px;
}

.auto-update {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: #ffffff;
}

.auto-update input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #4a4a6a;
}

.mod-item.disabled {
    filter: grayscale(100%);
    opacity: 0.6;
}

.mod-item.disabled:hover {
    filter: none;
    opacity: 1;
}

.mod-title.disabled {
    color: #b0b0b0;
    text-decoration: line-through;
    font-style: italic;
}
</style>