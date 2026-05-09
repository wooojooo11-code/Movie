import type { CatalogMovie, CatalogMovieList } from '@/types/recommendation';

export const catalogMovies: CatalogMovie[] = [
  {
    "id": "movie_1",
    "title": "매드맥스: 분노의 도로",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Max Rockatansky",
      "Imperator Furiosa",
      "Nux"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cadVm6gKYYukmPysHGCwrawUHHa.jpg",
    "posterAlt": "매드맥스: 분노의 도로 포스터"
  },
  {
    "id": "movie_2",
    "title": "나이브스 아웃",
    "genres": [
      "코미디",
      "범죄",
      "미스터리"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "감동"
    ],
    "characters": [
      "Benoit Blanc",
      "Ransom Drysdale",
      "Marta Cabrera"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7brBiaaH1sToGV1YBi5EIUnyjo0.jpg",
    "posterAlt": "나이브스 아웃 포스터"
  },
  {
    "id": "movie_3",
    "title": "라라랜드",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "tags": [
      "감동적인 음악",
      "배우들의 연기력",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Sebastian",
      "Mia",
      "Keith"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ad9ndytwOckyShSc0A6tx1rZRkW.jpg",
    "posterAlt": "라라랜드 포스터"
  },
  {
    "id": "movie_4",
    "title": "그랜드 부다페스트 호텔",
    "genres": [
      "코미디",
      "드라마"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "M. Gustave",
      "Mr. Moustafa",
      "Serge X."
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vsibrPwiJlZHhlrX5f4xFptX3q4.jpg",
    "posterAlt": "그랜드 부다페스트 호텔 포스터"
  },
  {
    "id": "movie_5",
    "title": "다크 나이트",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Bruce Wayne",
      "Joker",
      "Harvey Dent"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9ICUbdveP56jRoMMVkXSOr3ceyV.jpg",
    "posterAlt": "다크 나이트 포스터"
  },
  {
    "id": "movie_6",
    "title": "기생충",
    "genres": [
      "코미디",
      "스릴러",
      "드라마"
    ],
    "tags": [
      "긴장감",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Kim Ki-taek",
      "Park Dong-ik",
      "Yeon-kyo"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jjHccoFjbqlfr4VGLVLT7yek0Xn.jpg",
    "posterAlt": "기생충 포스터"
  },
  {
    "id": "movie_7",
    "title": "千と千尋の神隠し 公開直前スペシャル！",
    "genres": [
      "TV 영화",
      "다큐멘터리"
    ],
    "tags": [
      "TV 영화",
      "다큐멘터리"
    ],
    "characters": [
      "Himself",
      "스즈키 토시오",
      "히사이시 조"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uvjE8iVZZ2EbQrP4gIQNHivaTjn.jpg",
    "posterAlt": "千と千尋の神隠し 公開直前スペシャル！ 포스터"
  },
  {
    "id": "movie_8",
    "title": "나를 찾아줘",
    "genres": [
      "미스터리",
      "스릴러",
      "드라마"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "반전",
      "몰입감"
    ],
    "characters": [
      "Nick Dunne",
      "Amy Dunne",
      "Desi Collings"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/m2Lw04GIjiTjylqPiccoo3WFMVb.jpg",
    "posterAlt": "나를 찾아줘 포스터"
  },
  {
    "id": "movie_9",
    "title": "위플래쉬",
    "genres": [
      "드라마",
      "음악",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "배우들의 연기력"
    ],
    "characters": [
      "Andrew",
      "Fletcher",
      "Jim"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oKNkhmyIBiDENivK6ELZxfBWa3q.jpg",
    "posterAlt": "위플래쉬 포스터"
  },
  {
    "id": "movie_10",
    "title": "존 윅",
    "genres": [
      "액션",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감"
    ],
    "characters": [
      "John Wick",
      "Viggo Tarasov",
      "Iosef Tarasov"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mjKe6CmoxRcdiwbDeghyQKY09J.jpg",
    "posterAlt": "존 윅 포스터"
  },
  {
    "id": "movie_11",
    "title": "인사이드 아웃",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "tags": [
      "여운",
      "감동",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Joy (voice)",
      "Sadness (voice)",
      "Bing Bong (voice)"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rMXHvHzpuYZXrJUhRVJ3TvDSwe5.jpg",
    "posterAlt": "인사이드 아웃 포스터"
  },
  {
    "id": "movie_12",
    "title": "Soul Forest",
    "genres": [
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Azeel",
      "Adrian",
      "Liv"
    ],
    "releaseYear": 2020,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2sSsARjGbizjKU1U11ZWrZb2ylg.jpg",
    "posterAlt": "Soul Forest 포스터"
  },
  {
    "id": "movie_13",
    "title": "Kill Her, Not Me",
    "genres": [
      "공포"
    ],
    "tags": [
      "공포"
    ],
    "characters": [
      "Vivian",
      "Angela",
      "Margo"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oqrf2LfLhCQ6cz7aW9Ff3uPvfJS.jpg",
    "posterAlt": "Kill Her, Not Me 포스터"
  },
  {
    "id": "movie_14",
    "title": "포드 V 페라리",
    "genres": [
      "드라마",
      "액션",
      "역사"
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "액션"
    ],
    "characters": [
      "Carroll Shelby",
      "Ken Miles",
      "Lee Iacocca"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/wBUoWL4z0nsvC9cYT3VCc74X3jE.jpg",
    "posterAlt": "포드 V 페라리 포스터"
  },
  {
    "id": "movie_15",
    "title": "화양연화",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "tags": [
      "액션",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Su Li-zhen",
      "Chow Mo-wan",
      "Ah Ping"
    ],
    "releaseYear": 2000,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mjkr1IamzDiL5mLIbnuhiYOXLqg.jpg",
    "posterAlt": "화양연화 포스터"
  },
  {
    "id": "movie_16",
    "title": "미스 리틀 선샤인",
    "genres": [
      "코미디",
      "드라마"
    ],
    "tags": [
      "감동",
      "연출",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Richard Hoover",
      "Sheryl Hoover",
      "Frank Ginsberg"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fhLgquC3i27p1optlwqMTQSj2C.jpg",
    "posterAlt": "미스 리틀 선샤인 포스터"
  },
  {
    "id": "movie_17",
    "title": "미션 임파서블: 폴아웃",
    "genres": [
      "액션",
      "모험"
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Ethan Hunt",
      "August Walker",
      "Luther Stickell"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tKAlw88sEjU5bntbAfdfWcmRx6S.jpg",
    "posterAlt": "미션 임파서블: 폴아웃 포스터"
  },
  {
    "id": "movie_18",
    "title": "살인의 추억",
    "genres": [
      "범죄",
      "드라마",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "배우들의 연기력"
    ],
    "characters": [
      "Detective Park Doo-man",
      "Detective Seo Tae-yoon",
      "Detective Cho Yong-koo"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3I1Ng4sxDUyPOdVu3lQ20N14PGE.jpg",
    "posterAlt": "살인의 추억 포스터"
  },
  {
    "id": "movie_19",
    "title": "A Look Inside Eternal Sunshine of the Spotless Mind",
    "genres": [
      "다큐멘터리"
    ],
    "tags": [
      "다큐멘터리"
    ],
    "characters": [
      "미셸 공드리",
      "짐 캐리",
      "케이트 윈슬렛"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qCts6KGlSjHbDPt1f3wifSPpPCt.jpg",
    "posterAlt": "A Look Inside Eternal Sunshine of the Spotless Mind 포스터"
  },
  {
    "id": "movie_20",
    "title": "트루먼 쇼",
    "genres": [
      "코미디",
      "드라마"
    ],
    "tags": [
      "긴장감",
      "배우들의 연기력",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Truman Burbank",
      "Meryl Burbank / Hannah Gill",
      "Marlon / Louis Coltrane"
    ],
    "releaseYear": 1998,
    "posterUrl": "https://image.tmdb.org/t/p/w780/AsUv4pFf1UQuOLKf7nYUXgmgCNf.jpg",
    "posterAlt": "트루먼 쇼 포스터"
  },
  {
    "id": "movie_21",
    "title": "프리즈너스",
    "genres": [
      "드라마",
      "스릴러",
      "범죄"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "감동적인 음악"
    ],
    "characters": [
      "Keller Dover",
      "Detective Loki",
      "Nancy Birch"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9IDBwAfNzv4Xa03uhT8ggoxg5py.jpg",
    "posterAlt": "프리즈너스 포스터"
  },
  {
    "id": "movie_22",
    "title": "Nagligad nga Kinabuhi",
    "genres": [
      "드라마",
      "판타지"
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "세계관",
      "영상미"
    ],
    "characters": [
      "Interviewer",
      "Luke",
      "Lily"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/A1yVJzQbnbVUGllWbBZIOw2w7KO.jpg",
    "posterAlt": "Nagligad nga Kinabuhi 포스터"
  },
  {
    "id": "movie_23",
    "title": "탑건: 매버릭",
    "genres": [
      "액션",
      "드라마"
    ],
    "tags": [
      "액션",
      "몰입감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Capt. Pete 'Maverick' Mitchell",
      "Lt. Bradley 'Rooster' Bradshaw",
      "Penny Benjamin"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jeqXUwNilvNqNXqAHsdwm5pEfae.jpg",
    "posterAlt": "탑건: 매버릭 포스터"
  },
  {
    "id": "movie_24",
    "title": "패딩턴 2",
    "genres": [
      "모험",
      "코미디",
      "가족"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "배우들의 연기력",
      "영상미"
    ],
    "characters": [
      "Paddington Brown (voice)",
      "Mary Brown",
      "Henry Brown"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pNhRayaQXxCDAb4h4Yx1m0qxSsF.jpg",
    "posterAlt": "패딩턴 2 포스터"
  },
  {
    "id": "movie_25",
    "title": "Caged Heat 3000",
    "genres": [
      "SF"
    ],
    "tags": [
      "SF"
    ],
    "characters": [
      "Kira",
      "Daly",
      "Reitman"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/un9pLM0KuqZBxmWKVvRjR6wmhgn.jpg",
    "posterAlt": "Caged Heat 3000 포스터"
  },
  {
    "id": "movie_26",
    "title": "올드보이",
    "genres": [
      "드라마",
      "스릴러",
      "미스터리"
    ],
    "tags": [
      "액션",
      "긴장감",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Oh Dae-Su",
      "Lee Woo-jin",
      "Mi-do"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xpa9ybm6tYGna5LseqSXvKpSSJn.jpg",
    "posterAlt": "올드보이 포스터"
  },
  {
    "id": "movie_27",
    "title": "비포 선라이즈",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Jesse",
      "Céline",
      "Wife on Train"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/o7mLGNdzY1z6w2bQv0NJNOoVKks.jpg",
    "posterAlt": "비포 선라이즈 포스터"
  },
  {
    "id": "movie_28",
    "title": "나이스 가이즈",
    "genres": [
      "코미디",
      "범죄",
      "액션"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Jackson Healy",
      "Holland March",
      "Holly March"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sIi6DlIP60RAUUxwEDp9TdJCiVI.jpg",
    "posterAlt": "나이스 가이즈 포스터"
  },
  {
    "id": "movie_29",
    "title": "조디악",
    "genres": [
      "범죄",
      "미스터리",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "반전",
      "몰입감"
    ],
    "characters": [
      "Robert Graysmith",
      "David Toschi",
      "William Armstrong"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rREsWQodwtdGFjo9BYAP1smMrIG.jpg",
    "posterAlt": "조디악 포스터"
  },
  {
    "id": "movie_30",
    "title": "What's Your Name?",
    "genres": [],
    "tags": [],
    "characters": [],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9ts87cPRdxWvXfzsbgOoqj60y0o.jpg",
    "posterAlt": "What's Your Name? 포스터"
  },
  {
    "id": "movie_31",
    "title": "스파이더맨: 뉴 유니버스",
    "genres": [
      "애니메이션",
      "액션",
      "모험"
    ],
    "tags": [
      "영상미",
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Miles Morales (voice)",
      "Peter B. Parker (voice)",
      "Gwen Stacy (voice)"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/d9V6Q9vpVpmaca7vwSUbCajtDb3.jpg",
    "posterAlt": "스파이더맨: 뉴 유니버스 포스터"
  },
  {
    "id": "movie_32",
    "title": "어바웃 타임",
    "genres": [
      "드라마",
      "로맨스",
      "판타지"
    ],
    "tags": [
      "감동",
      "배우들의 연기력",
      "여운",
      "세계관"
    ],
    "characters": [
      "Tim Lake",
      "Mary",
      "Dad"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cLfuuK1Y5FjX1xXDrrEa9ppnKuy.jpg",
    "posterAlt": "어바웃 타임 포스터"
  }
];

export const catalogLists: CatalogMovieList[] = [
  {
    "id": "list_1",
    "title": "반전 있는 영화 모음",
    "movieIds": [
      "movie_2",
      "movie_8",
      "movie_26"
    ],
    "saveCount": 1032,
    "averageRating": 4.3
  },
  {
    "id": "list_2",
    "title": "비 오는 날 보기 좋은 영화",
    "movieIds": [
      "movie_15",
      "movie_19",
      "movie_32"
    ],
    "saveCount": 2184,
    "averageRating": 4.5
  },
  {
    "id": "list_3",
    "title": "영상미가 좋은 영화",
    "movieIds": [
      "movie_7",
      "movie_15",
      "movie_30"
    ],
    "saveCount": 1492,
    "averageRating": 4.4
  },
  {
    "id": "list_4",
    "title": "긴장감 있는 심야 영화",
    "movieIds": [
      "movie_1",
      "movie_6",
      "movie_21"
    ],
    "saveCount": 1260,
    "averageRating": 4.2
  },
  {
    "id": "list_5",
    "title": "설레는 로맨스 추천",
    "movieIds": [
      "movie_3",
      "movie_27",
      "movie_32"
    ],
    "saveCount": 1644,
    "averageRating": 4.4
  },
  {
    "id": "list_6",
    "title": "가볍게 웃고 싶은 날",
    "movieIds": [
      "movie_4",
      "movie_16",
      "movie_28"
    ],
    "saveCount": 1893,
    "averageRating": 4.1
  }
];
