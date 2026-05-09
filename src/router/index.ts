import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
import ListsView from '@/views/ListsView.vue';
import LoginView from '@/views/LoginView.vue';
import RecommendationsView from '@/views/RecommendationsView.vue';
import RatingView from '@/views/RatingView.vue';
import { useRecommendationStore } from '@/services/recommendationStore';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/rating',
      name: 'rating',
      component: RatingView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: RecommendationsView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/lists',
      name: 'lists',
      component: ListsView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        guestOnly: true
      }
    }
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 128,
        behavior: 'smooth'
      };
    }

    return { top: 0 };
  }
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const recommendationStore = useRecommendationStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);

  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  if (guestOnly && authStore.isAuthenticated) {
    return authStore.getPostLoginPath('/');
  }

  if (requiresAuth && authStore.isConfigured && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    };
  }

  if (to.name === 'recommendations' && recommendationStore.state.profile.totalRatings === 0) {
    return { name: 'rating' };
  }

  return true;
});

export default router;
