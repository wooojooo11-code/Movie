import { catalogLists } from '@/data/catalog';
import type { SharedMovieListRecord } from '@/types/lists';

const sharedOwners = [
  { ownerId: 'user_anna', ownerName: '안나' },
  { ownerId: 'user_joon', ownerName: '준호' },
  { ownerId: 'user_haru', ownerName: '하루' },
  { ownerId: 'user_sori', ownerName: '소리' },
  { ownerId: 'user_mina', ownerName: '미나' },
  { ownerId: 'user_dan', ownerName: '단비' }
];

const ratingCounts = [312, 684, 458, 401, 537, 622];
const now = Date.now();
const buildTimestamp = (daysAgo: number) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const mockSharedLists: SharedMovieListRecord[] = catalogLists.map((list, index) => ({
  ...list,
  ...sharedOwners[index % sharedOwners.length],
  createdAt: buildTimestamp(24 + index * 5),
  isPrivate: false,
  ratingCount: ratingCounts[index % ratingCounts.length],
  updatedAt: buildTimestamp(index * 3),
  canBeReshared: false
}));
