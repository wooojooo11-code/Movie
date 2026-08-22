import { ref } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const HomeView = () => import('@/views/HomeView.vue');
const RatingView = () => import('@/views/RatingView.vue');
const RecommendationsView = () => import('@/views/RecommendationsView.vue');
const RatedMoviesView = () => import('@/views/RatedMoviesView.vue');
const EditRatingView = () => import('@/views/EditRatingView.vue');
const ListsView = () => import('@/views/ListsView.vue');
const CommunityPage = () => import('@/views/CommunityPage.vue');
const PostDetailPage = () => import('@/views/PostDetailPage.vue');
const ProfileView = () => import('@/views/ProfileView.vue');
const ProfileTitlesView = () => import('@/views/ProfileTitlesView.vue');
const MovieDetailPage = () => import('@/views/MovieDetailPage.vue');
const LoginView = () => import('@/views/LoginView.vue');

export const isRouteLoading = ref(true);

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
      path: '/history',
      name: 'history',
      component: RatedMoviesView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/history/:movieId/edit',
      name: 'history-edit',
      component: EditRatingView,
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
      path: '/community',
      name: 'community',
      component: CommunityPage
    },
    {
      path: '/community/:postId',
      name: 'community-post',
      component: PostDetailPage
    },
    {
      path: '/profile/:userId',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/profile/:userId/titles',
      name: 'profile-titles',
      component: ProfileTitlesView
    },
    {
      path: '/movies/:movieId',
      name: 'movie-detail',
      component: MovieDetailPage
    },
    {
      path: '/library',
      name: 'library',
      redirect: {
        name: 'lists',
        hash: '#library'
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
  isRouteLoading.value = true;

  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);

  if (!authStore.isInitialized) {
    await authStore.initialize();
  } else if (authStore.isConfigured) {
    await authStore.syncSession();
  }

  if (guestOnly && authStore.isAuthenticated) {
    return await authStore.getPostLoginPath('/');
  }

  if (requiresAuth && authStore.isConfigured && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    };
  }

  return true;
});

router.afterEach(() => {
  isRouteLoading.value = false;
});

router.onError(() => {
  isRouteLoading.value = false;
});

export default router;
