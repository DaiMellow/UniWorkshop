import { createApp } from 'vue';
import App from './App.vue';
import logger from './plugins/logger';

const app = createApp(App);
app.use(logger);
app.mount('#app');