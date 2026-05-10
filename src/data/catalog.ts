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
  },
  {
    "id": "movie_33",
    "title": "인터스텔라",
    "genres": [
      "모험",
      "드라마",
      "SF"
    ],
    "tags": [
      "감동",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Cooper",
      "Brand",
      "Professor Brand"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/evoEi8SBSvIIEveM3V6nCJ6vKj8.jpg",
    "posterAlt": "인터스텔라 포스터"
  },
  {
    "id": "movie_34",
    "title": "인셉션",
    "genres": [
      "액션",
      "SF",
      "모험"
    ],
    "tags": [
      "여운",
      "영상미",
      "세계관",
      "액션"
    ],
    "characters": [
      "Dom Cobb",
      "Arthur",
      "Saito"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/atSxEGstxXRoSKDQFBgqQ5lpGSt.jpg",
    "posterAlt": "인셉션 포스터"
  },
  {
    "id": "movie_35",
    "title": "매트릭스",
    "genres": [
      "액션",
      "SF"
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Neo",
      "Morpheus",
      "Trinity"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fxBxoXFAYKWde6lKzXxSusn18Av.jpg",
    "posterAlt": "매트릭스 포스터"
  },
  {
    "id": "movie_36",
    "title": "Arrival",
    "genres": [
      "애니메이션",
      "드라마",
      "로맨스"
    ],
    "tags": [
      "영상미",
      "세계관",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yRkKfIrNQRqX2MIzckFNAtGWEOd.jpg",
    "posterAlt": "Arrival 포스터"
  },
  {
    "id": "movie_37",
    "title": "듄",
    "genres": [
      "SF",
      "모험"
    ],
    "tags": [
      "액션",
      "반전",
      "탄탄한 스토리"
    ],
    "characters": [
      "Paul Atreides",
      "Lady Jessica Atreides",
      "Duke Leto Atreides"
    ],
    "releaseYear": 2021,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7zV8FTYofAORGm0Umgh1mNNCym8.jpg",
    "posterAlt": "듄 포스터"
  },
  {
    "id": "movie_38",
    "title": "블레이드 러너 2049",
    "genres": [
      "SF",
      "드라마"
    ],
    "tags": [
      "긴장감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "'K'",
      "Rick Deckard",
      "Joi"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fJZmCJpLeBFKktLFEIKPEhllWlU.jpg",
    "posterAlt": "블레이드 러너 2049 포스터"
  },
  {
    "id": "movie_39",
    "title": "에브리씽 에브리웨어 올 앳 원스",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "tags": [
      "액션",
      "감동",
      "유머",
      "몰입감"
    ],
    "characters": [
      "Evelyn Wang",
      "Joy Wang / Jobu Tupaki",
      "Waymond Wang"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dd29Kt2p2voyP2sB6p3jC36A7ce.jpg",
    "posterAlt": "에브리씽 에브리웨어 올 앳 원스 포스터"
  },
  {
    "id": "movie_40",
    "title": "엑스 마키나",
    "genres": [
      "드라마",
      "SF"
    ],
    "tags": [
      "감동",
      "배우들의 연기력"
    ],
    "characters": [
      "Caleb",
      "Ava",
      "Nathan"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/a3tuxUHT64cl4gPqWbtsLyKdzJS.jpg",
    "posterAlt": "엑스 마키나 포스터"
  },
  {
    "id": "movie_41",
    "title": "프레스티지",
    "genres": [
      "드라마",
      "미스터리",
      "SF"
    ],
    "tags": [
      "반전",
      "감동적인 음악",
      "OST",
      "배우들의 연기력"
    ],
    "characters": [
      "Robert Angier",
      "Alfred Borden",
      "Cutter"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pN3H35IXZb9Aiew4BWLiloWQe7q.jpg",
    "posterAlt": "프레스티지 포스터"
  },
  {
    "id": "movie_42",
    "title": "아가씨",
    "genres": [
      "스릴러",
      "드라마",
      "로맨스"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Lady Hideko",
      "Sook-hee",
      "Count Fujiwara"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pDogzUCSBy0m4ybLKUv3OtGMRNm.jpg",
    "posterAlt": "아가씨 포스터"
  },
  {
    "id": "movie_43",
    "title": "헤어질 결심",
    "genres": [
      "스릴러",
      "미스터리",
      "로맨스"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "여운"
    ],
    "characters": [
      "Song Seo-rae",
      "Jang Hae-joon",
      "Jeong-ahn"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rXEJ28XDQsogIGqwVEgwM2oDdpl.jpg",
    "posterAlt": "헤어질 결심 포스터"
  },
  {
    "id": "movie_44",
    "title": "Burning",
    "genres": [],
    "tags": [],
    "characters": [
      "Pritha Baiga",
      "Shakuntala Mishra",
      "Pritha's Relative"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hxGv1O2W5SOJTmiBc45CL842mrx.jpg",
    "posterAlt": "Burning 포스터"
  },
  {
    "id": "movie_45",
    "title": "Night of the Living Dead: Live from Wisconsin - Hosted by Mark & Mike",
    "genres": [
      "공포",
      "TV 영화"
    ],
    "tags": [
      "공포",
      "TV 영화"
    ],
    "characters": [
      "Self",
      "Self",
      "Self"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2Hil2YzgUx0zSVhmYYED32dIKM8.jpg",
    "posterAlt": "Night of the Living Dead: Live from Wisconsin - Hosted by Mark & Mike 포스터"
  },
  {
    "id": "movie_46",
    "title": "부산행",
    "genres": [
      "공포",
      "스릴러",
      "액션"
    ],
    "tags": [
      "몰입감",
      "긴장감",
      "액션"
    ],
    "characters": [
      "Seok-woo",
      "Soo-ahn",
      "Sung-gyeong"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6XvEZVBFFjybvb1yQd1qfOC6F2S.jpg",
    "posterAlt": "부산행 포스터"
  },
  {
    "id": "movie_47",
    "title": "Goksung (The Wailing)",
    "genres": [],
    "tags": [],
    "characters": [],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nRrhrNWcPVgVR5qQdFy4fmLvyKZ.jpg",
    "posterAlt": "Goksung (The Wailing) 포스터"
  },
  {
    "id": "movie_48",
    "title": "오펜하이머",
    "genres": [
      "드라마",
      "역사"
    ],
    "tags": [
      "탄탄한 스토리",
      "세계관",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "J. Robert Oppenheimer",
      "Kitty Oppenheimer",
      "Leslie Groves"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jpD6z9fgNe7OqsHoDeAWQWoULde.jpg",
    "posterAlt": "오펜하이머 포스터"
  },
  {
    "id": "movie_49",
    "title": "소셜 네트워크",
    "genres": [
      "드라마"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "배우들의 연기력"
    ],
    "characters": [
      "Mark Zuckerberg",
      "Eduardo Saverin",
      "Cameron Winklevoss / Tyler Winklevoss"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4WAq2IZuVvWl0Wd1YIgBXdYgXna.jpg",
    "posterAlt": "소셜 네트워크 포스터"
  },
  {
    "id": "movie_50",
    "title": "작은 아씨들",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Jo March",
      "Meg March",
      "Amy March"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2kfDJEwZ7Rxo3yz5v6rJlwqtY0W.jpg",
    "posterAlt": "작은 아씨들 포스터"
  },
  {
    "id": "movie_51",
    "title": "미나리",
    "genres": [
      "드라마"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "영상미",
      "몰입감"
    ],
    "characters": [
      "Jacob",
      "Monica",
      "Soonja"
    ],
    "releaseYear": 2021,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ltS2iKKvvBi7ZXWPRZSZBGmC9Gr.jpg",
    "posterAlt": "미나리 포스터"
  },
  {
    "id": "movie_52",
    "title": "콜 미 바이 유어 네임",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Oliver",
      "Elio",
      "Mr. Perlman"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/guzNdgRjANTBDkTRYGqgzFOgSWx.jpg",
    "posterAlt": "콜 미 바이 유어 네임 포스터"
  },
  {
    "id": "movie_53",
    "title": "타오르는 여인의 초상",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "연출",
      "배우들의 연기력"
    ],
    "characters": [
      "Marianne",
      "Héloïse",
      "Sophie"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/M0mm1VGMZRa6eRzgoZmYW9zPd8.jpg",
    "posterAlt": "타오르는 여인의 초상 포스터"
  },
  {
    "id": "movie_54",
    "title": "100% Coco",
    "genres": [
      "가족",
      "코미디"
    ],
    "tags": [
      "감동",
      "캐릭터 매력",
      "유머"
    ],
    "characters": [
      "Coco",
      "Bruno",
      "Moeder Coco"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qOULNNkz56MT2t3CLzGFwazgRf0.jpg",
    "posterAlt": "100% Coco 포스터"
  },
  {
    "id": "movie_55",
    "title": "토이 스토리 3",
    "genres": [
      "애니메이션",
      "가족",
      "코미디"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "유머"
    ],
    "characters": [
      "Woody (voice)",
      "Buzz Lightyear (voice)",
      "Jessie (voice)"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hbUWahBLUon8RaIb9Tq7aWCBCtS.jpg",
    "posterAlt": "토이 스토리 3 포스터"
  },
  {
    "id": "movie_56",
    "title": "반지의 제왕: 반지 원정대",
    "genres": [
      "모험",
      "판타지",
      "액션"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Frodo",
      "Gandalf",
      "Aragorn"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/r18JdjImbWDRwkbVDIzWoLQqkCo.jpg",
    "posterAlt": "반지의 제왕: 반지 원정대 포스터"
  },
  {
    "id": "movie_57",
    "title": "반지의 제왕: 두 개의 탑",
    "genres": [
      "모험",
      "판타지",
      "액션"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "감동",
      "영상미"
    ],
    "characters": [
      "Frodo",
      "Gandalf",
      "Aragorn"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zxZdTi3fA7aDxEOivmzZAY2bmTu.jpg",
    "posterAlt": "반지의 제왕: 두 개의 탑 포스터"
  },
  {
    "id": "movie_58",
    "title": "반지의 제왕: 왕의 귀환",
    "genres": [
      "모험",
      "판타지",
      "액션"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Frodo",
      "Gandalf",
      "Aragorn"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/n8BPIRqvj1SdTRND828ANXhmSng.jpg",
    "posterAlt": "반지의 제왕: 왕의 귀환 포스터"
  },
  {
    "id": "movie_59",
    "title": "겟 아웃",
    "genres": [
      "미스터리",
      "스릴러",
      "공포"
    ],
    "tags": [
      "액션",
      "긴장감",
      "유머",
      "반전"
    ],
    "characters": [
      "Chris Washington",
      "Rose Armitage",
      "Missy Armitage"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/paPvmoLgUUQojsSdAZmf7dwkKGT.jpg",
    "posterAlt": "겟 아웃 포스터"
  },
  {
    "id": "movie_60",
    "title": "유전",
    "genres": [
      "공포",
      "미스터리",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동",
      "반전"
    ],
    "characters": [
      "Annie Graham",
      "Peter Graham",
      "Steve Graham"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/h2Fw8XXqDSyRA5Dn9ntCRJESYYY.jpg",
    "posterAlt": "유전 포스터"
  },
  {
    "id": "movie_61",
    "title": "더 메뉴",
    "genres": [
      "코미디",
      "공포"
    ],
    "tags": [
      "긴장감",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Margot",
      "Chef Slowik",
      "Tyler"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2Bi9OTGNAkNjStDnMDR93GPgwFY.jpg",
    "posterAlt": "더 메뉴 포스터"
  },
  {
    "id": "movie_62",
    "title": "놉",
    "genres": [
      "공포",
      "SF"
    ],
    "tags": [
      "공포",
      "SF"
    ],
    "characters": [
      "OJ Haywood",
      "Emerald Haywood",
      "Angel Torres"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6N5pRG81j6EBHhjIMkvwKnOj7u6.jpg",
    "posterAlt": "놉 포스터"
  },
  {
    "id": "movie_63",
    "title": "파이트 클럽",
    "genres": [
      "드라마",
      "스릴러"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Narrator",
      "Tyler Durden",
      "Marla Singer"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eKZ07Ted7VHxQjbuZrRBFOamcKJ.jpg",
    "posterAlt": "파이트 클럽 포스터"
  },
  {
    "id": "movie_64",
    "title": "쇼생크 탈출",
    "genres": [
      "드라마",
      "범죄"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동",
      "배우들의 연기력"
    ],
    "characters": [
      "Andy Dufresne",
      "Ellis Boyd 'Red' Redding",
      "Warden Norton"
    ],
    "releaseYear": 1994,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qV9BQZdiM8foEzDz0Ag5hGWE5qM.jpg",
    "posterAlt": "쇼생크 탈출 포스터"
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
