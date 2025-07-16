<template>
    <div class="notification">
        <p>{{ message }}</p>
        <button @click="closeNotification">Close</button>
    </div>
</template>

<script>
export default {
    name: 'NotificationComponent',
    props: {
        message: {
            type: String,
            required: true
        }
    },
    methods: {
        closeNotification() {
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.notification {
    background: var(--primary-color);
    box-shadow: 0 2px 10px 0 var(--secondary-accent-color);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 30px;
}

button {
    background: none;
    border: none;
    color: #721c24;
    cursor: pointer;
    font-weight: bold;
}

button:hover {
    text-decoration: underline;
}
</style>