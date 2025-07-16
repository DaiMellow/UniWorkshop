<template>
    <div :class="['dropdown', { 'is-active': dropdownActive }, dropDirectionClass]" @click="toggleDropdown"
        style="z-index: 3; margin-left: auto; margin-right: 0;">
        <div class="dropdown-trigger">
            <button class="button" style="width: 250px; margin-left: auto; display: flex; align-items: center;">
                <i class="fas fa-pager" style="padding-right: 15px; font-size: 1.8em;"></i>
                <span>{{ displayText }}</span>
                <i class="fas fa-chevron-up arrow-icon" :class="{ rotated: dropdownActive }"
                    style="margin-left: auto; margin-right: 8px; font-size: 1.8em;"></i>
            </button>
        </div>

        <div class="dropdown-menu" role="menu" :style="dropdownMenuStyle">
            <div @click.stop class="dropdown-content" style="width: 90%;">
                <a v-if="allowCreateNew" class="dropdown-item" @click.stop.prevent="onCreateNew">
                    {{ newItemText }}
                </a>
                <hr v-if="elements.length" class="dropdown-divider" />

                <template v-if="elements.length <= maxVisibleItems">
                    <a v-for="element in elements" :key="element.id" class="dropdown-item"
                        @click.stop="onSelect(element)">
                        <template v-if="element.name.length > maxNameLength">
                            <ScrollingTextComponent :text="element.name" />
                        </template>
                        <template v-else>
                            <p>{{ element.name }}</p>
                        </template>
                    </a>
                </template>

                <template v-else>
                    <div class="pagination-control">
                        <button class="button" @click.stop="prevPage" :disabled="start_array === 0">
                            <i class="fas fa-arrow-up" style="font-size: 1em;"></i>
                        </button>
                    </div>

                    <a v-for="element in paginatedElements" :key="element.id" class="dropdown-item"
                        @click.stop="onSelect(element)">
                        <template v-if="element.name.length > maxNameLength">
                            <ScrollingTextComponent :text="element.name" />
                        </template>
                        <template v-else>
                            <p>{{ element.name }}</p>
                        </template>
                    </a>

                    <div class="pagination-control">
                        <button class="button" @click.stop="nextPage" :disabled="end_array >= elements.length">
                            <i class="fas fa-arrow-down" style="font-size: 1em;"></i>
                        </button>
                    </div>
                </template>

                <template v-if="allowNone">
                    <hr class="dropdown-divider" />
                    <a class="dropdown-item" @click.stop="onSelectNone">
                        {{ noneItemText }}
                    </a>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
import ScrollingTextComponent from './ScrollingTextComponent.vue';

export default {
    name: 'DropDownComponent',
    components: { ScrollingTextComponent },
    props: {
        elements: {
            type: Array,
            default: () => []
        },
        preselectedElement: {
            type: Object,
            default: () => ({})
        },
        dropDirection: {
            type: String,
            default: 'down'
        },
        shouldDropDownShowSelection: {
            type: Boolean,
            default: true
        },
        dropDownTitle: {
            type: String,
            default: 'Select an option'
        },
        newItemText: {
            type: String,
            default: 'Create New'
        },
        noneItemText: {
            type: String,
            default: 'None'
        },
        maxVisibleItems: {
            type: Number,
            default: 8
        },
        maxNameLength: {
            type: Number,
            default: 24
        },
        allowCreateNew: {
            type: Boolean,
            default: true
        },
        allowNone: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            dropdownActive: false,
            start_array: 0,
            end_array: this.maxVisibleItems,
            selected: this.preselectedElement
        };
    },
    computed: {
        displayText() {
            if (!this.shouldDropDownShowSelection || !this.selected || !this.selected.name) {
                return this.dropDownTitle;
            }
            return this.selected.name.length > 25
                ? this.selected.name.slice(0, 22) + '...'
                : this.selected.name;
        },
        dropDirectionClass() {
            return `is-${this.dropDirection}`;
        },
        dropdownMenuStyle() {
            return this.dropDirection === 'up'
                ? { top: 'auto', bottom: '100%', width: '120%' }
                : { bottom: 'auto', top: '100%', width: '120%' };
        },
        paginatedElements() {
            return this.elements.slice(this.start_array, this.end_array);
        }
    },
    watch: {
        preselectedElement(newVal) {
            this.selected = newVal;
        }
    },
    methods: {
        toggleDropdown() {
            this.dropdownActive = !this.dropdownActive;
        },
        onSelect(element) {
            this.selected = element;
            this.$emit('select', element);
            this.dropdownActive = false;
        },
        onSelectNone() {
            this.$emit('select', null);
            this.dropdownActive = false;
        },
        onCreateNew() {
            this.$emit('create-new');
            this.dropdownActive = false;
        },
        prevPage() {
            if (this.start_array > 0) {
                this.start_array--;
                this.end_array--;
            }
        },
        nextPage() {
            if (this.end_array < this.elements.length) {
                this.start_array++;
                this.end_array++;
            }
        }
    }
};
</script>

<style scoped>
.arrow-icon {
    transition: transform 0.3s ease;
    transform-origin: center;
}

.rotated {
    transform: rotate(180deg);
}
</style>
