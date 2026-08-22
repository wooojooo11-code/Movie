import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { usePwaPrompt } from './services/pwaPrompt';
import './assets/styles/main.css';
import './registerServiceWorker';

const bootstrap = () => {
  usePwaPrompt().initialize();

  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router).mount('#app');
};

bootstrap();
