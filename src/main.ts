import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import './assets/styles/main.css';
import './registerServiceWorker';

const bootstrap = async () => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  const authStore = useAuthStore(pinia);
  await authStore.initialize();

  app.use(router).mount('#app');
};

void bootstrap();
