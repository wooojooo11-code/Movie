<script setup lang="ts">
import MovieDetailModal from '@/components/common/MovieDetailModal.vue';
import type { NegativeRatingInput, PositiveRatingInput } from '@/types/rating';
import type { RecommendedCatalogMovie, StoredRatingRecord } from '@/types/recommendation';

defineProps<{
  isSavingRating?: boolean;
  movie: RecommendedCatalogMovie;
  ratingRecord?: null | StoredRatingRecord;
  startWithTrailer?: boolean;
}>();

defineEmits<{
  close: [];
  'rate-dislike-submit': [feedback: NegativeRatingInput];
  'rate-like-submit': [feedback: PositiveRatingInput];
}>();
</script>

<template>
  <MovieDetailModal
    :movie="movie"
    :rating-record="ratingRecord"
    :is-saving-rating="isSavingRating"
    :start-with-trailer="startWithTrailer"
    @close="$emit('close')"
    @rate-dislike-submit="$emit('rate-dislike-submit', $event)"
    @rate-like-submit="$emit('rate-like-submit', $event)"
  />
</template>
