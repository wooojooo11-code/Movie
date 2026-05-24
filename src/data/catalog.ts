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
      "여운",
      "감동적인 음악",
      "배우들의 연기력",
      "유머"
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
      "감동적인 음악",
      "OST",
      "유머"
    ],
    "characters": [
      "Oh Dae-su",
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
      "몰입감"
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
  },
  {
    "id": "movie_65",
    "title": "글래디에이터",
    "genres": [
      "액션",
      "드라마",
      "모험"
    ],
    "tags": [
      "탄탄한 스토리",
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Maximus",
      "Commodus",
      "Lucilla"
    ],
    "releaseYear": 2000,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kUBBYu0lWGMHYnUDNDTL4ttj44j.jpg",
    "posterAlt": "글래디에이터 포스터"
  },
  {
    "id": "movie_66",
    "title": "007 카지노 로얄",
    "genres": [
      "모험",
      "액션",
      "스릴러"
    ],
    "tags": [
      "액션",
      "긴장감",
      "탄탄한 스토리",
      "몰입감"
    ],
    "characters": [
      "James Bond",
      "Vesper Lynd",
      "Le Chiffre"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2e9maVDTkHXjEB3Bk1oBvZ5Xs0M.jpg",
    "posterAlt": "007 카지노 로얄 포스터"
  },
  {
    "id": "movie_67",
    "title": "007 스카이폴",
    "genres": [
      "액션",
      "모험",
      "스릴러"
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "James Bond",
      "M",
      "Silva"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oHkZwUYpfrAnkKcJh3BdPYsBSPX.jpg",
    "posterAlt": "007 스카이폴 포스터"
  },
  {
    "id": "movie_68",
    "title": "본 얼티메이텀",
    "genres": [
      "액션",
      "드라마",
      "미스터리"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Jason Bourne",
      "Nicky Parsons",
      "Noah Vosen"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5C3p4UUNxcFRykRBTiQzB5xveeg.jpg",
    "posterAlt": "본 얼티메이텀 포스터"
  },
  {
    "id": "movie_69",
    "title": "The Most Courageous Raid of WWII",
    "genres": [
      "다큐멘터리",
      "전쟁"
    ],
    "tags": [
      "다큐멘터리",
      "전쟁"
    ],
    "characters": [
      "Himself - Presenter"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uqS7bNtMmx6SYZX3HARnoTk9Lzb.jpg",
    "posterAlt": "The Most Courageous Raid of WWII 포스터"
  },
  {
    "id": "movie_70",
    "title": "다이 하드",
    "genres": [
      "액션",
      "스릴러"
    ],
    "tags": [
      "액션",
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악"
    ],
    "characters": [
      "John McClane",
      "Hans Gruber",
      "Karl"
    ],
    "releaseYear": 1988,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9MPaeRkwS12glOQ818SEtnMd3XA.jpg",
    "posterAlt": "다이 하드 포스터"
  },
  {
    "id": "movie_71",
    "title": "터미네이터 2: 심판의 날",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "tags": [
      "액션",
      "긴장감",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "The Terminator",
      "Sarah Connor",
      "John Connor"
    ],
    "releaseYear": 1991,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nDVUiEqoeXaDQuM81KkUVNviYIm.jpg",
    "posterAlt": "터미네이터 2: 심판의 날 포스터"
  },
  {
    "id": "movie_72",
    "title": "에이리언 2",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Ripley",
      "Newt",
      "Corporal Hicks"
    ],
    "releaseYear": 1986,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8J1SwqmsHRzZ5k8QVRibkzyc9jc.jpg",
    "posterAlt": "에이리언 2 포스터"
  },
  {
    "id": "movie_73",
    "title": "어벤져스",
    "genres": [
      "SF",
      "액션",
      "모험"
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tony Stark / Iron Man",
      "Steve Rogers / Captain America",
      "Bruce Banner / The Hulk"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/krgjV3rJtBcEpQehODKXNCt6uFL.jpg",
    "posterAlt": "어벤져스 포스터"
  },
  {
    "id": "movie_74",
    "title": "캡틴 아메리카: 윈터 솔져",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Steve Rogers / Captain America",
      "Nick Fury",
      "Natasha Romanoff / Black Widow"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qBuAglXtjBW9JBpIJ3W40nY58Am.jpg",
    "posterAlt": "캡틴 아메리카: 윈터 솔져 포스터"
  },
  {
    "id": "movie_75",
    "title": "엣지 오브 투모로우",
    "genres": [
      "액션",
      "SF"
    ],
    "tags": [
      "탄탄한 스토리",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Cage",
      "Rita",
      "General Brigham"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uZy5RUNb052OSyhZgTBA9ZxFVzc.jpg",
    "posterAlt": "엣지 오브 투모로우 포스터"
  },
  {
    "id": "movie_76",
    "title": "로건",
    "genres": [
      "액션",
      "드라마",
      "SF"
    ],
    "tags": [
      "탄탄한 스토리",
      "액션",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Logan / X-24",
      "Laura",
      "Charles"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tE6tvHXlAZ8hqM4k9ZvtWtBk4pc.jpg",
    "posterAlt": "로건 포스터"
  },
  {
    "id": "movie_77",
    "title": "베이비 드라이버",
    "genres": [
      "액션",
      "범죄"
    ],
    "tags": [
      "감동적인 음악",
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Baby",
      "Doc",
      "Debora"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fUfZ2zECULlN0pGPgXkez5rF7Hj.jpg",
    "posterAlt": "베이비 드라이버 포스터"
  },
  {
    "id": "movie_78",
    "title": "RRR: 라이즈 로어 리볼트",
    "genres": [
      "액션",
      "모험",
      "드라마"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "감동",
      "몰입감"
    ],
    "characters": [
      "Komaram Bheem",
      "Alluri Sitarama Raju",
      "Jennifer 'Jenny' Buxton"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sxI1qKDHZRAi2LPmJUPhQ2x1u07.jpg",
    "posterAlt": "RRR: 라이즈 로어 리볼트 포스터"
  },
  {
    "id": "movie_79",
    "title": "The Making of 'Crouching Tiger, Hidden Dragon'",
    "genres": [
      "다큐멘터리"
    ],
    "tags": [
      "다큐멘터리"
    ],
    "characters": [
      "Narrator",
      "Self",
      "Self"
    ],
    "releaseYear": 2000,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ocA3dH9gUDLUtCRg4HuAFCeAS3a.jpg",
    "posterAlt": "The Making of 'Crouching Tiger, Hidden Dragon' 포스터"
  },
  {
    "id": "movie_80",
    "title": "킬 빌: 1부",
    "genres": [
      "액션",
      "범죄"
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "The Bride",
      "O-Ren Ishii",
      "Vernita Green"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lH82lk837fACeVZUmqHH0UiEeWL.jpg",
    "posterAlt": "킬 빌: 1부 포스터"
  },
  {
    "id": "movie_81",
    "title": "세븐",
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
      "Somerset",
      "Mills",
      "Tracy"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/izzk8dbmrLowcoGbFaebqJvzyXg.jpg",
    "posterAlt": "세븐 포스터"
  },
  {
    "id": "movie_82",
    "title": "셔터 아일랜드",
    "genres": [
      "드라마",
      "스릴러",
      "미스터리"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "세계관"
    ],
    "characters": [
      "Teddy Daniels",
      "Chuck Aule",
      "Dr. Cawley"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/aywZdSOXtwcqqLTl271EUJemi2.jpg",
    "posterAlt": "셔터 아일랜드 포스터"
  },
  {
    "id": "movie_83",
    "title": "메멘토",
    "genres": [
      "미스터리",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "여운"
    ],
    "characters": [
      "Leonard",
      "Natalie",
      "Teddy"
    ],
    "releaseYear": 2000,
    "posterUrl": "https://image.tmdb.org/t/p/w780/x5FPVwJHyf1SnDW04fwr9rsyWm4.jpg",
    "posterAlt": "메멘토 포스터"
  },
  {
    "id": "movie_84",
    "title": "유주얼 서스펙트",
    "genres": [
      "드라마",
      "범죄",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "반전",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "McManus",
      "Keaton",
      "Fenster"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cbgicjq4Q2OVvXlfd3PqRlLvqmf.jpg",
    "posterAlt": "유주얼 서스펙트 포스터"
  },
  {
    "id": "movie_85",
    "title": "차이나타운",
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
      "J.J. 'Jake' Gittes",
      "Evelyn Cross Mulwray",
      "Noah Cross"
    ],
    "releaseYear": 1974,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kZRSP3FmOcq0xnBulqpUQngJUXY.jpg",
    "posterAlt": "차이나타운 포스터"
  },
  {
    "id": "movie_86",
    "title": "L.A. 컨피덴셜",
    "genres": [
      "범죄",
      "미스터리",
      "스릴러"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "긴장감",
      "반전"
    ],
    "characters": [
      "Jack Vincennes",
      "Wendell 'Bud' White",
      "Edmund 'Ed' Exley"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dfDvzEtWncNcYgDaRK2s3nPjpsy.jpg",
    "posterAlt": "L.A. 컨피덴셜 포스터"
  },
  {
    "id": "movie_87",
    "title": "미스틱 리버",
    "genres": [
      "스릴러",
      "범죄",
      "드라마"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "긴장감"
    ],
    "characters": [
      "Jimmy Markum",
      "Dave Boyle",
      "Sean Devine"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/g6vJf02zkzx5yBm539DAP0gZ18n.jpg",
    "posterAlt": "미스틱 리버 포스터"
  },
  {
    "id": "movie_88",
    "title": "밀레니엄: 여자를 증오한 남자들",
    "genres": [
      "스릴러",
      "범죄",
      "미스터리"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "몰입감"
    ],
    "characters": [
      "Mikael Blomkvist",
      "Lisbeth Salander",
      "Henrik Vanger"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lziQTuF8qxLLWVSJfQ2MOLnUt0G.jpg",
    "posterAlt": "밀레니엄: 여자를 증오한 남자들 포스터"
  },
  {
    "id": "movie_89",
    "title": "양들의 침묵",
    "genres": [
      "범죄",
      "스릴러",
      "드라마"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "몰입감"
    ],
    "characters": [
      "Clarice Starling",
      "Dr. Hannibal Lecter",
      "Jack Crawford"
    ],
    "releaseYear": 1991,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hOr56UKAsB9waNDHhriOntCjHTJ.jpg",
    "posterAlt": "양들의 침묵 포스터"
  },
  {
    "id": "movie_90",
    "title": "식스 센스",
    "genres": [
      "미스터리",
      "스릴러",
      "드라마"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "여운",
      "감동적인 음악"
    ],
    "characters": [
      "Malcolm Crowe",
      "Cole Sear",
      "Lynn Sear"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zmPBZos4lzZi95UayzjATYyLWHT.jpg",
    "posterAlt": "식스 센스 포스터"
  },
  {
    "id": "movie_91",
    "title": "서치",
    "genres": [
      "드라마",
      "미스터리",
      "스릴러"
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "반전",
      "탄탄한 스토리"
    ],
    "characters": [
      "David Kim",
      "Margot",
      "Detective Vick"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3BJu5DQzK9w8PIeIXSAOCfcWKMu.jpg",
    "posterAlt": "서치 포스터"
  },
  {
    "id": "movie_92",
    "title": "추락의 해부",
    "genres": [
      "스릴러",
      "미스터리",
      "범죄"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "연출"
    ],
    "characters": [
      "Sandra Voyter",
      "Maître Vincent Renzi",
      "Daniel"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zIxTPoS6zd3txeLP5FUdo3CSfbo.jpg",
    "posterAlt": "추락의 해부 포스터"
  },
  {
    "id": "movie_93",
    "title": "Låt dom andra sköta kärleken",
    "genres": [
      "다큐멘터리"
    ],
    "tags": [
      "다큐멘터리"
    ],
    "characters": [],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sPN4zhwKQjLunc9coXFDJ5AWoLC.jpg",
    "posterAlt": "Låt dom andra sköta kärleken 포스터"
  },
  {
    "id": "movie_94",
    "title": "오리엔트 특급 살인",
    "genres": [
      "미스터리",
      "드라마",
      "범죄"
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "배우들의 연기력"
    ],
    "characters": [
      "Hercule Poirot",
      "Bouc",
      "Caroline Hubbard"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4uUaaCCuro1Vvvcg5mqakFShEvF.jpg",
    "posterAlt": "오리엔트 특급 살인 포스터"
  },
  {
    "id": "movie_95",
    "title": "The Westing Game",
    "genres": [
      "가족",
      "미스터리",
      "드라마"
    ],
    "tags": [
      "감동",
      "캐릭터 매력",
      "반전",
      "탄탄한 스토리"
    ],
    "characters": [
      "Sandy McSouthers",
      "Tabitha Ruth 'Turtle' Wexler",
      "Berthe Erica Crow"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pVcnS1tnWN74c5WPMK2WBcgDZqv.jpg",
    "posterAlt": "The Westing Game 포스터"
  },
  {
    "id": "movie_96",
    "title": "이창",
    "genres": [
      "스릴러",
      "미스터리",
      "드라마"
    ],
    "tags": [
      "긴장감",
      "반전",
      "몰입감",
      "탄탄한 스토리"
    ],
    "characters": [
      "L.B. Jefferies",
      "Lisa Fremont",
      "Thomas Doyle"
    ],
    "releaseYear": 1954,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jU5Fe7n9rsEBa0uaV5dqGjJGwmX.jpg",
    "posterAlt": "이창 포스터"
  },
  {
    "id": "movie_97",
    "title": "로마의 휴일",
    "genres": [
      "로맨스",
      "코미디",
      "드라마"
    ],
    "tags": [
      "감동",
      "여운",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Princess Ann",
      "Joe Bradley",
      "Irving Radovich"
    ],
    "releaseYear": 1953,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dYLiHwYkoxCZI6bJUik4ZHbMRkc.jpg",
    "posterAlt": "로마의 휴일 포스터"
  },
  {
    "id": "movie_98",
    "title": "노팅 힐",
    "genres": [
      "로맨스",
      "코미디"
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "감동",
      "여운"
    ],
    "characters": [
      "Anna Scott",
      "William Thacker",
      "Bella"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1AbAtQSgN4KKVODiiX2452dlDJD.jpg",
    "posterAlt": "노팅 힐 포스터"
  },
  {
    "id": "movie_99",
    "title": "오만과 편견",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "배우들의 연기력",
      "여운"
    ],
    "characters": [
      "Elizabeth Bennet",
      "Mr. Darcy",
      "Mrs. Bennet"
    ],
    "releaseYear": 2005,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rgKfvG0PgJBIPR6cNICukRnfMga.jpg",
    "posterAlt": "오만과 편견 포스터"
  },
  {
    "id": "movie_100",
    "title": "어톤먼트",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "tags": [
      "반전",
      "탄탄한 스토리",
      "세계관",
      "배우들의 연기력"
    ],
    "characters": [
      "Robbie Turner",
      "Cecilia Tallis",
      "Briony Tallis (Age 13)"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xOwDTYsUUNriE7e9LauxB7k581J.jpg",
    "posterAlt": "어톤먼트 포스터"
  },
  {
    "id": "movie_101",
    "title": "Titanic: Untold Stories",
    "genres": [
      "다큐멘터리",
      "역사"
    ],
    "tags": [
      "다큐멘터리",
      "역사"
    ],
    "characters": [
      "Self - Narrator (voice)"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hkgB5OvwjggPNekDfT9dllQonLA.jpg",
    "posterAlt": "Titanic: Untold Stories 포스터"
  },
  {
    "id": "movie_102",
    "title": "아멜리에",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "tags": [
      "여운",
      "감동적인 음악",
      "세계관",
      "OST"
    ],
    "characters": [
      "Amélie Poulain",
      "Nino Quincampoix",
      "Raphaël Poulain"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/EkQ9Lu1NFnxfPSGizktuLJuxdv.jpg",
    "posterAlt": "아멜리에 포스터"
  },
  {
    "id": "movie_103",
    "title": "노트북",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "감동",
      "여운"
    ],
    "characters": [
      "Noah Calhoun",
      "Allie Hamilton",
      "Older Allie"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eFrBmd9XKOl8ZNGAcp5R6AVl9YF.jpg",
    "posterAlt": "노트북 포스터"
  },
  {
    "id": "movie_104",
    "title": "브로크백 마운틴",
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
      "Ennis Del Mar",
      "Jack Twist",
      "Alma Beers"
    ],
    "releaseYear": 2005,
    "posterUrl": "https://image.tmdb.org/t/p/w780/o5oQC9GxEfClgnHvabpvGhkUoqe.jpg",
    "posterAlt": "브로크백 마운틴 포스터"
  },
  {
    "id": "movie_105",
    "title": "A Christmas Carol",
    "genres": [
      "음악",
      "드라마",
      "판타지"
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Charles Dickens",
      "Ebenezer Scrooge",
      "Isabelle"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yJCVeGsktW6Vbu6DYlPVZWDTwvH.jpg",
    "posterAlt": "A Christmas Carol 포스터"
  },
  {
    "id": "movie_106",
    "title": "비포 선셋",
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
      "Bookstore Manager"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2k4KFbEeknXmHbNP0qt7lp2p3Y3.jpg",
    "posterAlt": "비포 선셋 포스터"
  },
  {
    "id": "movie_107",
    "title": "비포 미드나잇",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "tags": [
      "영상미",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Jesse",
      "Céline",
      "Hank"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/byrXeNh801vDT0LZcaUHZrlGcme.jpg",
    "posterAlt": "비포 미드나잇 포스터"
  },
  {
    "id": "movie_108",
    "title": "해리가 샐리를 만났을 때",
    "genres": [
      "코미디",
      "로맨스",
      "드라마"
    ],
    "tags": [
      "감동",
      "유머",
      "캐릭터 매력",
      "여운"
    ],
    "characters": [
      "Harry Burns",
      "Sally Albright",
      "Marie"
    ],
    "releaseYear": 1989,
    "posterUrl": "https://image.tmdb.org/t/p/w780/m4IfPfmR3LELJgu5aa03CIennTF.jpg",
    "posterAlt": "해리가 샐리를 만났을 때 포스터"
  },
  {
    "id": "movie_109",
    "title": "500일의 썸머",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "tags": [
      "액션",
      "유머",
      "캐릭터 매력",
      "배우들의 연기력"
    ],
    "characters": [
      "Tom",
      "Summer",
      "McKenzie"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oQdXN6HQGba1Y2h7DEMJT45xxfn.jpg",
    "posterAlt": "500일의 썸머 포스터"
  },
  {
    "id": "movie_110",
    "title": "중경삼림",
    "genres": [
      "드라마",
      "코미디",
      "로맨스"
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Woman in Blonde Wig",
      "He Zhiwu / Cop 223",
      "Cop 663"
    ],
    "releaseYear": 1994,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xWHLnEqz6fXmTvWMF4N2y2aOH8U.jpg",
    "posterAlt": "중경삼림 포스터"
  },
  {
    "id": "movie_111",
    "title": "사랑도 통역이 되나요?",
    "genres": [
      "드라마",
      "코미디",
      "로맨스"
    ],
    "tags": [
      "감동",
      "연출",
      "배우들의 연기력",
      "유머"
    ],
    "characters": [
      "Bob Harris",
      "Charlotte",
      "John"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rGyDyUyepFIdFQLnzBelp3vsSaB.jpg",
    "posterAlt": "사랑도 통역이 되나요? 포스터"
  },
  {
    "id": "movie_112",
    "title": "시애틀의 잠 못 이루는 밤",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "tags": [
      "감동",
      "연출",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Annie Reed",
      "Sam Baldwin",
      "Jonah Baldwin"
    ],
    "releaseYear": 1993,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xB82SOCT8eH6UvNBiMIeYySedjH.jpg",
    "posterAlt": "시애틀의 잠 못 이루는 밤 포스터"
  },
  {
    "id": "movie_113",
    "title": "슈퍼배드",
    "genres": [
      "코미디"
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Seth",
      "Evan",
      "Fogell"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg",
    "posterAlt": "슈퍼배드 포스터"
  },
  {
    "id": "movie_114",
    "title": "사랑의 블랙홀",
    "genres": [
      "로맨스",
      "판타지",
      "코미디"
    ],
    "tags": [
      "감동",
      "여운",
      "세계관",
      "영상미"
    ],
    "characters": [
      "Phil Connors",
      "Rita Hanson",
      "Larry"
    ],
    "releaseYear": 1993,
    "posterUrl": "https://image.tmdb.org/t/p/w780/d00qZPqqTMOnRg2m6l6NVbhSbaP.jpg",
    "posterAlt": "사랑의 블랙홀 포스터"
  },
  {
    "id": "movie_115",
    "title": "내 여자친구의 결혼식",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "tags": [
      "액션",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Annie",
      "Lillian",
      "Helen"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qGQzVDltYk1gYpLZLk7wM9e3xyq.jpg",
    "posterAlt": "내 여자친구의 결혼식 포스터"
  },
  {
    "id": "movie_116",
    "title": "북스마트",
    "genres": [
      "코미디"
    ],
    "tags": [
      "연출",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Amy",
      "Molly",
      "Miss Fine"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oTY3zkK5zzp2CA2c3mSmVEHgFCz.jpg",
    "posterAlt": "북스마트 포스터"
  },
  {
    "id": "movie_117",
    "title": "Abby & Emily Go to Palm Springs",
    "genres": [],
    "tags": [],
    "characters": [],
    "releaseYear": 2020,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kAjtP2sYnPs2yVfdoyIej8ovkZ6.jpg",
    "posterAlt": "Abby & Emily Go to Palm Springs 포스터"
  },
  {
    "id": "movie_118",
    "title": "뜨거운 녀석들",
    "genres": [
      "범죄",
      "액션",
      "코미디"
    ],
    "tags": [
      "액션",
      "긴장감",
      "유머",
      "탄탄한 스토리"
    ],
    "characters": [
      "Nicholas Angel",
      "PC Danny Butterman",
      "Inspector Frank Butterman"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pzMU5ohKBC3IJKWDGhzLLlpgDk3.jpg",
    "posterAlt": "뜨거운 녀석들 포스터"
  },
  {
    "id": "movie_119",
    "title": "새벽의 황당한 저주",
    "genres": [
      "공포",
      "코미디"
    ],
    "tags": [
      "유머",
      "몰입감",
      "캐릭터 매력"
    ],
    "characters": [
      "Shaun",
      "Ed",
      "Liz"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nHuO4izZQD3ssjk4C73jFogsRg6.jpg",
    "posterAlt": "새벽의 황당한 저주 포스터"
  },
  {
    "id": "movie_120",
    "title": "스쿨 오브 락",
    "genres": [
      "코미디",
      "음악",
      "가족"
    ],
    "tags": [
      "감동적인 음악",
      "유머",
      "캐릭터 매력",
      "OST"
    ],
    "characters": [
      "Dewey Finn",
      "Rosalie Mullins",
      "Ned Schneebly"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/j9xIQfUKUbXqSD3WwqKzSvRL9Fb.jpg",
    "posterAlt": "스쿨 오브 락 포스터"
  },
  {
    "id": "movie_121",
    "title": "퀸카로 살아남는 법",
    "genres": [
      "드라마",
      "코미디"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "유머",
      "배우들의 연기력"
    ],
    "characters": [
      "Cady Heron",
      "Regina George",
      "Janis Ian"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6WcZxeBF5rOrTr7cocljvu3ET77.jpg",
    "posterAlt": "퀸카로 살아남는 법 포스터"
  },
  {
    "id": "movie_122",
    "title": "악마는 프라다를 입는다",
    "genres": [
      "드라마",
      "코미디"
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "유머"
    ],
    "characters": [
      "Miranda Priestly",
      "Andy Sachs",
      "Emily"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lxjGbkRnY9d2j8cxIHxX57NNvRH.jpg",
    "posterAlt": "악마는 프라다를 입는다 포스터"
  },
  {
    "id": "movie_123",
    "title": "Juno Reactor - Audio Visual Experience",
    "genres": [],
    "tags": [
      "영상미"
    ],
    "characters": [
      "벤 왓킨스"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uTgHpPtwXB3G8btBqzXRGGdcM6J.jpg",
    "posterAlt": "Juno Reactor - Audio Visual Experience 포스터"
  },
  {
    "id": "movie_124",
    "title": "미세스 다웃파이어",
    "genres": [
      "코미디",
      "드라마",
      "가족"
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Daniel Hillard / Mrs. Doubtfire",
      "Miranda Hillard",
      "Lydia Hillard"
    ],
    "releaseYear": 1993,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mOkdOaLv5ghEFJ1nEdlLS2yPVwf.jpg",
    "posterAlt": "미세스 다웃파이어 포스터"
  },
  {
    "id": "movie_125",
    "title": "언터처블: 1%의 우정",
    "genres": [
      "드라마",
      "코미디"
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "배우들의 연기력",
      "유머"
    ],
    "characters": [
      "Philippe",
      "Driss",
      "Yvonne"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4oOf3pmDD5rMNQGgsf7zMbFKtKC.jpg",
    "posterAlt": "언터처블: 1%의 우정 포스터"
  },
  {
    "id": "movie_126",
    "title": "비버리 힐스 캅",
    "genres": [
      "코미디",
      "범죄",
      "액션"
    ],
    "tags": [
      "액션",
      "긴장감",
      "탄탄한 스토리",
      "유머"
    ],
    "characters": [
      "Axel Foley",
      "Det. Billy Rosewood",
      "Sgt. Taggart"
    ],
    "releaseYear": 1984,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eBJEvKkhQ0tUt1dBAcTEYW6kCle.jpg",
    "posterAlt": "비버리 힐스 캅 포스터"
  },
  {
    "id": "movie_127",
    "title": "바비",
    "genres": [
      "코미디",
      "모험",
      "판타지"
    ],
    "tags": [
      "연출",
      "세계관",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Barbie",
      "Ken",
      "Gloria"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/h3mUJ9WEJ8PzA450ad4hrjsaiqG.jpg",
    "posterAlt": "바비 포스터"
  },
  {
    "id": "movie_128",
    "title": "맥스군 사랑에 빠지다",
    "genres": [
      "코미디",
      "드라마"
    ],
    "tags": [
      "연출",
      "유머",
      "캐릭터 매력",
      "배우들의 연기력"
    ],
    "characters": [
      "Max Fischer",
      "Herman Blume",
      "Rosemary Cross"
    ],
    "releaseYear": 1998,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hSJ6swahAuZ8wM96lHDTwQPXUvZ.jpg",
    "posterAlt": "맥스군 사랑에 빠지다 포스터"
  },
  {
    "id": "movie_129",
    "title": "마션",
    "genres": [
      "SF",
      "드라마",
      "모험"
    ],
    "tags": [
      "탄탄한 스토리",
      "몰입감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Mark Watney",
      "Melissa Lewis",
      "Annie Montrose"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uH8q40cjMAjrRHyPJMbQwAIJATb.jpg",
    "posterAlt": "마션 포스터"
  },
  {
    "id": "movie_130",
    "title": "마이너리티 리포트",
    "genres": [
      "SF",
      "액션",
      "스릴러"
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Chief John Anderton",
      "Agatha",
      "Danny Witwer"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oaVX63mgvSN4MRN98sg5molfKBd.jpg",
    "posterAlt": "마이너리티 리포트 포스터"
  },
  {
    "id": "movie_131",
    "title": "아바타",
    "genres": [
      "SF",
      "액션",
      "모험"
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Jake Sully",
      "Neytiri",
      "Dr. Grace Augustine"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/m5lCha2XcbDowDoYHPc0DTNaCPU.jpg",
    "posterAlt": "아바타 포스터"
  },
  {
    "id": "movie_132",
    "title": "더 록",
    "genres": [
      "액션",
      "모험",
      "스릴러"
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "John Patrick Mason",
      "Dr. Stanley Goodspeed",
      "Brigadier General Francis X. Hummel, USMC"
    ],
    "releaseYear": 1996,
    "posterUrl": "https://image.tmdb.org/t/p/w780/o9dnRLsS0EHqnTjGtndWfrQzeMh.jpg",
    "posterAlt": "더 록 포스터"
  },
  {
    "id": "movie_133",
    "title": "스피드",
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
      "Jack Traven",
      "Howard Payne",
      "Annie"
    ],
    "releaseYear": 1994,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iZsKy0Q4z4bEMgQhXgnWaooJniN.jpg",
    "posterAlt": "스피드 포스터"
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
