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

export const mockSharedLists: SharedMovieListRecord[] = catalogLists.map((list, index) => ({
  ...list,
  ...sharedOwners[index % sharedOwners.length],
  isPrivate: false,
  ratingCount: ratingCounts[index % ratingCounts.length],
  canBeReshared: false
}));
