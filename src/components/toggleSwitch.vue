<template>
    <label class="toggle-switch">
        <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" />
        <span class="track">
            <span class="thumb"></span>
        </span>
    </label>
</template>

<script>
export default {
    name: 'ToggleSwitch',
    props: {
        modelValue: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue']
};
</script>

<style scoped>
.toggle-switch {
    --switch-width: 50px;
    --switch-height: 26px;
    --thumb-size: 22px;
    --track-bg-off: #ccc;
    --track-bg-on: var(--secondary-accent-color, #48c774);
    --thumb-bg: #fff;
    display: inline-block;
    position: relative;
    width: var(--switch-width);
    height: var(--switch-height);
}

.toggle-switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-switch .track {
    width: 100%;
    height: 100%;
    background-color: var(--track-bg-off);
    border-radius: var(--switch-height);
    transition: background-color 0.3s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0 2px;
    box-sizing: border-box;
}

.toggle-switch .thumb {
    width: var(--thumb-size);
    height: var(--thumb-size);
    background-color: var(--thumb-bg);
    border-radius: 50%;
    transition: transform 0.3s cubic-bezier(.25, .8, .25, 1);
    transform: translateX(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch input:checked+.track {
    background-color: var(--track-bg-on);
}

.toggle-switch input:checked+.track .thumb {
    transform: translateX(calc(var(--switch-width) - var(--thumb-size) - 4px));
}
</style>