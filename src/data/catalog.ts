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
    "genreIds": [
      28,
      12,
      878
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
    "genreIds": [
      35,
      80,
      9648
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
    "genreIds": [
      35,
      18,
      10749
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
    "genreIds": [
      35,
      18
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
    "genreIds": [
      28,
      80,
      53
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
    "genreIds": [
      35,
      53,
      18
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
    "title": "가타카",
    "genres": [
      "SF",
      "드라마"
    ],
    "genreIds": [
      878,
      18
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Vincent Freeman",
      "Irene Cassini",
      "Jerome Eugene Morrow"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eSKr5Fl1MEC7zpAXaLWBWSBjgJq.jpg",
    "posterAlt": "가타카 포스터"
  },
  {
    "id": "movie_8",
    "title": "나를 찾아줘",
    "genres": [
      "미스터리",
      "스릴러",
      "드라마"
    ],
    "genreIds": [
      9648,
      53,
      18
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
    "genreIds": [
      18,
      10402,
      53
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
    "genreIds": [
      28,
      53
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
    "title": "12 몽키즈",
    "genres": [
      "SF",
      "스릴러",
      "미스터리"
    ],
    "genreIds": [
      878,
      53,
      9648
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "여운",
      "감동적인 음악"
    ],
    "characters": [
      "James Cole",
      "Dr. Kathryn Railly",
      "Jeffrey Goines"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6bSEAb5YOeEKW0lbki7bFCv6Zdh.jpg",
    "posterAlt": "12 몽키즈 포스터"
  },
  {
    "id": "movie_12",
    "title": "선샤인",
    "genres": [
      "SF",
      "스릴러"
    ],
    "genreIds": [
      878,
      53
    ],
    "tags": [
      "긴장감",
      "세계관",
      "몰입감"
    ],
    "characters": [
      "Capa",
      "Cassie",
      "Mace"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/z7IUV9BVDdN0rvgm0UXNRrhVu8X.jpg",
    "posterAlt": "선샤인 포스터"
  },
  {
    "id": "movie_13",
    "title": "그녀",
    "genres": [
      "로맨스",
      "SF",
      "드라마"
    ],
    "genreIds": [
      10749,
      878,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "감동",
      "여운"
    ],
    "characters": [
      "Theodore",
      "Samantha (voice)",
      "Letter Writer #1"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/thUJI82kWMxA2jtjLtPxDIj67tY.jpg",
    "posterAlt": "그녀 포스터"
  },
  {
    "id": "movie_14",
    "title": "포드 V 페라리",
    "genres": [
      "드라마",
      "액션",
      "역사"
    ],
    "genreIds": [
      18,
      28,
      36
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
    "genreIds": [
      18,
      10749
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
    "genreIds": [
      35,
      18
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
    "genreIds": [
      28,
      12
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
    "genreIds": [
      80,
      18,
      53
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
    "title": "이터널 선샤인",
    "genres": [
      "SF",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      878,
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "영상미",
      "배우들의 연기력"
    ],
    "characters": [
      "Joel Barish",
      "Clementine Kruczynski",
      "Mary"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jULvvUymAqM18gIDHbMRfKHbCSB.jpg",
    "posterAlt": "이터널 선샤인 포스터"
  },
  {
    "id": "movie_20",
    "title": "트루먼 쇼",
    "genres": [
      "코미디",
      "드라마"
    ],
    "genreIds": [
      35,
      18
    ],
    "tags": [
      "배우들의 연기력",
      "유머",
      "캐릭터 매력",
      "감동"
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
    "genreIds": [
      18,
      53,
      80
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
    "title": "패스트 라이브즈",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "여운",
      "감동",
      "감동적인 음악",
      "연출"
    ],
    "characters": [
      "Nora",
      "Hae Sung",
      "Arthur"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6o6jgwvPc0W1FuFwA9XFAHwljt4.jpg",
    "posterAlt": "패스트 라이브즈 포스터"
  },
  {
    "id": "movie_23",
    "title": "탑건: 매버릭",
    "genres": [
      "액션",
      "드라마"
    ],
    "genreIds": [
      28,
      18
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
    "genreIds": [
      12,
      35,
      10751
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
    "title": "히트",
    "genres": [
      "범죄",
      "드라마",
      "액션"
    ],
    "genreIds": [
      80,
      18,
      28
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "배우들의 연기력"
    ],
    "characters": [
      "Lt. Vincent Hanna",
      "Neil McCauley",
      "Chris Shiherlis"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/p0uAcyDgBXtCSXZdnacwr9OGcIH.jpg",
    "posterAlt": "히트 포스터"
  },
  {
    "id": "movie_26",
    "title": "올드보이",
    "genres": [
      "드라마",
      "스릴러",
      "미스터리"
    ],
    "genreIds": [
      18,
      53,
      9648,
      28
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
    "genreIds": [
      18,
      10749
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
    "genreIds": [
      35,
      80,
      28
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
    "genreIds": [
      80,
      9648,
      53
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
    "title": "너의 이름은.",
    "genres": [
      "애니메이션",
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      16,
      10749,
      18
    ],
    "tags": [
      "여운",
      "영상미",
      "몰입감",
      "세계관"
    ],
    "characters": [
      "Taki Tachibana (voice)",
      "Mitsuha Miyamizu (voice)",
      "Katsuhiko Teshigawara (voice)"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2DJCufz3Oa703PbLjNX1pM6MCG2.jpg",
    "posterAlt": "너의 이름은. 포스터"
  },
  {
    "id": "movie_31",
    "title": "스파이더맨: 뉴 유니버스",
    "genres": [
      "애니메이션",
      "액션",
      "모험"
    ],
    "genreIds": [
      16,
      28,
      12,
      878
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
    "genreIds": [
      18,
      10749,
      14
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
    "genreIds": [
      12,
      18,
      878
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
    "genreIds": [
      28,
      878,
      12
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
    "genreIds": [
      28,
      878
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "세계관",
      "OST"
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
    "title": "컨택트",
    "genres": [
      "드라마",
      "SF",
      "미스터리"
    ],
    "genreIds": [
      18,
      878,
      9648
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "배우들의 연기력",
      "반전"
    ],
    "characters": [
      "Louise Banks",
      "Ian Donnelly",
      "Colonel Weber"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yHEMUTIYZFHN3jjkKmTFrvhj64a.jpg",
    "posterAlt": "컨택트 포스터"
  },
  {
    "id": "movie_37",
    "title": "듄",
    "genres": [
      "SF",
      "모험"
    ],
    "genreIds": [
      878,
      12
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
    "genreIds": [
      878,
      18
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
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "감동",
      "세계관",
      "유머"
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
    "genreIds": [
      18,
      878
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
    "genreIds": [
      18,
      9648,
      878
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
    "genreIds": [
      53,
      18,
      10749
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
    "genreIds": [
      53,
      9648,
      10749
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
    "title": "설국열차",
    "genres": [
      "액션",
      "SF",
      "드라마"
    ],
    "genreIds": [
      28,
      878,
      18
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Curtis",
      "Namgoong Minsu",
      "Wilford"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jw66dQvYyXkZNA0bJ7nKvua9jDr.jpg",
    "posterAlt": "설국열차 포스터"
  },
  {
    "id": "movie_45",
    "title": "괴물",
    "genres": [
      "공포",
      "드라마",
      "SF"
    ],
    "genreIds": [
      27,
      18,
      878
    ],
    "tags": [
      "감동",
      "배우들의 연기력"
    ],
    "characters": [
      "Park Gang-du",
      "Park Hie-bong",
      "Park Nam-il"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tqDQzYGi1EWHgUZY91YRSJLDJVf.jpg",
    "posterAlt": "괴물 포스터"
  },
  {
    "id": "movie_46",
    "title": "부산행",
    "genres": [
      "공포",
      "스릴러",
      "액션"
    ],
    "genreIds": [
      27,
      53,
      28,
      12
    ],
    "tags": [
      "긴장감",
      "몰입감",
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
    "title": "곡성",
    "genres": [
      "공포",
      "미스터리"
    ],
    "genreIds": [
      27,
      9648
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Jong-goo",
      "Il-gwang",
      "Moo-myeong"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/k9AKtgRErXjz14lFHL2IJVCgwOT.jpg",
    "posterAlt": "곡성 포스터"
  },
  {
    "id": "movie_48",
    "title": "업그레이드",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      28,
      53,
      878
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Grey Trace",
      "Detective Cortez",
      "Eron Keen"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/x6DsGuZlY9JLcoTQ2j8eZaLkiDe.jpg",
    "posterAlt": "업그레이드 포스터"
  },
  {
    "id": "movie_49",
    "title": "미지와의 조우",
    "genres": [
      "SF",
      "드라마"
    ],
    "genreIds": [
      878,
      18
    ],
    "tags": [
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Roy Neary",
      "Claude Lacombe",
      "Ronnie Neary"
    ],
    "releaseYear": 1977,
    "posterUrl": "https://image.tmdb.org/t/p/w780/V8IMfTXjKihUDrjZqdp1maD2KG.jpg",
    "posterAlt": "미지와의 조우 포스터"
  },
  {
    "id": "movie_50",
    "title": "작은 아씨들",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
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
    "title": "애드 아스트라",
    "genres": [
      "SF",
      "드라마"
    ],
    "genreIds": [
      878,
      18
    ],
    "tags": [
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Roy McBride",
      "H. Clifford McBride",
      "Eve"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/37M8j1nwMs8wu2H2tMtDjqhTSnd.jpg",
    "posterAlt": "애드 아스트라 포스터"
  },
  {
    "id": "movie_52",
    "title": "콜 미 바이 유어 네임",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
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
    "genreIds": [
      18,
      10749
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
    "title": "브루클린",
    "genres": [
      "로맨스",
      "드라마",
      "역사"
    ],
    "genreIds": [
      10749,
      18,
      36
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Eilis Lacey",
      "Jim Farrell",
      "Tony Fiorello"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/d6BWEVuM3nq0rYCCJLcl4Gx1aTY.jpg",
    "posterAlt": "브루클린 포스터"
  },
  {
    "id": "movie_55",
    "title": "토이 스토리 3",
    "genres": [
      "애니메이션",
      "가족",
      "코미디"
    ],
    "genreIds": [
      16,
      10751,
      35
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
    "genreIds": [
      12,
      14,
      28
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
    "genreIds": [
      12,
      14,
      28
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
    "genreIds": [
      12,
      14,
      28
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
    "genreIds": [
      9648,
      53,
      27
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
    "genreIds": [
      27,
      9648,
      53
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
    "genreIds": [
      35,
      27
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
    "genreIds": [
      27,
      878
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
    "genreIds": [
      18,
      53
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
    "title": "워크 투 리멤버",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Jamie Sullivan",
      "Landon Carter",
      "Reverend Sullivan"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/chQNZbEuwYZoHYxLV3eAGlcURV1.jpg",
    "posterAlt": "워크 투 리멤버 포스터"
  },
  {
    "id": "movie_65",
    "title": "글래디에이터",
    "genres": [
      "액션",
      "드라마",
      "모험"
    ],
    "genreIds": [
      28,
      18,
      12
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
    "posterUrl": "https://image.tmdb.org/t/p/w780/4mMwki6S1MfdBfsKTvP8xqaRnWh.jpg",
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
    "genreIds": [
      12,
      28,
      53
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
    "genreIds": [
      28,
      12,
      53
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
    "genreIds": [
      28,
      18,
      9648,
      53
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
    "title": "레이드: 첫번째 습격",
    "genres": [
      "액션",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      28,
      53,
      80
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Rama",
      "Jaka",
      "Andi"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/b1oo2TChCLvB4gWXmfa3f2J95Cc.jpg",
    "posterAlt": "레이드: 첫번째 습격 포스터"
  },
  {
    "id": "movie_70",
    "title": "다이 하드",
    "genres": [
      "액션",
      "스릴러"
    ],
    "genreIds": [
      28,
      53
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
    "genreIds": [
      28,
      53,
      878
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
    "genreIds": [
      28,
      53,
      878
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
    "genreIds": [
      878,
      28,
      12
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
    "genreIds": [
      28,
      12,
      878
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
    "genreIds": [
      28,
      878
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
    "genreIds": [
      28,
      18,
      878
    ],
    "tags": [
      "액션",
      "몰입감",
      "배우들의 연기력",
      "감동"
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
    "genreIds": [
      28,
      80
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
      "역사",
      "드라마"
    ],
    "genreIds": [
      28,
      36,
      18
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
    "title": "와호장룡",
    "genres": [
      "모험",
      "드라마",
      "액션"
    ],
    "genreIds": [
      12,
      18,
      28,
      10749
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Li Mu Bai",
      "Yu Shu Lien",
      "Jen"
    ],
    "releaseYear": 2000,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iCgq5JMo9BqqK8rDKOCJxE86ub9.jpg",
    "posterAlt": "와호장룡 포스터"
  },
  {
    "id": "movie_80",
    "title": "킬 빌: 1부",
    "genres": [
      "액션",
      "범죄"
    ],
    "genreIds": [
      28,
      80
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
    "genreIds": [
      80,
      9648,
      53
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
    "genreIds": [
      18,
      53,
      9648
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
    "genreIds": [
      9648,
      53
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
    "genreIds": [
      18,
      80,
      53
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
    "genreIds": [
      80,
      9648,
      53
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
    "genreIds": [
      80,
      9648,
      53
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
    "genreIds": [
      53,
      80,
      18,
      9648
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
    "genreIds": [
      53,
      80,
      9648
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
    "genreIds": [
      80,
      53,
      18
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
    "genreIds": [
      9648,
      53,
      18
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
    "genreIds": [
      18,
      9648,
      53
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
    "genreIds": [
      53,
      9648,
      80
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
    "title": "디 아더스",
    "genres": [
      "공포",
      "미스터리",
      "스릴러"
    ],
    "genreIds": [
      27,
      9648,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "세계관",
      "반전"
    ],
    "characters": [
      "Grace Stewart",
      "Anne Stewart",
      "Nicholas Stewart"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9kvhnfgHxBibc2yoLYkZ6WQag6L.jpg",
    "posterAlt": "디 아더스 포스터"
  },
  {
    "id": "movie_94",
    "title": "오리엔트 특급 살인",
    "genres": [
      "미스터리",
      "드라마",
      "범죄"
    ],
    "genreIds": [
      9648,
      18,
      80
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
    "title": "더 게임",
    "genres": [
      "드라마",
      "스릴러",
      "미스터리"
    ],
    "genreIds": [
      18,
      53,
      9648
    ],
    "tags": [
      "긴장감",
      "배우들의 연기력",
      "감동",
      "몰입감"
    ],
    "characters": [
      "Nicholas Van Orton",
      "Conrad Van Orton",
      "Christine"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/npvUSLiRQxcGwOzjJO8OTxthO77.jpg",
    "posterAlt": "더 게임 포스터"
  },
  {
    "id": "movie_96",
    "title": "이창",
    "genres": [
      "스릴러",
      "미스터리",
      "드라마"
    ],
    "genreIds": [
      53,
      9648,
      18
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
    "genreIds": [
      10749,
      35,
      18
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
    "genreIds": [
      10749,
      35
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
    "genreIds": [
      18,
      10749
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
    "genreIds": [
      18,
      10749
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
    "title": "타이타닉",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Jack Dawson",
      "Rose DeWitt Bukater",
      "Cal Hockley"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/132KjhVrWUqKFVfMAKKNkherytA.jpg",
    "posterAlt": "타이타닉 포스터"
  },
  {
    "id": "movie_102",
    "title": "아멜리에",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
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
    "genreIds": [
      10749,
      18
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
    "posterUrl": "https://image.tmdb.org/t/p/w780/ntdgcdsmMuHd9s4oEKTvWDiUyU7.jpg",
    "posterAlt": "노트북 포스터"
  },
  {
    "id": "movie_104",
    "title": "브로크백 마운틴",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
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
    "title": "캐롤",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Carol Aird",
      "Therese Belivet",
      "Harge Aird"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qJHCj5lZ25uMlKCtaFgZujs8Zg4.jpg",
    "posterAlt": "캐롤 포스터"
  },
  {
    "id": "movie_106",
    "title": "비포 선셋",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
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
    "genreIds": [
      10749,
      18
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
    "genreIds": [
      35,
      10749,
      18
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
    "genreIds": [
      35,
      18,
      10749
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
    "genreIds": [
      18,
      35,
      10749
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
    "posterUrl": "https://image.tmdb.org/t/p/w780/pT12E2OfHSSRTCASe2gkJfrBUAE.jpg",
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
    "genreIds": [
      18,
      35,
      10749
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
    "genreIds": [
      35,
      18,
      10749
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
    "genreIds": [
      35
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
    "genreIds": [
      10749,
      14,
      35
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
    "genreIds": [
      35,
      10749
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
    "genreIds": [
      35
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
    "title": "팜 스프링스",
    "genres": [
      "코미디",
      "로맨스",
      "SF"
    ],
    "genreIds": [
      35,
      10749,
      878
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "감동",
      "여운"
    ],
    "characters": [
      "Nyles",
      "Sarah",
      "Roy"
    ],
    "releaseYear": 2020,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sodg5pHVYDGnvQn4NZZu9808DPg.jpg",
    "posterAlt": "팜 스프링스 포스터"
  },
  {
    "id": "movie_118",
    "title": "뜨거운 녀석들",
    "genres": [
      "범죄",
      "액션",
      "코미디"
    ],
    "genreIds": [
      80,
      28,
      35
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
    "genreIds": [
      27,
      35
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
      "가족",
      "음악"
    ],
    "genreIds": [
      35,
      10751,
      10402
    ],
    "tags": [
      "감동적인 음악",
      "유머",
      "캐릭터 매력",
      "감동"
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
    "genreIds": [
      18,
      35
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
    "genreIds": [
      18,
      35
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
    "title": "주노",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      35,
      18,
      10749
    ],
    "tags": [
      "감동",
      "유머",
      "캐릭터 매력",
      "배우들의 연기력"
    ],
    "characters": [
      "Juno MacGuff",
      "Paulie Bleeker",
      "Vanessa Loring"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mwPfMwbwBXhLR3HTnwNDTGRLoXb.jpg",
    "posterAlt": "주노 포스터"
  },
  {
    "id": "movie_124",
    "title": "미세스 다웃파이어",
    "genres": [
      "코미디",
      "드라마",
      "가족"
    ],
    "genreIds": [
      35,
      18,
      10751
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
    "genreIds": [
      18,
      35
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
    "genreIds": [
      35,
      80,
      28
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
    "genreIds": [
      35,
      12,
      14
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
    "genreIds": [
      35,
      18
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
    "genreIds": [
      878,
      18,
      12
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
    "genreIds": [
      878,
      28,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Chief John Anderton",
      "Danny Witwer",
      "Agatha"
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
    "genreIds": [
      878,
      28,
      12
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
    "genreIds": [
      28,
      12,
      53
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
    "genreIds": [
      28,
      53
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
  },
  {
    "id": "movie_134",
    "title": "빽 투 더 퓨쳐",
    "genres": [
      "모험",
      "코미디",
      "SF"
    ],
    "genreIds": [
      12,
      35,
      878
    ],
    "tags": [
      "몰입감",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Marty McFly",
      "Emmett Brown",
      "George McFly"
    ],
    "releaseYear": 1985,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zzxvtXJ9pahjWVX3Q2ko29J0Zf6.jpg",
    "posterAlt": "빽 투 더 퓨쳐 포스터"
  },
  {
    "id": "movie_135",
    "title": "빽 투 더 퓨쳐 2",
    "genres": [
      "모험",
      "코미디",
      "SF"
    ],
    "genreIds": [
      12,
      35,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Marty McFly / Marty McFly Junior / Marlene McFly",
      "Doctor Emmett Brown",
      "Lorraine"
    ],
    "releaseYear": 1989,
    "posterUrl": "https://image.tmdb.org/t/p/w780/f6k9Dd6wDG6Ingkfu6TATo9GNqB.jpg",
    "posterAlt": "빽 투 더 퓨쳐 2 포스터"
  },
  {
    "id": "movie_136",
    "title": "스타 트렉: 더 비기닝",
    "genres": [
      "SF",
      "액션",
      "모험"
    ],
    "genreIds": [
      878,
      28,
      12
    ],
    "tags": [
      "긴장감",
      "감동",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Cadet James T. Kirk",
      "Commander Spock",
      "Ambassador Spock"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pB9mA8cDfP5aQyWzXz287rIBLDP.jpg",
    "posterAlt": "스타 트렉: 더 비기닝 포스터"
  },
  {
    "id": "movie_137",
    "title": "스타 트렉: 다크니스",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "감동",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Captain James T. Kirk",
      "Commander Spock",
      "Lieutenant Nyota Uhura"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/n0HWj5hgjMKEJQ6mJXkZnNXCKsJ.jpg",
    "posterAlt": "스타 트렉: 다크니스 포스터"
  },
  {
    "id": "movie_138",
    "title": "디스트릭트 9",
    "genres": [
      "SF"
    ],
    "genreIds": [
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "유머"
    ],
    "characters": [
      "Wikus van de Merwe",
      "Christopher Johnson / Grey Bradnam / Trent",
      "Sarah Livingstone - Sociologist"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/gzMNQLELXzlssBUuTrZV3WmqBQO.jpg",
    "posterAlt": "디스트릭트 9 포스터"
  },
  {
    "id": "movie_139",
    "title": "그래비티",
    "genres": [
      "SF",
      "스릴러",
      "드라마"
    ],
    "genreIds": [
      878,
      53,
      18
    ],
    "tags": [
      "감동",
      "긴장감",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Ryan Stone",
      "Matt Kowalski",
      "Mission Control (voice)"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/u8ffl7CRAS12KA8eQEtkLuHg8Fm.jpg",
    "posterAlt": "그래비티 포스터"
  },
  {
    "id": "movie_140",
    "title": "더 문",
    "genres": [
      "SF",
      "드라마"
    ],
    "genreIds": [
      878,
      18
    ],
    "tags": [
      "긴장감",
      "여운",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Sam Bell",
      "GERTY (voice)",
      "Tess Bell"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/gxbxxoaACnd7GwN1QfGDhA5kKqD.jpg",
    "posterAlt": "더 문 포스터"
  },
  {
    "id": "movie_141",
    "title": "루퍼",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      28,
      53,
      878
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Joe",
      "Old Joe",
      "Sara"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7MPHCBEek4qbsuauUvrVViOgQ5J.jpg",
    "posterAlt": "루퍼 포스터"
  },
  {
    "id": "movie_142",
    "title": "칠드런 오브 맨",
    "genres": [
      "SF",
      "스릴러",
      "액션"
    ],
    "genreIds": [
      878,
      53,
      28
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Theo Faron",
      "Kee",
      "Luke"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/bIYqTLOtCXTivWaAbjWGEY8sVnG.jpg",
    "posterAlt": "칠드런 오브 맨 포스터"
  },
  {
    "id": "movie_143",
    "title": "레디 플레이어 원",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Parzival / Wade",
      "Art3mis / Samantha",
      "Sorrento"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/j4TIfwFrm8WnckByTnMFEAuIVju.jpg",
    "posterAlt": "레디 플레이어 원 포스터"
  },
  {
    "id": "movie_144",
    "title": "오블리비언",
    "genres": [
      "액션",
      "SF",
      "모험"
    ],
    "genreIds": [
      28,
      878,
      12,
      9648
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Jack",
      "Beech",
      "Julia"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zxBmFFeYRKM6kLIxmrhWnyd055C.jpg",
    "posterAlt": "오블리비언 포스터"
  },
  {
    "id": "movie_145",
    "title": "에이 아이",
    "genres": [
      "드라마",
      "SF",
      "모험"
    ],
    "genreIds": [
      18,
      878,
      12
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "배우들의 연기력"
    ],
    "characters": [
      "David",
      "Gigolo Joe",
      "Monica Swinton"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/v5URBLEZCtICf0DsnEztdrAs4dD.jpg",
    "posterAlt": "에이 아이 포스터"
  },
  {
    "id": "movie_146",
    "title": "우주전쟁",
    "genres": [
      "모험",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      12,
      53,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "Ray Ferrier",
      "Rachel Ferrier",
      "Robbie Ferrier"
    ],
    "releaseYear": 2005,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kVfs7m8hfBC6nUrJBcuoTg1NLeA.jpg",
    "posterAlt": "우주전쟁 포스터"
  },
  {
    "id": "movie_147",
    "title": "지구가 멈추는 날",
    "genres": [
      "드라마",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      18,
      878,
      53
    ],
    "tags": [
      "세계관",
      "배우들의 연기력",
      "감동",
      "긴장감"
    ],
    "characters": [
      "Klaatu",
      "Helen Benson",
      "Jacob Benson"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/x2YagBT1Q0cMa6GJVHv3qAIO7F5.jpg",
    "posterAlt": "지구가 멈추는 날 포스터"
  },
  {
    "id": "movie_148",
    "title": "소스 코드",
    "genres": [
      "스릴러",
      "SF",
      "미스터리"
    ],
    "genreIds": [
      53,
      878,
      9648
    ],
    "tags": [
      "액션",
      "긴장감",
      "탄탄한 스토리",
      "몰입감"
    ],
    "characters": [
      "Colter Stevens",
      "Christina Warren",
      "Colleen Goodwin"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eXnXhxW23RuH86fTE3xjW7QLplS.jpg",
    "posterAlt": "소스 코드 포스터"
  },
  {
    "id": "movie_149",
    "title": "아이, 로봇",
    "genres": [
      "액션",
      "SF"
    ],
    "genreIds": [
      28,
      878
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "캐릭터 매력",
      "액션"
    ],
    "characters": [
      "Del Spooner",
      "Susan Calvin",
      "Sonny (voice)"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1Nj0pcza7LuMrx3igjW5Go3zUji.jpg",
    "posterAlt": "아이, 로봇 포스터"
  },
  {
    "id": "movie_150",
    "title": "콘택트",
    "genres": [
      "드라마",
      "SF",
      "미스터리"
    ],
    "genreIds": [
      18,
      878,
      9648
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "반전"
    ],
    "characters": [
      "Ellie Arroway",
      "Palmer Joss",
      "Michael Kitz"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qrPziDNhXLCrOShs3cPY1Arb71J.jpg",
    "posterAlt": "콘택트 포스터"
  },
  {
    "id": "movie_151",
    "title": "프레데터",
    "genres": [
      "SF",
      "액션",
      "모험"
    ],
    "genreIds": [
      878,
      28,
      12,
      53
    ],
    "tags": [
      "몰입감",
      "액션",
      "긴장감"
    ],
    "characters": [
      "Major Alan \"Dutch\" Schaefer",
      "Al Dillon",
      "The Predator / Helicopter Pilot"
    ],
    "releaseYear": 1987,
    "posterUrl": "https://image.tmdb.org/t/p/w780/AjYcJsuiqW4sHFEmh5SVSy5PswH.jpg",
    "posterAlt": "프레데터 포스터"
  },
  {
    "id": "movie_152",
    "title": "제5원소",
    "genres": [
      "SF",
      "액션",
      "모험"
    ],
    "genreIds": [
      878,
      28,
      12
    ],
    "tags": [
      "세계관",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Korben Dallas",
      "Leeloo",
      "Zorg"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/npcHgyp5MmKMe4lWqJi2ma1CuhC.jpg",
    "posterAlt": "제5원소 포스터"
  },
  {
    "id": "movie_153",
    "title": "월•E",
    "genres": [
      "애니메이션",
      "가족",
      "SF"
    ],
    "genreIds": [
      16,
      10751,
      878
    ],
    "tags": [
      "영상미",
      "세계관",
      "감동",
      "캐릭터 매력"
    ],
    "characters": [
      "WALL·E / M-O (voice)",
      "EVE (voice)",
      "Captain (voice)"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/skTzymk67FfQSfGvwp4JSAqje4Z.jpg",
    "posterAlt": "월•E 포스터"
  },
  {
    "id": "movie_154",
    "title": "귀여운 여인",
    "genres": [
      "로맨스",
      "코미디"
    ],
    "genreIds": [
      10749,
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "감동"
    ],
    "characters": [
      "Edward Lewis",
      "Vivian Ward",
      "James Morse"
    ],
    "releaseYear": 1990,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6F41jUuKsZGDnrKsvfVtSNfWrgB.jpg",
    "posterAlt": "귀여운 여인 포스터"
  },
  {
    "id": "movie_155",
    "title": "로맨틱 홀리데이",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "연출",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Amanda",
      "Iris",
      "Graham"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eN7rAl9kJ390iu9Rfz8shYgToZ1.jpg",
    "posterAlt": "로맨틱 홀리데이 포스터"
  },
  {
    "id": "movie_156",
    "title": "유브 갓 메일",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "연출",
      "유머",
      "캐릭터 매력",
      "감동"
    ],
    "characters": [
      "Kathleen Kelly",
      "Joe Fox",
      "Frank Navasky"
    ],
    "releaseYear": 1998,
    "posterUrl": "https://image.tmdb.org/t/p/w780/e2uVtH6TpMfUl7WeOM70ezkcjsU.jpg",
    "posterAlt": "유브 갓 메일 포스터"
  },
  {
    "id": "movie_157",
    "title": "크레이지 리치 아시안",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Rachel Chu",
      "Nick Young",
      "Eleanor Young"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3l6wpIL6wiq593MnV3AhIhPjww2.jpg",
    "posterAlt": "크레이지 리치 아시안 포스터"
  },
  {
    "id": "movie_158",
    "title": "미 비포 유",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "연출",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Louisa 'Lou' Clark",
      "William 'Will' Traynor",
      "Camilla Traynor"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/aCnkVi4QTuc7E0d0qp0SAnRA3M0.jpg",
    "posterAlt": "미 비포 유 포스터"
  },
  {
    "id": "movie_159",
    "title": "내가 널 사랑할 수 없는 10가지 이유",
    "genres": [
      "코미디",
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      35,
      10749,
      18
    ],
    "tags": [
      "감동적인 음악",
      "유머",
      "캐릭터 매력",
      "감동"
    ],
    "characters": [
      "Patrick Verona",
      "Katarina Stratford",
      "Cameron James"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/syoeWNSLr7AMesZXM5DUAmoDRvp.jpg",
    "posterAlt": "내가 널 사랑할 수 없는 10가지 이유 포스터"
  },
  {
    "id": "movie_160",
    "title": "러브 액츄얼리",
    "genres": [
      "코미디",
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      35,
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "The Prime Minister",
      "Harry",
      "Karen"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tvaPe5kPoJCLn0xycctkHUaph7w.jpg",
    "posterAlt": "러브 액츄얼리 포스터"
  },
  {
    "id": "movie_161",
    "title": "빅 식",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      35,
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Kumail Nanjiani",
      "Emily Gardner",
      "Beth Gardner"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2RVod2apX85tg1yEK52G1EcE6Fd.jpg",
    "posterAlt": "빅 식 포스터"
  },
  {
    "id": "movie_162",
    "title": "안녕, 헤이즐",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Hazel Grace Lancaster",
      "Augustus Waters",
      "Isaac"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5MdllYBVC9qomummBQSCPWrTylZ.jpg",
    "posterAlt": "안녕, 헤이즐 포스터"
  },
  {
    "id": "movie_163",
    "title": "우리 사이 어쩌면",
    "genres": [
      "로맨스",
      "코미디"
    ],
    "genreIds": [
      10749,
      35
    ],
    "tags": [
      "연출",
      "감동",
      "여운",
      "유머"
    ],
    "characters": [
      "Sasha",
      "Marcus",
      "Harry"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hIVKH9P7HcJsBsPfULpFkKhzgbv.jpg",
    "posterAlt": "우리 사이 어쩌면 포스터"
  },
  {
    "id": "movie_164",
    "title": "엽기적인 그녀",
    "genres": [
      "드라마",
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      18,
      35,
      10749
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "The Girl",
      "Kyun-woo",
      "Kyun-woo's Father"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/h7xTfZbrJ86nzypPvPjwVmxZoHS.jpg",
    "posterAlt": "엽기적인 그녀 포스터"
  },
  {
    "id": "movie_165",
    "title": "운명에 관하여",
    "genres": [
      "로맨스",
      "코미디"
    ],
    "genreIds": [
      10749,
      35
    ],
    "tags": [
      "감동",
      "여운",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Margot Hayes",
      "Griffin Reed",
      "Kip Prescott"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fabZkaVHYJ67KbZx7oFoitauX34.jpg",
    "posterAlt": "운명에 관하여 포스터"
  },
  {
    "id": "movie_166",
    "title": "10일 안에 남자 친구에게 차이는 법",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "감동",
      "여운"
    ],
    "characters": [
      "Andie Anderson",
      "Benjamin Barry",
      "Michelle Rubin"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ipcmp1Ihgkg2hG4WjArukn5AMzd.jpg",
    "posterAlt": "10일 안에 남자 친구에게 차이는 법 포스터"
  },
  {
    "id": "movie_167",
    "title": "서약",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Paige Collins",
      "Leo Collins",
      "Bill Thornton"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rjHc33xVVEgpbPg6vDjGcZfQSNv.jpg",
    "posterAlt": "서약 포스터"
  },
  {
    "id": "movie_168",
    "title": "크레이지 스투피드 러브",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      35,
      18,
      10749
    ],
    "tags": [
      "감동",
      "유머",
      "캐릭터 매력",
      "배우들의 연기력"
    ],
    "characters": [
      "Cal",
      "Jacob",
      "Emily"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/p4RafgAPk558muOjnBMHhMArjS2.jpg",
    "posterAlt": "크레이지 스투피드 러브 포스터"
  },
  {
    "id": "movie_169",
    "title": "페리스의 해방",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Ferris Bueller",
      "Cameron Frye",
      "Sloane Peterson"
    ],
    "releaseYear": 1986,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3JxxljEbEkPZNDS45UygT5mEJzH.jpg",
    "posterAlt": "페리스의 해방 포스터"
  },
  {
    "id": "movie_170",
    "title": "금발이 너무해",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "긴장감",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Elle Woods",
      "Emmetten Richmond",
      "Vivian Kensington"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fN3beo2iwZqXGJXYBVJ6t1E5mD2.jpg",
    "posterAlt": "금발이 너무해 포스터"
  },
  {
    "id": "movie_171",
    "title": "이지 A",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Olive",
      "Woodchuck Todd",
      "Marianne"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iOXlEm5gq5kXdIJdgsdIly5a0NK.jpg",
    "posterAlt": "이지 A 포스터"
  },
  {
    "id": "movie_172",
    "title": "21 점프 스트리트",
    "genres": [
      "액션",
      "코미디",
      "범죄"
    ],
    "genreIds": [
      28,
      35,
      80
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동",
      "유머"
    ],
    "characters": [
      "Schmidt",
      "Jenko",
      "Molly Tracey"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8frigUQH9rpSasBwMKoNPCzvjCW.jpg",
    "posterAlt": "21 점프 스트리트 포스터"
  },
  {
    "id": "movie_173",
    "title": "행오버",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Phil Wenneck",
      "Stu Price",
      "Alan Garner"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/A0uS9rHR56FeBtpjVki16M5xxSW.jpg",
    "posterAlt": "행오버 포스터"
  },
  {
    "id": "movie_174",
    "title": "클루리스",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "연출",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Cher",
      "Dionne",
      "Tai"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8AwVTcgpTnmeOs4TdTWqcFDXEsA.jpg",
    "posterAlt": "클루리스 포스터"
  },
  {
    "id": "movie_175",
    "title": "앵커맨",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Ron Burgundy",
      "Veronica Corningstone",
      "Brian Fantana"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mhZIcRePT7U8viFQVjt1ZjYIsR4.jpg",
    "posterAlt": "앵커맨 포스터"
  },
  {
    "id": "movie_176",
    "title": "뛰는 백수 나는 건달",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "세계관",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Peter Gibbons",
      "Joanna",
      "Michael Bolton"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/npqWmcDD7n5opVPIsmPVD5fjAxD.jpg",
    "posterAlt": "뛰는 백수 나는 건달 포스터"
  },
  {
    "id": "movie_177",
    "title": "스텝 브라더스",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Brennan Huff",
      "Dale Doback",
      "Dr. Robert Doback"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nvggBbEraUTAVR6ffP3AaBUWSHs.jpg",
    "posterAlt": "스텝 브라더스 포스터"
  },
  {
    "id": "movie_178",
    "title": "게임 나이트",
    "genres": [
      "미스터리",
      "코미디",
      "범죄"
    ],
    "genreIds": [
      9648,
      35,
      80
    ],
    "tags": [
      "유머",
      "반전",
      "탄탄한 스토리",
      "캐릭터 매력"
    ],
    "characters": [
      "Max",
      "Annie",
      "Brooks"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/85R8LMyn9f2Lev2YPBF8Nughrkv.jpg",
    "posterAlt": "게임 나이트 포스터"
  },
  {
    "id": "movie_179",
    "title": "나폴레옹 다이너마이트",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "캐릭터 매력",
      "유머"
    ],
    "characters": [
      "Napoleon Dynamite",
      "Pedro Sanchez",
      "Deb"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6Iv6Uwa2SBLN0dSGM00rdrwN4MJ.jpg",
    "posterAlt": "나폴레옹 다이너마이트 포스터"
  },
  {
    "id": "movie_180",
    "title": "피치 퍼펙트",
    "genres": [
      "코미디",
      "음악",
      "로맨스"
    ],
    "genreIds": [
      35,
      10402,
      10749
    ],
    "tags": [
      "감동",
      "OST",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Beca Mitchell",
      "Aubrey Posen",
      "Chloe Beale"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/gsFoJk9g8W3zgaipRrrURk7LbiF.jpg",
    "posterAlt": "피치 퍼펙트 포스터"
  },
  {
    "id": "movie_181",
    "title": "마스크",
    "genres": [
      "코미디",
      "판타지",
      "범죄"
    ],
    "genreIds": [
      35,
      14,
      80,
      10749
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "세계관",
      "영상미"
    ],
    "characters": [
      "Stanley Ipkiss / The Mask",
      "Mitch Kellaway",
      "Dorian Tyrrell"
    ],
    "releaseYear": 1994,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jPC2eYub74zwf2tPGVtzSlBW6Oy.jpg",
    "posterAlt": "마스크 포스터"
  },
  {
    "id": "movie_182",
    "title": "원 데이",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "연출",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Emma Morley",
      "Dexter Mayhew",
      "Callum O'Neill"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/g43Ef6uvkOh0vt1JhN3ZfN362eL.jpg",
    "posterAlt": "원 데이 포스터"
  },
  {
    "id": "movie_183",
    "title": "인디아나 존스: 레이더스",
    "genres": [
      "모험",
      "액션"
    ],
    "genreIds": [
      12,
      28
    ],
    "tags": [
      "탄탄한 스토리",
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Indiana Jones",
      "Marion Ravenwood",
      "Dr. René Belloq"
    ],
    "releaseYear": 1981,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xB8nOHHz8bmuM3GoW3gFttUvEks.jpg",
    "posterAlt": "인디아나 존스: 레이더스 포스터"
  },
  {
    "id": "movie_184",
    "title": "존 윅: 리로드",
    "genres": [
      "액션",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      28,
      53,
      80
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "John Wick",
      "Cassian",
      "Bowery King"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7IEjgGVcOT3kTIb42yFLPVjSvot.jpg",
    "posterAlt": "존 윅: 리로드 포스터"
  },
  {
    "id": "movie_185",
    "title": "존 윅 3: 파라벨룸",
    "genres": [
      "액션",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      28,
      53,
      80
    ],
    "tags": [
      "액션",
      "감동",
      "유머",
      "몰입감"
    ],
    "characters": [
      "John Wick",
      "Sofia",
      "Winston"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8dGCWRwrMjn1jdFCI5xu5VrkGBL.jpg",
    "posterAlt": "존 윅 3: 파라벨룸 포스터"
  },
  {
    "id": "movie_186",
    "title": "테이큰",
    "genres": [
      "액션",
      "스릴러"
    ],
    "genreIds": [
      28,
      53
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Bryan Mills",
      "Kim Mills",
      "Lenore St. John"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/wUBC2bs4SxGgomacSR32qRm0SPh.jpg",
    "posterAlt": "테이큰 포스터"
  },
  {
    "id": "movie_187",
    "title": "도망자",
    "genres": [
      "액션",
      "스릴러",
      "드라마"
    ],
    "genreIds": [
      28,
      53,
      18
    ],
    "tags": [
      "액션",
      "긴장감",
      "반전",
      "몰입감"
    ],
    "characters": [
      "Richard Kimble",
      "Samuel Gerard",
      "Cosmo Renfro"
    ],
    "releaseYear": 1993,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hTe0eJaiUjBDNYZim3OZUkSvCXe.jpg",
    "posterAlt": "도망자 포스터"
  },
  {
    "id": "movie_188",
    "title": "매드 맥스 2: 로드 워리어",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      28,
      53,
      878
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "Max Rockatansky",
      "The Gyro Captain",
      "Pappagallo"
    ],
    "releaseYear": 1981,
    "posterUrl": "https://image.tmdb.org/t/p/w780/c1aVRqQjv0EfkE2DVBRjvGgyMFA.jpg",
    "posterAlt": "매드 맥스 2: 로드 워리어 포스터"
  },
  {
    "id": "movie_189",
    "title": "라스트 사무라이",
    "genres": [
      "드라마",
      "액션",
      "전쟁"
    ],
    "genreIds": [
      18,
      28,
      10752
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "액션"
    ],
    "characters": [
      "Nathan Algren",
      "Moritsugu Katsumoto",
      "Simon Graham"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ovRdxTdjJWo3sRZWlv7nD4sM74G.jpg",
    "posterAlt": "라스트 사무라이 포스터"
  },
  {
    "id": "movie_190",
    "title": "페이스 오프",
    "genres": [
      "액션",
      "범죄",
      "SF"
    ],
    "genreIds": [
      28,
      80,
      878
    ],
    "tags": [
      "액션",
      "긴장감",
      "몰입감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Sean Archer",
      "Castor Troy",
      "Eve Archer"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/wUHMETCAsHvDUkrpq0owD4mqQ0p.jpg",
    "posterAlt": "페이스 오프 포스터"
  },
  {
    "id": "movie_191",
    "title": "로보캅",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      28,
      53,
      878
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "Officer Alex J. Murphy / RoboCop",
      "Officer Anne Lewis",
      "The Old Man"
    ],
    "releaseYear": 1987,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ktOrQjOklsEhr75KItQloX1hc9Q.jpg",
    "posterAlt": "로보캅 포스터"
  },
  {
    "id": "movie_192",
    "title": "나쁜 녀석들",
    "genres": [
      "액션",
      "코미디",
      "범죄"
    ],
    "genreIds": [
      28,
      35,
      80,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "탄탄한 스토리",
      "감동"
    ],
    "characters": [
      "Mike Lowrey",
      "Marcus Burnett",
      "Julie Mott"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kNwqxVmtylfpnrcIjJuEuVwIHQC.jpg",
    "posterAlt": "나쁜 녀석들 포스터"
  },
  {
    "id": "movie_193",
    "title": "나이트 크롤러",
    "genres": [
      "범죄",
      "드라마",
      "스릴러"
    ],
    "genreIds": [
      80,
      18,
      53
    ],
    "tags": [
      "긴장감",
      "배우들의 연기력",
      "캐릭터 매력",
      "탄탄한 스토리"
    ],
    "characters": [
      "Louis Bloom",
      "Rick",
      "Nina Romina"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/wVflplL5OMy8nD1Z7gM64lIRvwa.jpg",
    "posterAlt": "나이트 크롤러 포스터"
  },
  {
    "id": "movie_194",
    "title": "윈드 리버",
    "genres": [
      "범죄",
      "미스터리",
      "드라마"
    ],
    "genreIds": [
      80,
      9648,
      18,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "반전",
      "배우들의 연기력"
    ],
    "characters": [
      "Cory Lambert",
      "Jane Banner",
      "Martin Hanson"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lskBfr1zqKcgl6RYukNBt6pRWVj.jpg",
    "posterAlt": "윈드 리버 포스터"
  },
  {
    "id": "movie_195",
    "title": "프라이멀 피어",
    "genres": [
      "범죄",
      "드라마",
      "미스터리"
    ],
    "genreIds": [
      80,
      18,
      9648,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Martin Vail",
      "Janet Venable",
      "Aaron/Roy Stampler"
    ],
    "releaseYear": 1996,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vLv8a0OpH33EDyU2ZqRb5mfMnKS.jpg",
    "posterAlt": "프라이멀 피어 포스터"
  },
  {
    "id": "movie_196",
    "title": "인썸니아",
    "genres": [
      "스릴러",
      "범죄",
      "드라마"
    ],
    "genreIds": [
      53,
      80,
      18
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Will Dormer",
      "Walter Finch",
      "Ellie Burr"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/72vB0ekpPOIDD0JI0EcueCqlLaa.jpg",
    "posterAlt": "인썸니아 포스터"
  },
  {
    "id": "movie_197",
    "title": "아이덴티티",
    "genres": [
      "미스터리",
      "스릴러"
    ],
    "genreIds": [
      9648,
      53
    ],
    "tags": [
      "긴장감",
      "반전",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Ed",
      "Rhodes",
      "Paris"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/91N7EeWISYM4mBsdQnGJtcrywhS.jpg",
    "posterAlt": "아이덴티티 포스터"
  },
  {
    "id": "movie_198",
    "title": "가라, 아이야, 가라",
    "genres": [
      "범죄",
      "드라마",
      "미스터리"
    ],
    "genreIds": [
      80,
      18,
      9648
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Patrick Kenzie",
      "Angie Gennaro",
      "Jack Doyle"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iowk2KfqNPklb9oUh3MUJu8yiXm.jpg",
    "posterAlt": "가라, 아이야, 가라 포스터"
  },
  {
    "id": "movie_199",
    "title": "본 콜렉터",
    "genres": [
      "범죄",
      "스릴러",
      "드라마"
    ],
    "genreIds": [
      80,
      53,
      18,
      9648
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Lincoln Rhyme",
      "Amelia Donaghy",
      "Thelma"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nunlMo2OeSbHlfgsaHABLFdqZBJ.jpg",
    "posterAlt": "본 콜렉터 포스터"
  },
  {
    "id": "movie_200",
    "title": "인비저블 게스트",
    "genres": [
      "드라마",
      "미스터리",
      "스릴러"
    ],
    "genreIds": [
      18,
      9648,
      53
    ],
    "tags": [
      "긴장감",
      "반전",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Adrián Doria",
      "Elvira",
      "Tomás Garrido"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1bS5Do7dmOzda4nSIUU4PAgDCgV.jpg",
    "posterAlt": "인비저블 게스트 포스터"
  },
  {
    "id": "movie_201",
    "title": "슈퍼 마리오 갤럭시",
    "genres": [
      "가족",
      "코미디",
      "모험"
    ],
    "genreIds": [
      10751,
      35,
      12,
      14,
      16
    ],
    "tags": [
      "감동",
      "유머",
      "캐릭터 매력",
      "세계관"
    ],
    "characters": [
      "Mario (voice)",
      "Princess Peach (voice)",
      "Luigi (voice)"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/knaXOBDBecVBWZVup3zXaOoy23v.jpg",
    "posterAlt": "슈퍼 마리오 갤럭시 포스터"
  },
  {
    "id": "movie_202",
    "title": "뒤바뀐 친구들의 신비한 모험",
    "genres": [
      "모험",
      "애니메이션",
      "가족"
    ],
    "genreIds": [
      12,
      16,
      10751,
      14
    ],
    "tags": [
      "영상미",
      "유머",
      "세계관",
      "감동"
    ],
    "characters": [
      "Ollie (voice)",
      "Ivy (voice)",
      "Boogle / Firewolf (voice)"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uv0iRQXDbtWHo1zPk3TZNo4Biti.jpg",
    "posterAlt": "뒤바뀐 친구들의 신비한 모험 포스터"
  },
  {
    "id": "movie_203",
    "title": "호퍼스",
    "genres": [
      "모험",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      12,
      16,
      35,
      10751,
      878
    ],
    "tags": [
      "영상미",
      "세계관",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Mabel (voice)",
      "King George (voice)",
      "Mayor Jerry Generazzo (voice)"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vJu9THzQ26Q5sWOVnhOkuRH5M1P.jpg",
    "posterAlt": "호퍼스 포스터"
  },
  {
    "id": "movie_204",
    "title": "극장판 귀멸의 칼날: 무한성편",
    "genres": [
      "애니메이션",
      "액션",
      "판타지"
    ],
    "genreIds": [
      16,
      28,
      14
    ],
    "tags": [
      "영상미",
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tanjiro Kamado (voice)",
      "Giyu Tomioka (voice)",
      "Akaza (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/m6Dho6hDCcL5KI8mOQNemZAedFI.jpg",
    "posterAlt": "극장판 귀멸의 칼날: 무한성편 포스터"
  },
  {
    "id": "movie_205",
    "title": "고트: 더 레전드",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751
    ],
    "tags": [
      "감동",
      "영상미",
      "세계관",
      "유머"
    ],
    "characters": [
      "Will Harris (voice)",
      "Jett Fillmore (voice)",
      "Lenny Williamson (voice)"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/otP94vckeMXAgQxzhcRkZSeSmYv.jpg",
    "posterAlt": "고트: 더 레전드 포스터"
  },
  {
    "id": "movie_206",
    "title": "주토피아 2",
    "genres": [
      "모험",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      12,
      16,
      35,
      10751,
      9648
    ],
    "tags": [
      "영상미",
      "유머",
      "세계관",
      "캐릭터 매력"
    ],
    "characters": [
      "Judy Hopps (voice)",
      "Nick Wilde (voice)",
      "Gary De'Snake (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ib6v6qUXzez1x2qIOLN7C0yJNPQ.jpg",
    "posterAlt": "주토피아 2 포스터"
  },
  {
    "id": "movie_207",
    "title": "너자 2",
    "genres": [
      "애니메이션",
      "액션",
      "판타지"
    ],
    "genreIds": [
      16,
      28,
      14,
      12
    ],
    "tags": [
      "액션",
      "영상미",
      "세계관",
      "몰입감"
    ],
    "characters": [
      "Young Nezha (voice)",
      "Youth Nezha / Jie Jie Shou Left (voice)",
      "Ao Bing (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tc3wdEEov3SdMja9ZkBiAZ6fBGV.jpg",
    "posterAlt": "너자 2 포스터"
  },
  {
    "id": "movie_208",
    "title": "케이팝 데몬 헌터스",
    "genres": [
      "판타지",
      "음악",
      "코미디"
    ],
    "genreIds": [
      14,
      10402,
      35,
      16
    ],
    "tags": [
      "액션",
      "감동",
      "감동적인 음악",
      "영상미"
    ],
    "characters": [
      "Rumi (voice)",
      "Mira (voice)",
      "Zoey (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5fqcLmrgVDicMuGLOa9PKErFP72.jpg",
    "posterAlt": "케이팝 데몬 헌터스 포스터"
  },
  {
    "id": "movie_209",
    "title": "센과 치히로의 행방불명",
    "genres": [
      "애니메이션",
      "가족",
      "판타지"
    ],
    "genreIds": [
      16,
      10751,
      14
    ],
    "tags": [
      "세계관",
      "영상미",
      "감동",
      "캐릭터 매력"
    ],
    "characters": [
      "Chihiro (voice)",
      "Haku (voice)",
      "Yubaba / Zeniba (voice)"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/u1L4qxIu5sC2P082uMHYt7Ifvnj.jpg",
    "posterAlt": "센과 치히로의 행방불명 포스터"
  },
  {
    "id": "movie_210",
    "title": "토이 스토리",
    "genres": [
      "가족",
      "코미디",
      "애니메이션"
    ],
    "genreIds": [
      10751,
      35,
      16,
      12
    ],
    "tags": [
      "감동",
      "영상미",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Woody (voice)",
      "Buzz Lightyear (voice)",
      "Mr. Potato Head (voice)"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iJbm78MxPjLutWUYixbeege8EVe.jpg",
    "posterAlt": "토이 스토리 포스터"
  },
  {
    "id": "movie_211",
    "title": "와일드 로봇",
    "genres": [
      "가족",
      "애니메이션",
      "SF"
    ],
    "genreIds": [
      10751,
      16,
      878,
      12
    ],
    "tags": [
      "감동",
      "캐릭터 매력",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Roz / Rummage (voice)",
      "Fink (voice)",
      "Brightbill (voice)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iA9NiygwSOBy8FjZjvdYOMxRUG0.jpg",
    "posterAlt": "와일드 로봇 포스터"
  },
  {
    "id": "movie_212",
    "title": "슈퍼 마리오 브라더스",
    "genres": [
      "가족",
      "코미디",
      "모험"
    ],
    "genreIds": [
      10751,
      35,
      12,
      14,
      16
    ],
    "tags": [
      "감동적인 음악",
      "영상미",
      "OST",
      "감동"
    ],
    "characters": [
      "Mario (voice)",
      "Princess Peach (voice)",
      "Luigi (voice)"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jt1GlLLvkWL2m83VX8I1qsDR187.jpg",
    "posterAlt": "슈퍼 마리오 브라더스 포스터"
  },
  {
    "id": "movie_213",
    "title": "라이온 킹",
    "genres": [
      "애니메이션",
      "가족",
      "드라마"
    ],
    "genreIds": [
      16,
      10751,
      18
    ],
    "tags": [
      "긴장감",
      "감동적인 음악",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Simba (voice)",
      "Nala (voice)",
      "Scar (voice)"
    ],
    "releaseYear": 1994,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9Y048zYw66TWvpUtsiNK0uReiVX.jpg",
    "posterAlt": "라이온 킹 포스터"
  },
  {
    "id": "movie_214",
    "title": "슈렉",
    "genres": [
      "애니메이션",
      "코미디",
      "판타지"
    ],
    "genreIds": [
      16,
      35,
      14,
      12,
      10751
    ],
    "tags": [
      "탄탄한 스토리",
      "연출",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Shrek / Blind Mouse (voice)",
      "Donkey (voice)",
      "Princess Fiona (voice)"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hABnmgdAU3u6Nu61b9GUGaOseVl.jpg",
    "posterAlt": "슈렉 포스터"
  },
  {
    "id": "movie_215",
    "title": "스파이더맨: 어크로스 더 유니버스",
    "genres": [
      "애니메이션",
      "액션",
      "모험"
    ],
    "genreIds": [
      16,
      28,
      12,
      878
    ],
    "tags": [
      "감동",
      "세계관",
      "영상미",
      "액션"
    ],
    "characters": [
      "Miles Morales (voice)",
      "Gwen Stacy (voice)",
      "Jeff Morales (voice)"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lMWTlGr9jVUC18T515hPRKym5QQ.jpg",
    "posterAlt": "스파이더맨: 어크로스 더 유니버스 포스터"
  },
  {
    "id": "movie_216",
    "title": "코렐라인: 비밀의 문",
    "genres": [
      "애니메이션",
      "가족",
      "판타지"
    ],
    "genreIds": [
      16,
      10751,
      14
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Coraline Jones (voice)",
      "Mel Jones / Other Mother (voice)",
      "Miss April Spink / Other Spink (voice)"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iGp4wBc0ZBVFd2HPicyDgl6Pn1r.jpg",
    "posterAlt": "코렐라인: 비밀의 문 포스터"
  },
  {
    "id": "movie_217",
    "title": "극장판 주술회전: 시부야사변 X 사멸회유",
    "genres": [
      "애니메이션",
      "액션",
      "판타지"
    ],
    "genreIds": [
      16,
      28,
      14
    ],
    "tags": [
      "영상미",
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Yuji Itadori (voice)",
      "Yuta Okkotsu (voice)",
      "Naoya Zen'in (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ifK2v7oQQrgqrmDu7sr1TgoAPT9.jpg",
    "posterAlt": "극장판 주술회전: 시부야사변 X 사멸회유 포스터"
  },
  {
    "id": "movie_218",
    "title": "모아나 2",
    "genres": [
      "모험",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      12,
      16,
      35,
      10751,
      14
    ],
    "tags": [
      "감동",
      "감동적인 음악",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Moana (voice)",
      "Maui (voice)",
      "Moni (voice)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hwmwTFtMbzxAWbIOp1RyyiOCyx0.jpg",
    "posterAlt": "모아나 2 포스터"
  },
  {
    "id": "movie_219",
    "title": "인사이드 아웃 2",
    "genres": [
      "애니메이션",
      "모험",
      "코미디"
    ],
    "genreIds": [
      16,
      12,
      35,
      10751
    ],
    "tags": [
      "영상미",
      "세계관",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Joy (voice)",
      "Anxiety (voice)",
      "Riley (voice)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/x2BHx02jMbvpKjMvbf8XxJkYwHJ.jpg",
    "posterAlt": "인사이드 아웃 2 포스터"
  },
  {
    "id": "movie_220",
    "title": "극장판 체인소 맨:  레제편",
    "genres": [
      "애니메이션",
      "액션",
      "로맨스"
    ],
    "genreIds": [
      16,
      28,
      10749,
      14
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Denji (voice)",
      "Makima (voice)",
      "Reze (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oTn0PoR8gSMpMqJaT2pUtkkN0Ia.jpg",
    "posterAlt": "극장판 체인소 맨:  레제편 포스터"
  },
  {
    "id": "movie_221",
    "title": "코코",
    "genres": [
      "가족",
      "애니메이션",
      "음악"
    ],
    "genreIds": [
      10751,
      16,
      10402,
      12
    ],
    "tags": [
      "긴장감",
      "여운",
      "감동",
      "감동적인 음악"
    ],
    "characters": [
      "Miguel Rivera (voice)",
      "Héctor (voice)",
      "Ernesto de la Cruz (voice)"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pQu93NuwR90AaCULzglVD5Ge4Ml.jpg",
    "posterAlt": "코코 포스터"
  },
  {
    "id": "movie_222",
    "title": "토이 스토리 2",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751
    ],
    "tags": [
      "감동",
      "유머",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Woody (voice)",
      "Buzz Lightyear (voice)",
      "Jessie (voice)"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/gXUNsdIIn6NiEBvh8Mq6gjgVPm0.jpg",
    "posterAlt": "토이 스토리 2 포스터"
  },
  {
    "id": "movie_223",
    "title": "주토피아",
    "genres": [
      "애니메이션",
      "모험",
      "가족"
    ],
    "genreIds": [
      16,
      12,
      10751,
      35
    ],
    "tags": [
      "유머",
      "영상미",
      "세계관",
      "감동"
    ],
    "characters": [
      "Judy Hopps (voice)",
      "Nick Wilde (voice)",
      "Chief Bogo (voice)"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uitqZVbhvlQV5iLOdbk3itGoNNd.jpg",
    "posterAlt": "주토피아 포스터"
  },
  {
    "id": "movie_224",
    "title": "다윗",
    "genres": [
      "애니메이션",
      "드라마",
      "가족"
    ],
    "genreIds": [
      16,
      18,
      10751,
      36
    ],
    "tags": [
      "감동적인 음악",
      "영상미",
      "세계관",
      "배우들의 연기력"
    ],
    "characters": [
      "Young David (voice)",
      "Samuel (voice)",
      "Ozem (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tGmTssnoltCCZBY7ys4lYRTFYFj.jpg",
    "posterAlt": "다윗 포스터"
  },
  {
    "id": "movie_225",
    "title": "쿵푸팬더 4",
    "genres": [
      "액션",
      "모험",
      "애니메이션"
    ],
    "genreIds": [
      28,
      12,
      16,
      35,
      10751,
      14
    ],
    "tags": [
      "액션",
      "몰입감",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Po (voice)",
      "Zhen (voice)",
      "The Chameleon (voice)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fvtswV04JfLGxxrjxW4t4j8bPhx.jpg",
    "posterAlt": "쿵푸팬더 4 포스터"
  },
  {
    "id": "movie_226",
    "title": "스폰지밥 무비: 네모바지를 찾아서",
    "genres": [
      "모험",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      12,
      16,
      35,
      10751,
      14
    ],
    "tags": [
      "세계관",
      "영상미",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "SpongeBob SquarePants / Gary / Morning DJ (voice)",
      "Mr. Krabs / Pirate / Narrator",
      "Squidward Tentacles (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2QCGC4toQXYuIsWKj5vJQRAdPjd.jpg",
    "posterAlt": "스폰지밥 무비: 네모바지를 찾아서 포스터"
  },
  {
    "id": "movie_227",
    "title": "몬스터 주식회사",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      14
    ],
    "tags": [
      "감동",
      "세계관",
      "영상미",
      "유머"
    ],
    "characters": [
      "Sullivan (voice)",
      "Mike (voice)",
      "Boo (voice)"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fnDLrtEoIrxTCWUvuurMzOzQGpQ.jpg",
    "posterAlt": "몬스터 주식회사 포스터"
  },
  {
    "id": "movie_228",
    "title": "하울의 움직이는 성",
    "genres": [
      "판타지",
      "애니메이션",
      "모험"
    ],
    "genreIds": [
      14,
      16,
      12
    ],
    "tags": [
      "여운",
      "감동",
      "세계관",
      "영상미"
    ],
    "characters": [
      "Sophie (voice)",
      "Howl (voice)",
      "Witch of the Waste (voice)"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xiz6TiSduvR1U3VLfWVlBEdT9fO.jpg",
    "posterAlt": "하울의 움직이는 성 포스터"
  },
  {
    "id": "movie_229",
    "title": "슈퍼배드 4",
    "genres": [
      "액션",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      28,
      16,
      35,
      10751,
      878
    ],
    "tags": [
      "액션",
      "몰입감",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Gru (voice)",
      "Lucy (voice)",
      "Maxime (voice)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vZmCFVff9JySHTUp9zbYUIAcxzc.jpg",
    "posterAlt": "슈퍼배드 4 포스터"
  },
  {
    "id": "movie_230",
    "title": "인사이드 아웃",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "genreIds": [
      16,
      10751,
      12,
      18,
      35
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
    "id": "movie_231",
    "title": "빅 히어로",
    "genres": [
      "모험",
      "가족",
      "애니메이션"
    ],
    "genreIds": [
      12,
      10751,
      16,
      28,
      35
    ],
    "tags": [
      "액션",
      "감동",
      "영상미",
      "캐릭터 매력"
    ],
    "characters": [
      "Baymax (voice)",
      "Hiro Hamada (voice)",
      "Tadashi Hamada (voice)"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/gLabmTVZpNOGa8LEiMvTi9hJPDe.jpg",
    "posterAlt": "빅 히어로 포스터"
  },
  {
    "id": "movie_232",
    "title": "쿵푸팬더",
    "genres": [
      "액션",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      28,
      16,
      35,
      10751
    ],
    "tags": [
      "액션",
      "몰입감",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Po (voice)",
      "Master Shifu (voice)",
      "Tigress (voice)"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/c3Dzd3A3QE0LkKb5HMOHTzs2Fyg.jpg",
    "posterAlt": "쿵푸팬더 포스터"
  },
  {
    "id": "movie_233",
    "title": "토이 스토리 4",
    "genres": [
      "가족",
      "코미디",
      "애니메이션"
    ],
    "genreIds": [
      10751,
      35,
      16,
      12
    ],
    "tags": [
      "감동",
      "유머",
      "캐릭터 매력",
      "영상미"
    ],
    "characters": [
      "Woody (voice)",
      "Buzz Lightyear (voice)",
      "Bo Peep (voice)"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9P8IX4UyH3QFLL4MV6GZyuOB7Ue.jpg",
    "posterAlt": "토이 스토리 4 포스터"
  },
  {
    "id": "movie_234",
    "title": "니모를 찾아서",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "genreIds": [
      16,
      10751,
      12
    ],
    "tags": [
      "여운",
      "영상미",
      "세계관",
      "감동"
    ],
    "characters": [
      "Marlin (voice)",
      "Dory (voice)",
      "Nemo (voice)"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9ViCYfZ0whpwtKbM2WJP5PfsG2x.jpg",
    "posterAlt": "니모를 찾아서 포스터"
  },
  {
    "id": "movie_235",
    "title": "라따뚜이",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      14
    ],
    "tags": [
      "감동",
      "영상미",
      "세계관",
      "유머"
    ],
    "characters": [
      "Remy (voice)",
      "Skinner (voice)",
      "Linguini (voice)"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zFah4LNeWw68y7RRGi20CQlGByY.jpg",
    "posterAlt": "라따뚜이 포스터"
  },
  {
    "id": "movie_236",
    "title": "아이스 에이지",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      12
    ],
    "tags": [
      "탄탄한 스토리",
      "영상미",
      "세계관",
      "유머"
    ],
    "characters": [
      "Manfred 'Manny' (voice)",
      "Sid (voice)",
      "Diego (voice)"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/biwqSbuyxjrZMvVcb8Lsv3GyQbw.jpg",
    "posterAlt": "아이스 에이지 포스터"
  },
  {
    "id": "movie_237",
    "title": "장화신은 고양이: 끝내주는 모험",
    "genres": [
      "애니메이션",
      "모험",
      "판타지"
    ],
    "genreIds": [
      16,
      12,
      14,
      35,
      10751
    ],
    "tags": [
      "영상미",
      "세계관",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Puss in Boots (voice)",
      "Kitty Softpaws (voice)",
      "Perrito (voice)"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rKgvctIuPXyuqOzCQ16VGdnHxKx.jpg",
    "posterAlt": "장화신은 고양이: 끝내주는 모험 포스터"
  },
  {
    "id": "movie_238",
    "title": "메리다와 마법의 숲",
    "genres": [
      "모험",
      "애니메이션",
      "가족"
    ],
    "genreIds": [
      12,
      16,
      10751,
      14
    ],
    "tags": [
      "연출",
      "영상미",
      "세계관",
      "감동"
    ],
    "characters": [
      "Merida (voice)",
      "Elinor (voice)",
      "Fergus (voice)"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uzVUEQ6PPGGsETviLwVKSzS8OUG.jpg",
    "posterAlt": "메리다와 마법의 숲 포스터"
  },
  {
    "id": "movie_239",
    "title": "모노노케 히메",
    "genres": [
      "모험",
      "판타지",
      "애니메이션"
    ],
    "genreIds": [
      12,
      14,
      16
    ],
    "tags": [
      "액션",
      "감동",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Ashitaka (voice)",
      "San / Kaya (voice)",
      "Eboshi Gozen (voice)"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lLftgg4iFyDwuodra3Isr41y2Lq.jpg",
    "posterAlt": "모노노케 히메 포스터"
  },
  {
    "id": "movie_240",
    "title": "업",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      12
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "영상미",
      "세계관"
    ],
    "characters": [
      "Carl Fredricksen (voice)",
      "Charles Muntz (voice)",
      "Russell (voice)"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lL2WzkjLZP0RkPgUhybBjb9x9SL.jpg",
    "posterAlt": "업 포스터"
  },
  {
    "id": "movie_241",
    "title": "나 혼자만 레벨업 -리어웨이크닝-",
    "genres": [
      "액션",
      "모험",
      "판타지"
    ],
    "genreIds": [
      28,
      12,
      14,
      16
    ],
    "tags": [
      "탄탄한 스토리",
      "액션",
      "몰입감",
      "세계관"
    ],
    "characters": [
      "Shun Mizushino (voice) (archive footage)",
      "Kenta Morobishi (voice) (archive footage)",
      "Aoi Mizushino (voice) (archive footage)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vOONcAbFSVCOgct9k4JJPLbPvOi.jpg",
    "posterAlt": "나 혼자만 레벨업 -리어웨이크닝- 포스터"
  },
  {
    "id": "movie_242",
    "title": "보글보글 스폰지밥",
    "genres": [
      "모험",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      12,
      16,
      35,
      10751,
      14
    ],
    "tags": [
      "액션",
      "영상미",
      "세계관",
      "유머"
    ],
    "characters": [
      "SpongeBob / Narrator / Gary /  Various (voice)",
      "Mr. Krabs (voice)",
      "Squidward / Fish #4 (voice)"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/A2G5gYXMwg10sKpRUTq371TooVu.jpg",
    "posterAlt": "보글보글 스폰지밥 포스터"
  },
  {
    "id": "movie_243",
    "title": "라푼젤",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "genreIds": [
      16,
      10751,
      12
    ],
    "tags": [
      "감동",
      "감동적인 음악",
      "영상미",
      "OST"
    ],
    "characters": [
      "Rapunzel (voice)",
      "Flynn Rider (voice)",
      "Mother Gothel (voice)"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sT1vLH38iaezVgoFqmaiihbnTUy.jpg",
    "posterAlt": "라푼젤 포스터"
  },
  {
    "id": "movie_244",
    "title": "슈퍼배드",
    "genres": [
      "애니메이션",
      "코미디",
      "범죄"
    ],
    "genreIds": [
      16,
      35,
      80,
      10751,
      878
    ],
    "tags": [
      "영상미",
      "유머",
      "세계관",
      "캐릭터 매력"
    ],
    "characters": [
      "Gru (voice)",
      "Vector (voice)",
      "Margo (voice)"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/avyPqGBGeeGsx4c89sIIDcfggjR.jpg",
    "posterAlt": "슈퍼배드 포스터"
  },
  {
    "id": "movie_245",
    "title": "배드 가이즈 2",
    "genres": [
      "가족",
      "코미디",
      "범죄"
    ],
    "genreIds": [
      10751,
      35,
      80,
      12,
      16
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "감동",
      "캐릭터 매력"
    ],
    "characters": [
      "Wolf (voice)",
      "Snake (voice)",
      "Tarantula (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1oG69MtmZGovhho0pPgRY9d1qrU.jpg",
    "posterAlt": "배드 가이즈 2 포스터"
  },
  {
    "id": "movie_246",
    "title": "겨울왕국",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "genreIds": [
      16,
      10751,
      12,
      14
    ],
    "tags": [
      "반전",
      "여운",
      "감동",
      "감동적인 음악"
    ],
    "characters": [
      "Elsa (voice)",
      "Anna (voice)",
      "Kristoff (voice)"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lYceQKe3EsYn7VdDXGTy7dSwBLp.jpg",
    "posterAlt": "겨울왕국 포스터"
  },
  {
    "id": "movie_247",
    "title": "인크레더블",
    "genres": [
      "액션",
      "모험",
      "애니메이션"
    ],
    "genreIds": [
      28,
      12,
      16,
      10751
    ],
    "tags": [
      "감동",
      "액션",
      "몰입감",
      "영상미"
    ],
    "characters": [
      "Bob Parr / Mr. Incredible (voice)",
      "Helen Parr / Elastigirl (voice)",
      "Violet Parr (voice)"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/11Byg6rHkKIvSehlW3R4pcUj8J.jpg",
    "posterAlt": "인크레더블 포스터"
  },
  {
    "id": "movie_248",
    "title": "플로우",
    "genres": [
      "모험",
      "애니메이션",
      "가족"
    ],
    "genreIds": [
      12,
      16,
      10751,
      14
    ],
    "tags": [
      "영상미",
      "몰입감",
      "세계관",
      "감동"
    ],
    "characters": [],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iEDrRE5TWjKrWO2MtkCBR5aH7pT.jpg",
    "posterAlt": "플로우 포스터"
  },
  {
    "id": "movie_249",
    "title": "뮬란",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "genreIds": [
      16,
      10751,
      12
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "영상미",
      "유머"
    ],
    "characters": [
      "Mulan (voice)",
      "Mushu (voice)",
      "Shang (voice)"
    ],
    "releaseYear": 1998,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zlh3FTTu0Q6aEhUKrTByfBuS7iW.jpg",
    "posterAlt": "뮬란 포스터"
  },
  {
    "id": "movie_250",
    "title": "무파사: 라이온 킹",
    "genres": [
      "모험",
      "가족",
      "애니메이션"
    ],
    "genreIds": [
      12,
      10751,
      16
    ],
    "tags": [
      "액션",
      "반전",
      "감동",
      "감동적인 음악"
    ],
    "characters": [
      "Mufasa (voice)",
      "Taka (voice)",
      "Sarabi (voice)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1VUExee8iFohFTwYVi4IOArYyaM.jpg",
    "posterAlt": "무파사: 라이온 킹 포스터"
  },
  {
    "id": "movie_251",
    "title": "톰 클랜시의 잭 라이언: 고스트 워",
    "genres": [
      "액션",
      "스릴러"
    ],
    "genreIds": [
      28,
      53
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Jack Ryan",
      "James Greer",
      "Emma Marlowe"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3PufRWSVgSVwIr9M5YOmx4gu5Fu.jpg",
    "posterAlt": "톰 클랜시의 잭 라이언: 고스트 워 포스터"
  },
  {
    "id": "movie_252",
    "title": "퍼니셔 원 라스트 킬",
    "genres": [
      "액션",
      "드라마",
      "범죄"
    ],
    "genreIds": [
      28,
      18,
      80
    ],
    "tags": [
      "긴장감",
      "감동",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Frank Castle",
      "Karen Page",
      "Curtis Hoyle"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dfKKipbQswChklXaaVTh6FP3oaJ.jpg",
    "posterAlt": "퍼니셔 원 라스트 킬 포스터"
  },
  {
    "id": "movie_253",
    "title": "만달로리안과 그로구",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "액션",
      "몰입감"
    ],
    "characters": [
      "The Mandalorian",
      "Rotta (voice)",
      "Colonel Ward"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tMP99wq45GQMoeZwITgjAS8Wihm.jpg",
    "posterAlt": "만달로리안과 그로구 포스터"
  },
  {
    "id": "movie_254",
    "title": "포풍추영",
    "genres": [
      "액션",
      "범죄",
      "드라마"
    ],
    "genreIds": [
      28,
      80,
      18,
      53
    ],
    "tags": [
      "액션",
      "반전",
      "감동",
      "몰입감"
    ],
    "characters": [
      "Wong Tak Chung",
      "He Qiuguo",
      "Fu Longsheng"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uiIT7CsJ4V7rMnTqy7xYvj9IRhs.jpg",
    "posterAlt": "포풍추영 포스터"
  },
  {
    "id": "movie_255",
    "title": "모탈 컴뱃",
    "genres": [
      "액션",
      "판타지",
      "모험"
    ],
    "genreIds": [
      28,
      14,
      12
    ],
    "tags": [
      "액션",
      "세계관",
      "몰입감",
      "영상미"
    ],
    "characters": [
      "Cole Young",
      "Sonya Blade",
      "Jax"
    ],
    "releaseYear": 2021,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3dTg1pgasstOa0XJTwt3dBFHjFf.jpg",
    "posterAlt": "모탈 컴뱃 포스터"
  },
  {
    "id": "movie_256",
    "title": "정점",
    "genres": [
      "액션",
      "스릴러"
    ],
    "genreIds": [
      28,
      53
    ],
    "tags": [
      "몰입감",
      "액션",
      "긴장감"
    ],
    "characters": [
      "Sasha",
      "Ben",
      "Tommy"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/wGHGVAJGTn2BqsuFfPK8lzPiKjH.jpg",
    "posterAlt": "정점 포스터"
  },
  {
    "id": "movie_257",
    "title": "모탈 컴뱃 2",
    "genres": [
      "액션",
      "판타지",
      "모험"
    ],
    "genreIds": [
      28,
      14,
      12
    ],
    "tags": [
      "액션",
      "배우들의 연기력",
      "몰입감",
      "세계관"
    ],
    "characters": [
      "Johnny Cage",
      "Kitana",
      "Sonya Blade"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1NgBKiPrJzv1VHdEN8brdy59Rxo.jpg",
    "posterAlt": "모탈 컴뱃 2 포스터"
  },
  {
    "id": "movie_258",
    "title": "두란다르",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "몰입감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Hamza Ali Mazari / Jaskirat Singh Rangi",
      "Rehman Dakait",
      "Ajay Sanyal"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8FHOtUpNIk5ZPEay2N2EY5lrxkv.jpg",
    "posterAlt": "두란다르 포스터"
  },
  {
    "id": "movie_259",
    "title": "리얼 스틸",
    "genres": [
      "액션",
      "SF",
      "드라마"
    ],
    "genreIds": [
      28,
      878,
      18
    ],
    "tags": [
      "액션",
      "몰입감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Charlie Kenton",
      "Max Kenton",
      "Bailey Tallet"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lbN080kn6nzq978jqsdgxci9llR.jpg",
    "posterAlt": "리얼 스틸 포스터"
  },
  {
    "id": "movie_260",
    "title": "쉘터",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Mason",
      "Jesse",
      "Roberta"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tS3UZlVfESO4z8inIZXGiHNgDfE.jpg",
    "posterAlt": "쉘터 포스터"
  },
  {
    "id": "movie_261",
    "title": "프레데터: 죽음의 땅",
    "genres": [
      "액션",
      "SF",
      "모험"
    ],
    "genreIds": [
      28,
      878,
      12
    ],
    "tags": [
      "감동적인 음악",
      "세계관",
      "OST",
      "몰입감"
    ],
    "characters": [
      "Thia / Tessa",
      "Dek / Father",
      "Bud"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8lpCbwbYh9SSzCFsHDndZHKrcD4.jpg",
    "posterAlt": "프레데터: 죽음의 땅 포스터"
  },
  {
    "id": "movie_262",
    "title": "친애하는 나의 킬러",
    "genres": [
      "액션",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      28,
      18,
      10749
    ],
    "tags": [
      "액션",
      "몰입감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Lhan",
      "Pran",
      "M"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/70bLedAueeJXOEVqXnNToj8zLvy.jpg",
    "posterAlt": "친애하는 나의 킬러 포스터"
  },
  {
    "id": "movie_263",
    "title": "어벤져스: 인피니티 워",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tony Stark / Iron Man",
      "Steve Rogers / Captain America",
      "Thor"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kmP6viwzcEkZeoi1LaVcQemcvZh.jpg",
    "posterAlt": "어벤져스: 인피니티 워 포스터"
  },
  {
    "id": "movie_264",
    "title": "아포칼립토",
    "genres": [
      "액션",
      "드라마",
      "역사"
    ],
    "genreIds": [
      28,
      18,
      36
    ],
    "tags": [
      "탄탄한 스토리",
      "액션",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Jaguar Paw",
      "Zero Wolf",
      "Middle Eye"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mAFf4oW3XiH4IlFJw6dgwNnEPhg.jpg",
    "posterAlt": "아포칼립토 포스터"
  },
  {
    "id": "movie_265",
    "title": "워 머신: 전쟁 기계",
    "genres": [
      "액션",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      28,
      878,
      53
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "81",
      "Army Sgt Maj Sheridan",
      "7"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cfeIYPthWgq5XFZnx7cbpr7xFTp.jpg",
    "posterAlt": "워 머신: 전쟁 기계 포스터"
  },
  {
    "id": "movie_266",
    "title": "복수",
    "genres": [
      "액션",
      "스릴러"
    ],
    "genreIds": [
      28,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "반전",
      "몰입감"
    ],
    "characters": [
      "Carlos Estrada",
      "Miguel Díaz",
      "Cnel. Gabriela Rangel"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/26milocWotfItrjwnadk4gyHwyi.jpg",
    "posterAlt": "복수 포스터"
  },
  {
    "id": "movie_267",
    "title": "F1 더 무비",
    "genres": [
      "액션",
      "드라마"
    ],
    "genreIds": [
      28,
      18
    ],
    "tags": [
      "액션",
      "몰입감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Sonny Hayes",
      "Joshua Pearce",
      "Ruben Cervantes"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/bvVoP1t2gNvmE9ccSrqR1zcGHGM.jpg",
    "posterAlt": "F1 더 무비 포스터"
  },
  {
    "id": "movie_268",
    "title": "데이 윌 킬 유",
    "genres": [
      "액션",
      "코미디",
      "공포"
    ],
    "genreIds": [
      28,
      35,
      27
    ],
    "tags": [
      "액션",
      "몰입감",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Asia Reaves",
      "Maria Reaves",
      "Lily Woodhouse"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6oI4oQKTWMVUlr8Ivqydp28Ruu6.jpg",
    "posterAlt": "데이 윌 킬 유 포스터"
  },
  {
    "id": "movie_269",
    "title": "스파이더맨: 노 웨이 홈",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "세계관",
      "몰입감"
    ],
    "characters": [
      "Peter Parker / Spider-Man",
      "MJ",
      "Doctor Strange"
    ],
    "releaseYear": 2021,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fvqoI9r1GU2EFkc0xjZ6dKCuDVR.jpg",
    "posterAlt": "스파이더맨: 노 웨이 홈 포스터"
  },
  {
    "id": "movie_270",
    "title": "데드풀과 울버린",
    "genres": [
      "액션",
      "코미디",
      "SF"
    ],
    "genreIds": [
      28,
      35,
      878
    ],
    "tags": [
      "액션",
      "몰입감",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Wade Wilson / Deadpool / Nicepool",
      "Logan / Wolverine",
      "Cassandra Nova"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dsfAcQ5J7TPOpJgcX8R1lRBqiMK.jpg",
    "posterAlt": "데드풀과 울버린 포스터"
  },
  {
    "id": "movie_271",
    "title": "월드브레이커",
    "genres": [
      "SF",
      "액션",
      "공포"
    ],
    "genreIds": [
      878,
      28,
      27
    ],
    "tags": [
      "감동",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Willa",
      "Dad",
      "Mom"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nWHx1vchbmLU3HTEJSAiBgpWPqn.jpg",
    "posterAlt": "월드브레이커 포스터"
  },
  {
    "id": "movie_272",
    "title": "프로텍터",
    "genres": [
      "액션",
      "스릴러"
    ],
    "genreIds": [
      28,
      53
    ],
    "tags": [
      "액션",
      "세계관",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Nikki Halstead",
      "Colonel Joseph Lavelle",
      "Chloe Halstead"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kJvFZt7x3VWOtMQwANwXGD59ArJ.jpg",
    "posterAlt": "프로텍터 포스터"
  },
  {
    "id": "movie_273",
    "title": "사망유희",
    "genres": [
      "드라마",
      "액션",
      "스릴러"
    ],
    "genreIds": [
      18,
      28,
      53
    ],
    "tags": [
      "액션",
      "배우들의 연기력",
      "감동",
      "몰입감"
    ],
    "characters": [
      "Billy Lo",
      "Jim Marshall",
      "Dr. Land"
    ],
    "releaseYear": 1978,
    "posterUrl": "https://image.tmdb.org/t/p/w780/skPlqRoNG7bfV6ABoE8KLFr6j0P.jpg",
    "posterAlt": "사망유희 포스터"
  },
  {
    "id": "movie_274",
    "title": "더 레킹 크루",
    "genres": [
      "액션",
      "코미디",
      "범죄"
    ],
    "genreIds": [
      28,
      35,
      80,
      9648
    ],
    "tags": [
      "액션",
      "감동",
      "몰입감",
      "유머"
    ],
    "characters": [
      "James Hale",
      "Jonny Hale",
      "Governor Peter Mahoe"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/bG8BPNRoOvTC9wIos7DIH1YWOqN.jpg",
    "posterAlt": "더 레킹 크루 포스터"
  },
  {
    "id": "movie_275",
    "title": "씨너스: 죄인들",
    "genres": [
      "공포",
      "액션",
      "스릴러"
    ],
    "genreIds": [
      27,
      28,
      53
    ],
    "tags": [
      "감동적인 음악",
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Smoke / Stack",
      "Mary",
      "Sammie Moore"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qEipksU5SzHxbeZbE0cZQzEt6bD.jpg",
    "posterAlt": "씨너스: 죄인들 포스터"
  },
  {
    "id": "movie_276",
    "title": "쥬라기 월드: 새로운 시작",
    "genres": [
      "SF",
      "모험",
      "액션"
    ],
    "genreIds": [
      878,
      12,
      28
    ],
    "tags": [
      "감동",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Zora Bennett",
      "Duncan Kincaid",
      "Dr. Henry Loomis"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ygr4hE8Qpagv8sxZbMw1mtYkcQE.jpg",
    "posterAlt": "쥬라기 월드: 새로운 시작 포스터"
  },
  {
    "id": "movie_277",
    "title": "엘리베이션",
    "genres": [
      "액션",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      28,
      878,
      53
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Will",
      "Nina",
      "Katie"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tnfc0NJ3BzhJrGJhkkEd6MHBdq5.jpg",
    "posterAlt": "엘리베이션 포스터"
  },
  {
    "id": "movie_278",
    "title": "어벤져스: 엔드게임",
    "genres": [
      "모험",
      "SF",
      "액션"
    ],
    "genreIds": [
      12,
      878,
      28
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tony Stark / Iron Man",
      "Steve Rogers / Captain America",
      "Bruce Banner / Hulk"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/z7ilT5rNN9kDo8JZmgyhM6ej2xv.jpg",
    "posterAlt": "어벤져스: 엔드게임 포스터"
  },
  {
    "id": "movie_279",
    "title": "슈퍼맨",
    "genres": [
      "SF",
      "모험",
      "액션"
    ],
    "genreIds": [
      878,
      12,
      28
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동",
      "세계관"
    ],
    "characters": [
      "Superman",
      "Lois Lane",
      "Lex Luthor"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kCXGCEsDqjzWJVDyHgBUg0AMetT.jpg",
    "posterAlt": "슈퍼맨 포스터"
  },
  {
    "id": "movie_280",
    "title": "더 립",
    "genres": [
      "액션",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      28,
      53,
      80
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "액션"
    ],
    "characters": [
      "Lieutenant Dane Dumars",
      "Detective Sergeant J.D. Byrne",
      "Detective Numa Baptistie"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/o0d6Us9VWOW0nHhoB7ZNIwigARG.jpg",
    "posterAlt": "더 립 포스터"
  },
  {
    "id": "movie_281",
    "title": "미션 임파서블: 파이널 레코닝",
    "genres": [
      "액션",
      "스릴러",
      "모험"
    ],
    "genreIds": [
      28,
      53,
      12
    ],
    "tags": [
      "탄탄한 스토리",
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Ethan Hunt",
      "Grace",
      "Luther Stickell"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/c5pDU8SW0ZbmO5jHfw7fX6keyyR.jpg",
    "posterAlt": "미션 임파서블: 파이널 레코닝 포스터"
  },
  {
    "id": "movie_282",
    "title": "볼스 업",
    "genres": [
      "코미디",
      "액션",
      "모험"
    ],
    "genreIds": [
      35,
      28,
      12
    ],
    "tags": [
      "세계관",
      "유머",
      "캐릭터 매력",
      "액션"
    ],
    "characters": [
      "Brad",
      "Elijah",
      "Pavio Curto"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jntqR2lt6rV1e8e5lXJXadkcsti.jpg",
    "posterAlt": "볼스 업 포스터"
  },
  {
    "id": "movie_283",
    "title": "아이언맨 2",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tony Stark",
      "Pepper Potts",
      "Lt. Col. James 'Rhodey' Rhodes"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ebJbC9OYAZJxy7bRUGryR72hfa2.jpg",
    "posterAlt": "아이언맨 2 포스터"
  },
  {
    "id": "movie_284",
    "title": "스파이더맨: 홈커밍",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Peter Parker / Spider-Man",
      "Adrian Toomes / Vulture",
      "Tony Stark / Iron Man"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hjki9weYYVABvkpZbX5jBOmKXXv.jpg",
    "posterAlt": "스파이더맨: 홈커밍 포스터"
  },
  {
    "id": "movie_285",
    "title": "트리플 엑스",
    "genres": [
      "액션",
      "모험",
      "스릴러"
    ],
    "genreIds": [
      28,
      12,
      53,
      80,
      18
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Xander Cage",
      "Yelena",
      "Yorgi"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ysmsesGYF83VZXSvkG8ZdNNCKAz.jpg",
    "posterAlt": "트리플 엑스 포스터"
  },
  {
    "id": "movie_286",
    "title": "워킹맨",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "탄탄한 스토리",
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Levon Cade",
      "Wolo Kolisnyk",
      "Yuri"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pPokyKVPve6HNSgVliOlrMwU1lM.jpg",
    "posterAlt": "워킹맨 포스터"
  },
  {
    "id": "movie_287",
    "title": "스파이더맨",
    "genres": [
      "액션",
      "SF"
    ],
    "genreIds": [
      28,
      878
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Spider-Man / Peter Parker",
      "Green Goblin / Norman Osborn",
      "Mary Jane Watson"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4xOhtzXGt0if74dTmS4qtizFelX.jpg",
    "posterAlt": "스파이더맨 포스터"
  },
  {
    "id": "movie_288",
    "title": "캐리비안의 해적: 블랙펄의 저주",
    "genres": [
      "모험",
      "판타지",
      "액션"
    ],
    "genreIds": [
      12,
      14,
      28
    ],
    "tags": [
      "세계관",
      "영상미",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Jack Sparrow",
      "Barbossa",
      "Will Turner"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3ovejwQO4fKOWx4VgGBJeT8CKCn.jpg",
    "posterAlt": "캐리비안의 해적: 블랙펄의 저주 포스터"
  },
  {
    "id": "movie_289",
    "title": "스타워즈 에피소드 4: 새로운 희망",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Luke Skywalker",
      "Han Solo",
      "Princess Leia Organa"
    ],
    "releaseYear": 1977,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7XFfURIFCJxN1mfBg0SAjk5yGzg.jpg",
    "posterAlt": "스타워즈 에피소드 4: 새로운 희망 포스터"
  },
  {
    "id": "movie_290",
    "title": "수퍼 소닉 3",
    "genres": [
      "액션",
      "SF",
      "코미디"
    ],
    "genreIds": [
      28,
      878,
      35,
      10751
    ],
    "tags": [
      "액션",
      "감동",
      "영상미",
      "몰입감"
    ],
    "characters": [
      "Ivo Robotnik / Gerald Robotnik",
      "Sonic (voice)",
      "Shadow (voice)"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4784u4fHwcvc4owOGylVpP7JaKQ.jpg",
    "posterAlt": "수퍼 소닉 3 포스터"
  },
  {
    "id": "movie_291",
    "title": "아바타: 물의 길",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "감동",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Jake Sully",
      "Neytiri",
      "Kiri"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/u2aVXft5GLBQnjzWVNda7sdDpdu.jpg",
    "posterAlt": "아바타: 물의 길 포스터"
  },
  {
    "id": "movie_292",
    "title": "드래곤 길들이기",
    "genres": [
      "판타지",
      "가족",
      "액션"
    ],
    "genreIds": [
      14,
      10751,
      28,
      12
    ],
    "tags": [
      "액션",
      "세계관",
      "영상미",
      "감동"
    ],
    "characters": [
      "Hiccup",
      "Astrid",
      "Stoick"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/frXkpt1dLKO3iDbmBsjQUKseLiS.jpg",
    "posterAlt": "드래곤 길들이기 포스터"
  },
  {
    "id": "movie_293",
    "title": "캐리비안의 해적: 망자의 함",
    "genres": [
      "모험",
      "판타지",
      "액션"
    ],
    "genreIds": [
      12,
      14,
      28
    ],
    "tags": [
      "액션",
      "세계관",
      "영상미",
      "몰입감"
    ],
    "characters": [
      "Jack Sparrow",
      "Will Turner",
      "Elizabeth Swann"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6tD4oT7C01aZLVfoZDz5VFVbJCi.jpg",
    "posterAlt": "캐리비안의 해적: 망자의 함 포스터"
  },
  {
    "id": "movie_294",
    "title": "월드워 Z",
    "genres": [
      "액션",
      "공포",
      "SF"
    ],
    "genreIds": [
      28,
      27,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Gerry Lane",
      "Karen Lane",
      "Segen"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cnUlKvIXbTmDnyp6pIGIMgdl332.jpg",
    "posterAlt": "월드워 Z 포스터"
  },
  {
    "id": "movie_295",
    "title": "미이라",
    "genres": [
      "모험",
      "액션",
      "판타지"
    ],
    "genreIds": [
      12,
      28,
      14
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감",
      "세계관"
    ],
    "characters": [
      "Rick O'Connell",
      "Evelyn Carnahan",
      "Jonathan Carnahan"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/31lxBgDl51HYnAnIV41aPyK4em7.jpg",
    "posterAlt": "미이라 포스터"
  },
  {
    "id": "movie_296",
    "title": "스파이더맨: 파 프롬 홈",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Peter Parker / Spider-Man",
      "Quentin Beck / Mysterio",
      "Nick Fury"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3YewJtji80oIroeXUavNRZkeXfQ.jpg",
    "posterAlt": "스파이더맨: 파 프롬 홈 포스터"
  },
  {
    "id": "movie_297",
    "title": "더 러닝 맨",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      28,
      53,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "몰입감",
      "액션",
      "긴장감"
    ],
    "characters": [
      "Ben Richards",
      "Molie Jernigan",
      "Evan McCone"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/klfSEbFOquMFjBQJ5uKAfp0rrsK.jpg",
    "posterAlt": "더 러닝 맨 포스터"
  },
  {
    "id": "movie_298",
    "title": "트로이",
    "genres": [
      "전쟁",
      "액션",
      "역사"
    ],
    "genreIds": [
      10752,
      28,
      36
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "세계관",
      "OST"
    ],
    "characters": [
      "Achilles",
      "Paris",
      "Hector"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1TsdNMKodmOKyo4xPacxq7opo3p.jpg",
    "posterAlt": "트로이 포스터"
  },
  {
    "id": "movie_299",
    "title": "존 윅 4",
    "genres": [
      "액션",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      28,
      53,
      80
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "John Wick",
      "Caine",
      "Marquis"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/h3LsdSBzhRnBebz4BTpAhh63PD3.jpg",
    "posterAlt": "존 윅 4 포스터"
  },
  {
    "id": "movie_300",
    "title": "노 머시: 90분",
    "genres": [
      "SF",
      "액션",
      "스릴러"
    ],
    "genreIds": [
      878,
      28,
      53
    ],
    "tags": [
      "몰입감",
      "액션",
      "긴장감"
    ],
    "characters": [
      "Chris Raven",
      "Judge Maddox",
      "Jacqueline 'Jaq' Diallo"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fQ8Q3VAybCt6fHFJQD0kwd5azNL.jpg",
    "posterAlt": "노 머시: 90분 포스터"
  },
  {
    "id": "movie_301",
    "title": "옵세션",
    "genres": [
      "공포",
      "스릴러"
    ],
    "genreIds": [
      27,
      53
    ],
    "tags": [
      "유머",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Baron 'Bear' Bailey",
      "Nikki Freeman",
      "Ian"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cUnADM9fsYV69Fk0TkMp7xVLnKj.jpg",
    "posterAlt": "옵세션 포스터"
  },
  {
    "id": "movie_302",
    "title": "두란다르: 더 리벤지",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "액션",
      "반전",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Hamza Ali Mazari / Jaskirat Singh Rangi",
      "Major Iqbal",
      "Ajay Sanyal"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hsJG5r6etrMNwW00BVp4NC7zi67.jpg",
    "posterAlt": "두란다르: 더 리벤지 포스터"
  },
  {
    "id": "movie_303",
    "title": "인 더 그레이",
    "genres": [
      "액션",
      "스릴러"
    ],
    "genreIds": [
      28,
      53
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Sid",
      "Bronco",
      "Rachel WIld"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dQgIcW6Th08kMRf2HBoYWoFE6OD.jpg",
    "posterAlt": "인 더 그레이 포스터"
  },
  {
    "id": "movie_304",
    "title": "애딕티드",
    "genres": [
      "드라마",
      "스릴러"
    ],
    "genreIds": [
      18,
      53
    ],
    "tags": [
      "액션",
      "배우들의 연기력",
      "감동",
      "긴장감"
    ],
    "characters": [
      "Zoe Reynard",
      "Jason Reynard",
      "Balthazar Crayne"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fAERrD6vvmznDoL99wlgjhSfPcH.jpg",
    "posterAlt": "애딕티드 포스터"
  },
  {
    "id": "movie_305",
    "title": "하우스메이드",
    "genres": [
      "미스터리",
      "스릴러"
    ],
    "genreIds": [
      9648,
      53
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "몰입감"
    ],
    "characters": [
      "Millie Calloway",
      "Nina Winchester",
      "Andrew Winchester"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fUDX16A4fJXmAuUA5t0pnqzXS0b.jpg",
    "posterAlt": "하우스메이드 포스터"
  },
  {
    "id": "movie_306",
    "title": "그린랜드 2: 마이그레이션",
    "genres": [
      "모험",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      12,
      53,
      878
    ],
    "tags": [
      "감동",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "John Garrity",
      "Allison Garrity",
      "Nathan Garrity"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/63MYZJKDgg1jg1ISo9QUiE33lrT.jpg",
    "posterAlt": "그린랜드 2: 마이그레이션 포스터"
  },
  {
    "id": "movie_307",
    "title": "우주전쟁",
    "genres": [
      "SF",
      "스릴러"
    ],
    "genreIds": [
      878,
      53
    ],
    "tags": [
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "William Radford",
      "NASA Scientist Sandra Salas",
      "NSA Director Donald Briggs"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yvirUYrva23IudARHn3mMGVxWqM.jpg",
    "posterAlt": "우주전쟁 포스터"
  },
  {
    "id": "movie_308",
    "title": "나의 잘못",
    "genres": [
      "드라마",
      "로맨스",
      "스릴러"
    ],
    "genreIds": [
      18,
      10749,
      53
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "여운",
      "긴장감"
    ],
    "characters": [
      "Noah Morán",
      "Nick Leister",
      "Rafaella Leister"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/duT8Vks5FXwDkpxoR84xb2a6VB6.jpg",
    "posterAlt": "나의 잘못 포스터"
  },
  {
    "id": "movie_309",
    "title": "직장상사 길들이기",
    "genres": [
      "공포",
      "스릴러",
      "코미디"
    ],
    "genreIds": [
      27,
      53,
      35
    ],
    "tags": [
      "긴장감",
      "유머",
      "몰입감",
      "캐릭터 매력"
    ],
    "characters": [
      "Linda Liddle",
      "Bradley Preston",
      "Zuri"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kpOHAiCiIBa0yPtOqSp99NxhwUF.jpg",
    "posterAlt": "직장상사 길들이기 포스터"
  },
  {
    "id": "movie_310",
    "title": "레디 오어 낫 2",
    "genres": [
      "스릴러",
      "공포",
      "코미디"
    ],
    "genreIds": [
      53,
      27,
      35
    ],
    "tags": [
      "유머",
      "긴장감",
      "몰입감",
      "캐릭터 매력"
    ],
    "characters": [
      "Grace MacCaulley",
      "Faith MacCaulley",
      "The Lawyer"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/13ZcJzSGEqVgDSqsS9U5EkQwPkV.jpg",
    "posterAlt": "레디 오어 낫 2 포스터"
  },
  {
    "id": "movie_311",
    "title": "크라임 101",
    "genres": [
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      80,
      53
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Davis",
      "Lou",
      "Sharon"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/77ggpowGO0ORQY9x33NeBIPajm1.jpg",
    "posterAlt": "크라임 101 포스터"
  },
  {
    "id": "movie_312",
    "title": "펄프 픽션",
    "genres": [
      "스릴러",
      "범죄",
      "코미디"
    ],
    "genreIds": [
      53,
      80,
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Vincent Vega",
      "Jules Winnfield",
      "Mia Wallace"
    ],
    "releaseYear": 1994,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lnRkeQstaCvfMahZq7p9eAWzK1a.jpg",
    "posterAlt": "펄프 픽션 포스터"
  },
  {
    "id": "movie_313",
    "title": "돌이킬 수 없는",
    "genres": [
      "드라마",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      18,
      53,
      80
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Alex",
      "Marcus",
      "Pierre"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/AdrItykbv1evqcbIPrItVWnkaKj.jpg",
    "posterAlt": "돌이킬 수 없는 포스터"
  },
  {
    "id": "movie_314",
    "title": "28년 후: 뼈의 사원",
    "genres": [
      "공포",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      27,
      53,
      878
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Dr Kelson",
      "Sir Jimmy Crystal",
      "Spike"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ubgOSHAEhv1ds8BNHodhCcI13oH.jpg",
    "posterAlt": "28년 후: 뼈의 사원 포스터"
  },
  {
    "id": "movie_315",
    "title": "노멀",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Ulysses Richardson",
      "Mayor Kibner",
      "Moira"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/A7TN0R78eenIf7hED3k96POTJMX.jpg",
    "posterAlt": "노멀 포스터"
  },
  {
    "id": "movie_316",
    "title": "나우 유 씨 미 3",
    "genres": [
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      80,
      53
    ],
    "tags": [
      "반전",
      "긴장감",
      "탄탄한 스토리",
      "몰입감"
    ],
    "characters": [
      "J. Daniel Atlas",
      "Bosco",
      "June"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dECA069mRikkghzgSBsM0cvic4F.jpg",
    "posterAlt": "나우 유 씨 미 3 포스터"
  },
  {
    "id": "movie_317",
    "title": "그레이의 50가지 그림자",
    "genres": [
      "드라마",
      "로맨스",
      "스릴러"
    ],
    "genreIds": [
      18,
      10749,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "연출",
      "배우들의 연기력"
    ],
    "characters": [
      "Anastasia Steele",
      "Christian Grey",
      "Carla"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iQaLakvYBzpmdHUB2h6h2aVY5nE.jpg",
    "posterAlt": "그레이의 50가지 그림자 포스터"
  },
  {
    "id": "movie_318",
    "title": "'더 캐니언' - The Gorge",
    "genres": [
      "로맨스",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      10749,
      878,
      53
    ],
    "tags": [
      "몰입감",
      "감동",
      "여운",
      "긴장감"
    ],
    "characters": [
      "Levi",
      "Drasa",
      "Bartholomew"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dBKMc0Bim0Z8amB7VihuCfhto2v.jpg",
    "posterAlt": "'더 캐니언' - The Gorge 포스터"
  },
  {
    "id": "movie_319",
    "title": "서브스턴스",
    "genres": [
      "공포",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      27,
      878,
      53
    ],
    "tags": [
      "연출",
      "유머",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Elisabeth",
      "Sue",
      "Harvey"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oUkeyrXvGUEylOQtlYMv9esNRiu.jpg",
    "posterAlt": "서브스턴스 포스터"
  },
  {
    "id": "movie_320",
    "title": "더 배트맨",
    "genres": [
      "범죄",
      "미스터리",
      "스릴러"
    ],
    "genreIds": [
      80,
      9648,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "탄탄한 스토리",
      "반전"
    ],
    "characters": [
      "Bruce Wayne / The Batman",
      "Selina Kyle",
      "Lt. James Gordon"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/jicHGaOX5pHs7RKjfexMxvLkwjf.jpg",
    "posterAlt": "더 배트맨 포스터"
  },
  {
    "id": "movie_321",
    "title": "리덕스 리덕스",
    "genres": [
      "SF",
      "스릴러",
      "공포"
    ],
    "genreIds": [
      878,
      53,
      27,
      80
    ],
    "tags": [
      "세계관",
      "긴장감",
      "몰입감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Irene Kelly",
      "Mia",
      "Neville"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9u7sUTYPPTxGCXbkcw8FTq50PnO.jpg",
    "posterAlt": "리덕스 리덕스 포스터"
  },
  {
    "id": "movie_322",
    "title": "네 무덤에 침을 뱉어라",
    "genres": [
      "스릴러",
      "범죄",
      "공포"
    ],
    "genreIds": [
      53,
      80,
      27
    ],
    "tags": [
      "긴장감",
      "몰입감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Jennifer Hills",
      "John 'Johnny' Miller",
      "Earl"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vssZGmkZjmwZI9gMdVykycQgwlA.jpg",
    "posterAlt": "네 무덤에 침을 뱉어라 포스터"
  },
  {
    "id": "movie_323",
    "title": "프레디의 피자가게 2",
    "genres": [
      "공포",
      "스릴러"
    ],
    "genreIds": [
      27,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Mike",
      "Abby",
      "Vanessa"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kEmPnUUXaF9hPgDMlc0eJht5JYO.jpg",
    "posterAlt": "프레디의 피자가게 2 포스터"
  },
  {
    "id": "movie_324",
    "title": "발레리나",
    "genres": [
      "액션",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      28,
      53,
      80
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Eve",
      "John Wick",
      "Winston"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rGe64vmd9cpvwiTD5OGWJezBnNg.jpg",
    "posterAlt": "발레리나 포스터"
  },
  {
    "id": "movie_325",
    "title": "원 배틀 애프터 어나더",
    "genres": [
      "스릴러",
      "범죄",
      "코미디"
    ],
    "genreIds": [
      53,
      80,
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "긴장감",
      "몰입감",
      "유머"
    ],
    "characters": [
      "Bob",
      "Col. Steven J. Lockjaw",
      "Willa"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/bCg9iDSXPjVTUs1RyYH8AhmJ11d.jpg",
    "posterAlt": "원 배틀 애프터 어나더 포스터"
  },
  {
    "id": "movie_326",
    "title": "치명적이고 아름다운",
    "genres": [
      "음악",
      "스릴러",
      "액션"
    ],
    "genreIds": [
      10402,
      53,
      28,
      27
    ],
    "tags": [
      "액션",
      "몰입감",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Bones",
      "Princess",
      "Zoe"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/wlV000ToWdP5jtBBswT98DUibIS.jpg",
    "posterAlt": "치명적이고 아름다운 포스터"
  },
  {
    "id": "movie_327",
    "title": "색, 계",
    "genres": [
      "액션",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      28,
      18,
      10749,
      53
    ],
    "tags": [
      "액션",
      "긴장감",
      "몰입감",
      "배우들의 연기력"
    ],
    "characters": [
      "Mr. Yee",
      "Wong Chia Chi / Mrs. Mak",
      "Mrs. Yee"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xd7dT3mh7cUk1rqDs7AaqJ5NZES.jpg",
    "posterAlt": "색, 계 포스터"
  },
  {
    "id": "movie_328",
    "title": "분노의 질주: 라이드 오어 다이",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "반전",
      "감동",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Dominic Toretto",
      "Letty",
      "Roman"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cltj9nKLzl0HXtz2qdu55BoIgOn.jpg",
    "posterAlt": "분노의 질주: 라이드 오어 다이 포스터"
  },
  {
    "id": "movie_329",
    "title": "메이즈 러너",
    "genres": [
      "액션",
      "미스터리",
      "SF"
    ],
    "genreIds": [
      28,
      9648,
      878,
      53
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Thomas",
      "Teresa Agnes",
      "Newt"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/bL0bBepUCLFcCj2ATFD40FbyDEl.jpg",
    "posterAlt": "메이즈 러너 포스터"
  },
  {
    "id": "movie_330",
    "title": "헌팅시즌",
    "genres": [
      "액션",
      "드라마",
      "스릴러"
    ],
    "genreIds": [
      28,
      18,
      53
    ],
    "tags": [
      "액션",
      "몰입감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Bowdrie",
      "January",
      "Alejandro"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7OPedgbyapZ8LjIQIMIh72ZEfW6.jpg",
    "posterAlt": "헌팅시즌 포스터"
  },
  {
    "id": "movie_331",
    "title": "컨저링",
    "genres": [
      "공포",
      "스릴러"
    ],
    "genreIds": [
      27,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Lorraine Warren",
      "Ed Warren",
      "Carolyn Perron"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pWpTToZ32bG09PaZ1rvYG5mpOyV.jpg",
    "posterAlt": "컨저링 포스터"
  },
  {
    "id": "movie_332",
    "title": "블랙폰 2",
    "genres": [
      "공포",
      "스릴러"
    ],
    "genreIds": [
      27,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "영상미",
      "몰입감"
    ],
    "characters": [
      "The Grabber",
      "Finn",
      "Gwen"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1sx2U13D7zBOCGYE9GBxVKYvmtg.jpg",
    "posterAlt": "블랙폰 2 포스터"
  },
  {
    "id": "movie_333",
    "title": "샤이닝",
    "genres": [
      "공포",
      "스릴러"
    ],
    "genreIds": [
      27,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동",
      "감동적인 음악"
    ],
    "characters": [
      "Jack Torrance",
      "Wendy Torrance",
      "Danny"
    ],
    "releaseYear": 1980,
    "posterUrl": "https://image.tmdb.org/t/p/w780/aaItbIXZlC2C7Arg3PI0IglKi0.jpg",
    "posterAlt": "샤이닝 포스터"
  },
  {
    "id": "movie_334",
    "title": "노크 노크",
    "genres": [
      "공포",
      "스릴러",
      "범죄"
    ],
    "genreIds": [
      27,
      53,
      80
    ],
    "tags": [
      "긴장감",
      "몰입감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Evan Webber",
      "Genesis",
      "Bel"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8hjIz6BkZiBSeuHYs1e8eO0w489.jpg",
    "posterAlt": "노크 노크 포스터"
  },
  {
    "id": "movie_335",
    "title": "나이브스 아웃: 웨이크 업 데드 맨",
    "genres": [
      "스릴러",
      "미스터리",
      "코미디"
    ],
    "genreIds": [
      53,
      9648,
      35
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "캐릭터 매력"
    ],
    "characters": [
      "Benoit Blanc",
      "Fr. Jud Duplenticy",
      "Martha Delacroix"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qFXkslzkBIihZnwyYal9WnQ9OTe.jpg",
    "posterAlt": "나이브스 아웃: 웨이크 업 데드 맨 포스터"
  },
  {
    "id": "movie_336",
    "title": "악인전",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Jang Dong-su",
      "Jung Tae-suk",
      "Kang Gyeong-ho"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/az4OVqXbFVaHoZlktcm7oCm0LZo.jpg",
    "posterAlt": "악인전 포스터"
  },
  {
    "id": "movie_337",
    "title": "터미네이터",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      28,
      53,
      878
    ],
    "tags": [
      "액션",
      "세계관",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Terminator",
      "Kyle Reese",
      "Sarah Connor"
    ],
    "releaseYear": 1984,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sez4xWeylbYQqiI8HIgnciTP7MY.jpg",
    "posterAlt": "터미네이터 포스터"
  },
  {
    "id": "movie_338",
    "title": "더 이퀄라이저",
    "genres": [
      "스릴러",
      "액션",
      "범죄"
    ],
    "genreIds": [
      53,
      28,
      80
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Robert McCall",
      "Teddy",
      "Teri"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hqes9NQtVIULs8VKu0WqY6RdXGU.jpg",
    "posterAlt": "더 이퀄라이저 포스터"
  },
  {
    "id": "movie_339",
    "title": "스트레인저스: 챕터3",
    "genres": [
      "공포",
      "스릴러"
    ],
    "genreIds": [
      27,
      53
    ],
    "tags": [
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Maya",
      "Sheriff Rotter",
      "Shelly / Pinup"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nxoxD8FdbhRWd2Ra0W6qsZA0frn.jpg",
    "posterAlt": "스트레인저스: 챕터3 포스터"
  },
  {
    "id": "movie_340",
    "title": "마이 티쳐, 마이 러브",
    "genres": [
      "드라마",
      "스릴러",
      "TV 영화"
    ],
    "genreIds": [
      18,
      53,
      10770
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Chris",
      "Kyla",
      "Riley"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2VOFI6HOnuncgTU08rjDwUG5FDs.jpg",
    "posterAlt": "마이 티쳐, 마이 러브 포스터"
  },
  {
    "id": "movie_341",
    "title": "캡틴 아메리카: 브레이브 뉴 월드",
    "genres": [
      "액션",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      28,
      53,
      878
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Sam Wilson / Captain America",
      "President Thaddeus Ross",
      "Joaquin Torres"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qj1uEI7zrCWbMppjFZmCXVlWlb1.jpg",
    "posterAlt": "캡틴 아메리카: 브레이브 뉴 월드 포스터"
  },
  {
    "id": "movie_342",
    "title": "분노의 질주: 더 세븐",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "긴장감",
      "액션",
      "몰입감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Dominic Toretto",
      "Brian O'Conner",
      "Luke Hobbs"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cuQdgDYANbKA46e4va2fz6fODkc.jpg",
    "posterAlt": "분노의 질주: 더 세븐 포스터"
  },
  {
    "id": "movie_343",
    "title": "폴: 600미터",
    "genres": [
      "스릴러"
    ],
    "genreIds": [
      53
    ],
    "tags": [
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Becky Connor",
      "Shiloh Hunter",
      "James Conner"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uyiALGPVtVsrTY4YHSq2osSYls5.jpg",
    "posterAlt": "폴: 600미터 포스터"
  },
  {
    "id": "movie_344",
    "title": "언페이스풀",
    "genres": [
      "스릴러",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      53,
      18,
      10749
    ],
    "tags": [
      "긴장감",
      "몰입감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Constance Sumner",
      "Edward Sumner",
      "Paul Martel"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vXl4cigeyWPOYOjaHcnXcb6Dfb3.jpg",
    "posterAlt": "언페이스풀 포스터"
  },
  {
    "id": "movie_345",
    "title": "바스터즈: 거친 녀석들",
    "genres": [
      "드라마",
      "스릴러",
      "전쟁"
    ],
    "genreIds": [
      18,
      53,
      10752
    ],
    "tags": [
      "액션",
      "세계관",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "LT. Aldo Raine",
      "Shosanna",
      "COL. Hans Landa"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4eQ2DQi2Vb8oYN9IRAca8vaALNl.jpg",
    "posterAlt": "바스터즈: 거친 녀석들 포스터"
  },
  {
    "id": "movie_346",
    "title": "싸이코",
    "genres": [
      "공포",
      "스릴러",
      "미스터리"
    ],
    "genreIds": [
      27,
      53,
      9648
    ],
    "tags": [
      "긴장감",
      "몰입감",
      "반전",
      "탄탄한 스토리"
    ],
    "characters": [
      "Norman Bates",
      "Marion Crane",
      "Lila Crane"
    ],
    "releaseYear": 1960,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vC3P8hH4r3I3fHiRFa1kj6yzeaN.jpg",
    "posterAlt": "싸이코 포스터"
  },
  {
    "id": "movie_347",
    "title": "그린랜드",
    "genres": [
      "스릴러",
      "모험",
      "액션"
    ],
    "genreIds": [
      53,
      12,
      28,
      878
    ],
    "tags": [
      "세계관",
      "긴장감",
      "몰입감",
      "액션"
    ],
    "characters": [
      "John Garrity",
      "Allison Garrity",
      "Ralph Vento"
    ],
    "releaseYear": 2020,
    "posterUrl": "https://image.tmdb.org/t/p/w780/wLgHczwajb3QV2JBgsqNVjuHoJC.jpg",
    "posterAlt": "그린랜드 포스터"
  },
  {
    "id": "movie_348",
    "title": "다크 나이트 라이즈",
    "genres": [
      "액션",
      "범죄",
      "드라마"
    ],
    "genreIds": [
      28,
      80,
      18,
      53
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "세계관",
      "OST"
    ],
    "characters": [
      "Bruce Wayne",
      "Commissioner Gordon",
      "Bane"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eq5P71YHwwaacEYKaQ72Wxy6BlT.jpg",
    "posterAlt": "다크 나이트 라이즈 포스터"
  },
  {
    "id": "movie_349",
    "title": "비키퍼",
    "genres": [
      "액션",
      "범죄",
      "스릴러"
    ],
    "genreIds": [
      28,
      80,
      53
    ],
    "tags": [
      "액션",
      "몰입감",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Adam Clay",
      "Agent Verona Parker",
      "Derek Danforth"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ekHemOB84SoKi6fqG0ciwvKWM2i.jpg",
    "posterAlt": "비키퍼 포스터"
  },
  {
    "id": "movie_350",
    "title": "휴민트",
    "genres": [
      "스릴러",
      "액션",
      "드라마"
    ],
    "genreIds": [
      53,
      28,
      18
    ],
    "tags": [
      "반전",
      "긴장감",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Manager Zo",
      "Park Geon",
      "Hwang Chi-seong"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/f7sCSLEPRfV2fWQ0RYOtHhnHXuG.jpg",
    "posterAlt": "휴민트 포스터"
  },
  {
    "id": "movie_351",
    "title": "무서운 영화",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Shorty Meeks",
      "Ray Wilkins",
      "Cindy Campbell"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/bqOKJrZFR9KpqWE607dw6KOdKCj.jpg",
    "posterAlt": "무서운 영화 포스터"
  },
  {
    "id": "movie_352",
    "title": "더 드라마",
    "genres": [
      "로맨스",
      "코미디",
      "드라마"
    ],
    "genreIds": [
      10749,
      35,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "유머"
    ],
    "characters": [
      "Emma Harwood",
      "Charlie Thompson",
      "Mike"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rnIOUhzwJDfgQakx8EjoNyItKgs.jpg",
    "posterAlt": "더 드라마 포스터"
  },
  {
    "id": "movie_353",
    "title": "악마는 프라다를 입는다 2",
    "genres": [
      "코미디",
      "드라마"
    ],
    "genreIds": [
      35,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "캐릭터 매력",
      "배우들의 연기력"
    ],
    "characters": [
      "Miranda Priestly",
      "Andy Sachs",
      "Emily"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/28A1VUDML1RzENYNtIU1WkBLT9V.jpg",
    "posterAlt": "악마는 프라다를 입는다 2 포스터"
  },
  {
    "id": "movie_354",
    "title": "레이디스 퍼스트: 거꾸로 가는 남자",
    "genres": [
      "코미디",
      "판타지"
    ],
    "genreIds": [
      35,
      14
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "세계관",
      "영상미"
    ],
    "characters": [
      "Damien Sachs",
      "Alex Fox",
      "Chris Black"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oQutxZrpqUKZhEBFwUnH49Q0U0V.jpg",
    "posterAlt": "레이디스 퍼스트: 거꾸로 가는 남자 포스터"
  },
  {
    "id": "movie_355",
    "title": "무서운 영화",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Cindy Campbell",
      "Brenda Meeks",
      "Shorty Meeks"
    ],
    "releaseYear": 2000,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7WgS8qO4KYZxjUQMs0JSFxqcYgn.jpg",
    "posterAlt": "무서운 영화 포스터"
  },
  {
    "id": "movie_356",
    "title": "The Sheep Detectives",
    "genres": [
      "코미디",
      "가족",
      "미스터리"
    ],
    "genreIds": [
      35,
      10751,
      9648
    ],
    "tags": [
      "긴장감",
      "반전",
      "탄탄한 스토리",
      "유머"
    ],
    "characters": [
      "George Hardy",
      "Lily (voice)",
      "Lydia Harbottle"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hTirV44jiLh6NqdiB6jtxPsDIoG.jpg",
    "posterAlt": "The Sheep Detectives 포스터"
  },
  {
    "id": "movie_357",
    "title": "Socias por accidente",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "감동",
      "여운"
    ],
    "characters": [
      "Alexa Hernández",
      "Regina",
      "Roy / Sebastián Benavides / Erick López"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sr1Yoj6XLPTWYcbDoBy67xivW4I.jpg",
    "posterAlt": "Socias por accidente 포스터"
  },
  {
    "id": "movie_358",
    "title": "Bingo Bongo",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Bingo Bongo",
      "Laura",
      "Prof. Fortis"
    ],
    "releaseYear": 1982,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cqiWWn2tnQwJHFmAMaLR2JdRbzC.jpg",
    "posterAlt": "Bingo Bongo 포스터"
  },
  {
    "id": "movie_359",
    "title": "무서운 영화 5",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Jody Sanders",
      "Dan Sanders",
      "Kathy"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/f8Ms3vhJ1ANVtUmQUW4uZlLqKWH.jpg",
    "posterAlt": "무서운 영화 5 포스터"
  },
  {
    "id": "movie_360",
    "title": "포레스트 검프",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      35,
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Forrest Gump",
      "Jenny Curran",
      "Lieutenant Dan Taylor"
    ],
    "releaseYear": 1994,
    "posterUrl": "https://image.tmdb.org/t/p/w780/l8wvbQQIBV8LBHmx3Wx9xbE2kzt.jpg",
    "posterAlt": "포레스트 검프 포스터"
  },
  {
    "id": "movie_361",
    "title": "무서운 영화 2",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Cindy Campbell",
      "Brenda Meeks",
      "Shorty Meeks"
    ],
    "releaseYear": 2001,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iRS4R009OJM4KmhikmzGvkbeEaT.jpg",
    "posterAlt": "무서운 영화 2 포스터"
  },
  {
    "id": "movie_362",
    "title": "아나콘다",
    "genres": [
      "모험",
      "코미디"
    ],
    "genreIds": [
      12,
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Doug McCallister",
      "Ronald Griffin Jr.",
      "Kenny Trent"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4HxOXiEFPAFQhzkobIU9Lqlezlq.jpg",
    "posterAlt": "아나콘다 포스터"
  },
  {
    "id": "movie_363",
    "title": "A MINECRAFT MOVIE 마인크래프트 무비",
    "genres": [
      "가족",
      "판타지",
      "코미디"
    ],
    "genreIds": [
      10751,
      14,
      35,
      12
    ],
    "tags": [
      "액션",
      "감동",
      "영상미",
      "몰입감"
    ],
    "characters": [
      "Garrett",
      "Steve",
      "Henry"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/k5aQ2TqKcQFwPoXHkpAGoKNVDLZ.jpg",
    "posterAlt": "A MINECRAFT MOVIE 마인크래프트 무비 포스터"
  },
  {
    "id": "movie_364",
    "title": "무서운 영화 4",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Cindy Campbell",
      "Brenda Meeks",
      "Tom Ryan"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6fnD5s7tPKQOxXmBzGcspUl1Qfu.jpg",
    "posterAlt": "무서운 영화 4 포스터"
  },
  {
    "id": "movie_365",
    "title": "마이크 & 닉 & 닉 & 앨리스",
    "genres": [
      "코미디",
      "SF",
      "범죄"
    ],
    "genreIds": [
      35,
      878,
      80
    ],
    "tags": [
      "액션",
      "감동",
      "캐릭터 매력",
      "유머"
    ],
    "characters": [
      "Quick Draw Mike",
      "Future Nick / Present Nick",
      "Alice"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7F0jc75HrSkLVcvOXR2FXAIwuEv.jpg",
    "posterAlt": "마이크 & 닉 & 닉 & 앨리스 포스터"
  },
  {
    "id": "movie_366",
    "title": "더 울프 오브 월 스트리트",
    "genres": [
      "범죄",
      "드라마",
      "코미디"
    ],
    "genreIds": [
      80,
      18,
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "긴장감",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Jordan Belfort",
      "Donnie Azoff",
      "Naomi Lapaglia"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rdBYtoxLvd8J9PsVYVGd7FGzQux.jpg",
    "posterAlt": "더 울프 오브 월 스트리트 포스터"
  },
  {
    "id": "movie_367",
    "title": "해적: 바다로 간 산적",
    "genres": [
      "액션",
      "모험",
      "코미디"
    ],
    "genreIds": [
      28,
      12,
      35,
      14
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Yeo-wol",
      "Jang Sa-jung",
      "Han Sang-jil"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yMydhXOFTKPxxFBJiBMKv2JM7sl.jpg",
    "posterAlt": "해적: 바다로 간 산적 포스터"
  },
  {
    "id": "movie_368",
    "title": "무서운 영화 3",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Cindy Campbell",
      "Brenda Meeks",
      "George"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lpNG1nx67rvYze1b1R9q0YoSzrC.jpg",
    "posterAlt": "무서운 영화 3 포스터"
  },
  {
    "id": "movie_369",
    "title": "¿Quieres ser mi novia?",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "감동",
      "여운"
    ],
    "characters": [
      "Lucía",
      "Javier",
      "La Avispa"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oscW8xV8EhRYj7iAhyVlBohKqxo.jpg",
    "posterAlt": "¿Quieres ser mi novia? 포스터"
  },
  {
    "id": "movie_370",
    "title": "19곰 테드",
    "genres": [
      "코미디",
      "판타지"
    ],
    "genreIds": [
      35,
      14
    ],
    "tags": [
      "감동",
      "영상미",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "John Bennett",
      "Lori Collins",
      "Ted (voice)"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/v6klSXH4e0HL4iCIj9FJYreqUdV.jpg",
    "posterAlt": "19곰 테드 포스터"
  },
  {
    "id": "movie_371",
    "title": "화이트 칙스",
    "genres": [
      "코미디",
      "범죄"
    ],
    "genreIds": [
      35,
      80
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "긴장감",
      "탄탄한 스토리"
    ],
    "characters": [
      "Kevin Copeland / Brittany Wilson",
      "Marcus Anthony Copeland II / Tiffany Wilson",
      "Elliott Gordon"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4caC5bNljJiakF2r18Bb3j4URAe.jpg",
    "posterAlt": "화이트 칙스 포스터"
  },
  {
    "id": "movie_372",
    "title": "스웹트 어웨이",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "감동",
      "여운"
    ],
    "characters": [
      "Amber Leighton",
      "Giuseppe 'Guido' Esposito",
      "Anthony 'Tony' Leighton"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rAa3nTeDpwgLX6XxnT3wR86C5WE.jpg",
    "posterAlt": "스웹트 어웨이 포스터"
  },
  {
    "id": "movie_373",
    "title": "다 큰 녀석들",
    "genres": [
      "코미디"
    ],
    "genreIds": [
      35
    ],
    "tags": [
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Lenny Feder",
      "Eric Lamonsoff",
      "Kurt McKenzie"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2vgdOjlrpuGTwnMNzFWPSuaKuVA.jpg",
    "posterAlt": "다 큰 녀석들 포스터"
  },
  {
    "id": "movie_374",
    "title": "굿 럭, 해브 펀, 돈 다이",
    "genres": [
      "SF",
      "액션",
      "코미디"
    ],
    "genreIds": [
      878,
      28,
      35
    ],
    "tags": [
      "긴장감",
      "유머",
      "액션",
      "몰입감"
    ],
    "characters": [
      "The Man From The Future",
      "Susan",
      "Ingrid"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rWcfOdY7TU6lTdazWj0ebDZnAfO.jpg",
    "posterAlt": "굿 럭, 해브 펀, 돈 다이 포스터"
  },
  {
    "id": "movie_375",
    "title": "레디 오어 낫",
    "genres": [
      "공포",
      "코미디"
    ],
    "genreIds": [
      27,
      35
    ],
    "tags": [
      "긴장감",
      "감동적인 음악",
      "OST",
      "유머"
    ],
    "characters": [
      "Grace",
      "Daniel",
      "Alex"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fIpXKQecVTp7veBSm6IXZSe0wzb.jpg",
    "posterAlt": "레디 오어 낫 포스터"
  },
  {
    "id": "movie_376",
    "title": "데드풀",
    "genres": [
      "액션",
      "모험",
      "코미디"
    ],
    "genreIds": [
      28,
      12,
      35
    ],
    "tags": [
      "액션",
      "몰입감",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Wade Wilson / Deadpool",
      "Vanessa",
      "Ajax"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/k1e0TlvDM4KsiSRyJENVrHxMqtK.jpg",
    "posterAlt": "데드풀 포스터"
  },
  {
    "id": "movie_377",
    "title": "릴로 & 스티치",
    "genres": [
      "가족",
      "SF",
      "코미디"
    ],
    "genreIds": [
      10751,
      878,
      35
    ],
    "tags": [
      "액션",
      "감동",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Lilo",
      "Nani",
      "Stitch (voice)"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ww7jn7lv1YzTAGd5m0R6CP1VXAs.jpg",
    "posterAlt": "릴로 & 스티치 포스터"
  },
  {
    "id": "movie_378",
    "title": "용감한 자가 신부를 데려가리",
    "genres": [
      "코미디",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      35,
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Simran Singh",
      "Raj Malhotra",
      "Chaudhry Baldev Singh"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
    "posterAlt": "용감한 자가 신부를 데려가리 포스터"
  },
  {
    "id": "movie_379",
    "title": "아메리칸 파이",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "감동",
      "여운"
    ],
    "characters": [
      "Jim Levenstein",
      "Chris 'Oz' Ostreicher",
      "Kevin Meyers"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5P68by2Thn8wHAziyWGEw2O7hco.jpg",
    "posterAlt": "아메리칸 파이 포스터"
  },
  {
    "id": "movie_380",
    "title": "19곰 테드 2",
    "genres": [
      "코미디",
      "판타지"
    ],
    "genreIds": [
      35,
      14
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "세계관",
      "영상미"
    ],
    "characters": [
      "John",
      "Ted (voice)",
      "Samantha"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9ljV8sG9HQs6bBc19Vw0754aujG.jpg",
    "posterAlt": "19곰 테드 2 포스터"
  },
  {
    "id": "movie_381",
    "title": "토르: 라그나로크",
    "genres": [
      "액션",
      "SF",
      "코미디"
    ],
    "genreIds": [
      28,
      878,
      35
    ],
    "tags": [
      "액션",
      "몰입감",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Thor",
      "Bruce Banner / Hulk",
      "Loki"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/98pS5T4Xe362fxJBWTuq1m46dOJ.jpg",
    "posterAlt": "토르: 라그나로크 포스터"
  },
  {
    "id": "movie_382",
    "title": "너란 개념",
    "genres": [
      "음악",
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      10402,
      35,
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "유머"
    ],
    "characters": [
      "Solène",
      "Hayes",
      "Izzy"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6x9gZWCqEGYObUCJPjTKFT2LNqA.jpg",
    "posterAlt": "너란 개념 포스터"
  },
  {
    "id": "movie_383",
    "title": "세크리터리",
    "genres": [
      "로맨스",
      "드라마",
      "코미디"
    ],
    "genreIds": [
      10749,
      18,
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Mr. Grey",
      "Lee Holloway",
      "Peter"
    ],
    "releaseYear": 2002,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sHoSvGWwbdFcF29vskvv2XvYgEk.jpg",
    "posterAlt": "세크리터리 포스터"
  },
  {
    "id": "movie_384",
    "title": "아노라",
    "genres": [
      "드라마",
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      18,
      35,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Ani",
      "Ivan",
      "Igor"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sk2JbDCTMHk14owQPm2lryV1fca.jpg",
    "posterAlt": "아노라 포스터"
  },
  {
    "id": "movie_385",
    "title": "페이크 러브",
    "genres": [
      "로맨스",
      "코미디"
    ],
    "genreIds": [
      10749,
      35
    ],
    "tags": [
      "감동적인 음악",
      "감동",
      "여운",
      "유머"
    ],
    "characters": [
      "Bea",
      "Ben",
      "Barista"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5qHoazZiaLe7oFBok7XlUhg96f2.jpg",
    "posterAlt": "페이크 러브 포스터"
  },
  {
    "id": "movie_386",
    "title": "콜드 스토리지",
    "genres": [
      "공포",
      "SF",
      "코미디"
    ],
    "genreIds": [
      27,
      878,
      35
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "몰입감",
      "캐릭터 매력"
    ],
    "characters": [
      "Naomi",
      "Teacake",
      "Dr. Hero Martins"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3HA2iiq982e01EKXJvPFyfMADVM.jpg",
    "posterAlt": "콜드 스토리지 포스터"
  },
  {
    "id": "movie_387",
    "title": "크루엘라",
    "genres": [
      "코미디",
      "범죄",
      "드라마"
    ],
    "genreIds": [
      35,
      80,
      18
    ],
    "tags": [
      "액션",
      "탄탄한 스토리",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Estella / Cruella",
      "The Baroness",
      "Jasper"
    ],
    "releaseYear": 2021,
    "posterUrl": "https://image.tmdb.org/t/p/w780/89y66LHU3T3txFALo2nwyBfYpWA.jpg",
    "posterAlt": "크루엘라 포스터"
  },
  {
    "id": "movie_388",
    "title": "부고니아",
    "genres": [
      "SF",
      "스릴러",
      "코미디"
    ],
    "genreIds": [
      878,
      53,
      35
    ],
    "tags": [
      "세계관",
      "유머",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Michelle",
      "Teddy",
      "Don"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ko6Wxr4sB9RM3pJb5JlWPqiSOIp.jpg",
    "posterAlt": "부고니아 포스터"
  },
  {
    "id": "movie_389",
    "title": "프로포즈",
    "genres": [
      "코미디",
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      35,
      10749,
      18
    ],
    "tags": [
      "감동",
      "연출",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Margaret Tate",
      "Andrew Paxton",
      "Gertrude"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yM0HNVCWfrb5VrFgPQMec2SmfrZ.jpg",
    "posterAlt": "프로포즈 포스터"
  },
  {
    "id": "movie_390",
    "title": "슈렉 2",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      14,
      10749
    ],
    "tags": [
      "영상미",
      "세계관",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Shrek (voice)",
      "Donkey (voice)",
      "Princess Fiona (voice)"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2yYP0PQjG8zVqturh1BAqu2Tixl.jpg",
    "posterAlt": "슈렉 2 포스터"
  },
  {
    "id": "movie_391",
    "title": "하우 투 메이크 어 킬링",
    "genres": [
      "코미디",
      "스릴러"
    ],
    "genreIds": [
      35,
      53
    ],
    "tags": [
      "긴장감",
      "감동",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Becket Redfellow",
      "Julia Steinway",
      "Ruth"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vxMeKC7o5Gi8IHMi6lUgsdprTqv.jpg",
    "posterAlt": "하우 투 메이크 어 킬링 포스터"
  },
  {
    "id": "movie_392",
    "title": "랭고",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      37,
      12
    ],
    "tags": [
      "액션",
      "영상미",
      "세계관",
      "유머"
    ],
    "characters": [
      "Rango / Lars (voice)",
      "Beans (voice)",
      "Mayor (voice)"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/r03cVlmlKRPVAQxEqmhhPyYwfcr.jpg",
    "posterAlt": "랭고 포스터"
  },
  {
    "id": "movie_393",
    "title": "겨울왕국 2",
    "genres": [
      "가족",
      "애니메이션",
      "모험"
    ],
    "genreIds": [
      10751,
      16,
      12,
      35,
      14
    ],
    "tags": [
      "감동적인 음악",
      "감동",
      "캐릭터 매력",
      "영상미"
    ],
    "characters": [
      "Elsa (voice)",
      "Anna (voice)",
      "Olaf (voice)"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/lVcwSnzhSMWYXUQzyMilCztSE6I.jpg",
    "posterAlt": "겨울왕국 2 포스터"
  },
  {
    "id": "movie_394",
    "title": "세 얼간이",
    "genres": [
      "드라마",
      "코미디"
    ],
    "genreIds": [
      18,
      35
    ],
    "tags": [
      "반전",
      "탄탄한 스토리",
      "유머",
      "배우들의 연기력"
    ],
    "characters": [
      "Ranchoddas \"Rancho\" Chanchad",
      "Farhan Qureshi",
      "Raju Rastogi"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9zQdFVyDoXqFmGYXp4obna6FEMh.jpg",
    "posterAlt": "세 얼간이 포스터"
  },
  {
    "id": "movie_395",
    "title": "아이스 에이지 3: 공룡시대",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      12
    ],
    "tags": [
      "탄탄한 스토리",
      "영상미",
      "세계관",
      "유머"
    ],
    "characters": [
      "Manny (voice)",
      "Sid (voice)",
      "Diego (voice)"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zty1hzthRVGgMDFU1B1uo8zfCk7.jpg",
    "posterAlt": "아이스 에이지 3: 공룡시대 포스터"
  },
  {
    "id": "movie_396",
    "title": "원스 어폰 어 타임 인… 할리우드",
    "genres": [
      "코미디",
      "드라마",
      "스릴러"
    ],
    "genreIds": [
      35,
      18,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동",
      "감동적인 음악"
    ],
    "characters": [
      "Rick Dalton",
      "Cliff Booth",
      "Sharon Tate"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/AgulxT0MIna1ZxPQmtw3j6prfxA.jpg",
    "posterAlt": "원스 어폰 어 타임 인… 할리우드 포스터"
  },
  {
    "id": "movie_397",
    "title": "인투 더 월드",
    "genres": [
      "가족",
      "코미디",
      "모험"
    ],
    "genreIds": [
      10751,
      35,
      12,
      16
    ],
    "tags": [
      "감동",
      "캐릭터 매력",
      "유머",
      "영상미"
    ],
    "characters": [
      "Mack Mallard (voice)",
      "Pam Mallard (voice)",
      "Dax Mallard (voice)"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2xE3NI6zElWhwN9WJ92fqbZKmzZ.jpg",
    "posterAlt": "인투 더 월드 포스터"
  },
  {
    "id": "movie_398",
    "title": "카 2",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "genreIds": [
      16,
      10751,
      12,
      35
    ],
    "tags": [
      "영상미",
      "세계관",
      "감동",
      "캐릭터 매력"
    ],
    "characters": [
      "Mater (voice)",
      "Lightning McQueen (voice)",
      "Finn McMissile (voice)"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/azNYfwYnrdCVB3uzZaRl0JIx4N0.jpg",
    "posterAlt": "카 2 포스터"
  },
  {
    "id": "movie_399",
    "title": "마다가스카",
    "genres": [
      "모험",
      "애니메이션",
      "코미디"
    ],
    "genreIds": [
      12,
      16,
      35,
      10751
    ],
    "tags": [
      "감동",
      "영상미",
      "유머",
      "세계관"
    ],
    "characters": [
      "Alex (voice)",
      "Marty (voice)",
      "Melman (voice)"
    ],
    "releaseYear": 2005,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7BeMHBgS6nUaxj6w0hGhsiK827c.jpg",
    "posterAlt": "마다가스카 포스터"
  },
  {
    "id": "movie_400",
    "title": "아이스 에이지 2",
    "genres": [
      "애니메이션",
      "가족",
      "코미디"
    ],
    "genreIds": [
      16,
      10751,
      35,
      12
    ],
    "tags": [
      "영상미",
      "세계관",
      "감동",
      "캐릭터 매력"
    ],
    "characters": [
      "Manny (voice)",
      "Sid (voice)",
      "Diego (voice)"
    ],
    "releaseYear": 2006,
    "posterUrl": "https://image.tmdb.org/t/p/w780/1Dy4HsXBdMc5kcsmjKyU1ufI10J.jpg",
    "posterAlt": "아이스 에이지 2 포스터"
  },
  {
    "id": "movie_401",
    "title": "Твоё сердце будет разбито",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Барс",
      "Полина",
      "Лэйм"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iGpMm603GUKH2SiXB2S5m4sZ17t.jpg",
    "posterAlt": "Твоё сердце будет разбито 포스터"
  },
  {
    "id": "movie_402",
    "title": "데미지",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Dr. Stephen Fleming",
      "Anna Barton",
      "Ingrid Fleming"
    ],
    "releaseYear": 1992,
    "posterUrl": "https://image.tmdb.org/t/p/w780/bc6ADs3tcdyQFrGrSsmujKSEPYo.jpg",
    "posterAlt": "데미지 포스터"
  },
  {
    "id": "movie_403",
    "title": "애프터: 관계의 함정",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "연출",
      "몰입감"
    ],
    "characters": [
      "Tessa Young",
      "Hardin Scott",
      "Robert Freeman"
    ],
    "releaseYear": 2021,
    "posterUrl": "https://image.tmdb.org/t/p/w780/o0PgoBD6jLYId3LYpu9yUY06SLT.jpg",
    "posterAlt": "애프터: 관계의 함정 포스터"
  },
  {
    "id": "movie_404",
    "title": "룸 인 로마",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "감동",
      "배우들의 연기력",
      "여운"
    ],
    "characters": [
      "Alba",
      "Natasha",
      "Max"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4kF4qRXFd7MqX2bAJX3e3zQSxhV.jpg",
    "posterAlt": "룸 인 로마 포스터"
  },
  {
    "id": "movie_405",
    "title": "발리우드 러브스토리",
    "genres": [
      "코미디",
      "드라마",
      "가족"
    ],
    "genreIds": [
      35,
      18,
      10751,
      10749
    ],
    "tags": [
      "여운",
      "감동",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Rani Chatterji",
      "Rocky Randhawa",
      "Dhanlakshmi Randhawa"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vTQIqlxUkOuyf2UKhlM2OUaFGKz.jpg",
    "posterAlt": "발리우드 러브스토리 포스터"
  },
  {
    "id": "movie_406",
    "title": "드라큘라: 어 러브 테일",
    "genres": [
      "공포",
      "판타지",
      "로맨스"
    ],
    "genreIds": [
      27,
      14,
      10749
    ],
    "tags": [
      "감동적인 음악",
      "세계관",
      "영상미",
      "감동"
    ],
    "characters": [
      "Vlad / Dracula",
      "Elisabeta / Mina",
      "Priest"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hCKkybW6EfSZoOW3xia9ZsQwaUd.jpg",
    "posterAlt": "드라큘라: 어 러브 테일 포스터"
  },
  {
    "id": "movie_407",
    "title": "50가지 그림자: 해방",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Anastasia Steele",
      "Christian Grey",
      "Jack Hyde"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kdN58uXDV5D0RWdMjdO9jtdFjxg.jpg",
    "posterAlt": "50가지 그림자: 해방 포스터"
  },
  {
    "id": "movie_408",
    "title": "밤보다 더 아름다운 낮",
    "genres": [
      "로맨스",
      "다큐멘터리"
    ],
    "genreIds": [
      10749,
      99
    ],
    "tags": [
      "감동",
      "여운"
    ],
    "characters": [
      "Self",
      "Self"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uCkANtG6ezb7hjRKVudY3PUcbvn.jpg",
    "posterAlt": "밤보다 더 아름다운 낮 포스터"
  },
  {
    "id": "movie_409",
    "title": "나인 송즈",
    "genres": [
      "드라마",
      "음악",
      "로맨스"
    ],
    "genreIds": [
      18,
      10402,
      10749
    ],
    "tags": [
      "감동적인 음악",
      "배우들의 연기력",
      "감동",
      "OST"
    ],
    "characters": [
      "Matt",
      "Lisa",
      "Himself - The Dandy Warhols (uncredited)"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/tWkyDY78MAtemlCLJNQmlXUo1Iu.jpg",
    "posterAlt": "나인 송즈 포스터"
  },
  {
    "id": "movie_410",
    "title": "우리의 잘못",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Noah Morán",
      "Nick Leister",
      "Sofía Zabala"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yCbT1nKemh1AuQgdbns5Cf1RmRj.jpg",
    "posterAlt": "우리의 잘못 포스터"
  },
  {
    "id": "movie_411",
    "title": "사랑보다 아름다운 유혹",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Kathryn Merteuil",
      "Sébastian Valmont",
      "Annette Hargrove"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/7XczYr1AY4e1z3xUOpJoZYuR7B0.jpg",
    "posterAlt": "사랑보다 아름다운 유혹 포스터"
  },
  {
    "id": "movie_412",
    "title": "365일: 오늘",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Laura Torricelli",
      "Massimo Torricelli / Adriano Torricelli",
      "Marcelo 'Nacho' Matos"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nzrh7HhednL8gp08zR1rY3OAImC.jpg",
    "posterAlt": "365일: 오늘 포스터"
  },
  {
    "id": "movie_413",
    "title": "애프터",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Tessa Young",
      "Hardin Scott",
      "Landon Gibson"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zTZ7Q9mAwBQoYaR8HgGbmBNp6AC.jpg",
    "posterAlt": "애프터 포스터"
  },
  {
    "id": "movie_414",
    "title": "네 잘못이야",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Noah Morán",
      "Nick Leister",
      "Rafaella Leister"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zuctS3p8Bs9IeYv5ScKeOKp5Na5.jpg",
    "posterAlt": "네 잘못이야 포스터"
  },
  {
    "id": "movie_415",
    "title": "또 다른 365일",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Laura Torricelli",
      "Massimo Torricelli",
      "Marcelo 'Nacho' Matos"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3O5apa9wZiQr6IOrkpGQmsVAFev.jpg",
    "posterAlt": "또 다른 365일 포스터"
  },
  {
    "id": "movie_416",
    "title": "\"폭풍의 언덕\"",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "감동적인 음악",
      "연출"
    ],
    "characters": [
      "Cathy",
      "Heathcliff",
      "Nelly"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oDXVQRHTomnm9N569Pu2d38IubP.jpg",
    "posterAlt": "\"폭풍의 언덕\" 포스터"
  },
  {
    "id": "movie_417",
    "title": "아름다운 청춘",
    "genres": [
      "드라마",
      "로맨스",
      "전쟁"
    ],
    "genreIds": [
      18,
      10749,
      10752
    ],
    "tags": [
      "세계관",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Stig",
      "Viola",
      "Kjell"
    ],
    "releaseYear": 1995,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iIzl9GbCmk39Mgla3jnpRZLpQnC.jpg",
    "posterAlt": "아름다운 청춘 포스터"
  },
  {
    "id": "movie_418",
    "title": "나의 S 파트너",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "연출",
      "감동",
      "여운"
    ],
    "characters": [
      "Judith Flores",
      "Eric Zimmerman",
      "Mónica"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5rtaLwyKAjbceww4J1ro8aA8BNB.jpg",
    "posterAlt": "나의 S 파트너 포스터"
  },
  {
    "id": "movie_419",
    "title": "리마인더스 오브 힘",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Kenna Rowan",
      "Ledger Ward",
      "Scotty Landry"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dnuiFWiogHw1fmIDdwkVkLkzzFM.jpg",
    "posterAlt": "리마인더스 오브 힘 포스터"
  },
  {
    "id": "movie_420",
    "title": "사랑해 줘 사랑해 줘",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "James Hunter",
      "June White",
      "Will"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/o6SeivdAJ4ri8EbgJlIiffVN9Q.jpg",
    "posterAlt": "사랑해 줘 사랑해 줘 포스터"
  },
  {
    "id": "movie_421",
    "title": "A Perfect Ending",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "연출",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Rebecca Westridge",
      "Paris",
      "Mason Westridge"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mjwWEwE1xdbtFGCOgeXi5jvQnOU.jpg",
    "posterAlt": "A Perfect Ending 포스터"
  },
  {
    "id": "movie_422",
    "title": "떠돌이별",
    "genres": [
      "로맨스",
      "드라마",
      "음악"
    ],
    "genreIds": [
      10749,
      18,
      10402
    ],
    "tags": [
      "감동적인 음악",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Krish Kapoor",
      "Vaani Batra",
      "KV"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hQBIsi3ZfBYEayMc3GhcEmJVkss.jpg",
    "posterAlt": "떠돌이별 포스터"
  },
  {
    "id": "movie_423",
    "title": "트와일라잇",
    "genres": [
      "판타지",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      14,
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "연출",
      "세계관",
      "영상미"
    ],
    "characters": [
      "Bella Swan",
      "Edward Cullen",
      "Charlie Swan"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ryvt6cLTjHHH7Nnce3Xi5S3I533.jpg",
    "posterAlt": "트와일라잇 포스터"
  },
  {
    "id": "movie_424",
    "title": "위키드",
    "genres": [
      "드라마",
      "로맨스",
      "판타지"
    ],
    "genreIds": [
      18,
      10749,
      14
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "감동적인 음악",
      "세계관"
    ],
    "characters": [
      "Elphaba",
      "Galinda / Glinda",
      "Madame Morrible"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mCB6biaBEafLGbs1eTImqlOgZj9.jpg",
    "posterAlt": "위키드 포스터"
  },
  {
    "id": "movie_425",
    "title": "나의 잘못: 런던",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Noah",
      "Nick",
      "Ella"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/h7H6Kd9kX1dvN8FZjUy6FcNdXxQ.jpg",
    "posterAlt": "나의 잘못: 런던 포스터"
  },
  {
    "id": "movie_426",
    "title": "365일",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "감동",
      "여운"
    ],
    "characters": [
      "Laura Biel",
      "Massimo Torricelli",
      "Mario"
    ],
    "releaseYear": 2020,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ibaDBJBAvWd4J5lzfbpq1PJ6ZU1.jpg",
    "posterAlt": "365일 포스터"
  },
  {
    "id": "movie_427",
    "title": "러브",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Murphy",
      "Electra",
      "Omi"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/aF0D4MVp8ve9MT2EfEwxXlCyZQs.jpg",
    "posterAlt": "러브 포스터"
  },
  {
    "id": "movie_428",
    "title": "브레이킹 던 Part 1",
    "genres": [
      "모험",
      "판타지",
      "로맨스"
    ],
    "genreIds": [
      12,
      14,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "세계관",
      "영상미",
      "감동"
    ],
    "characters": [
      "Bella Swan",
      "Edward Cullen",
      "Jacob Black"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/osAoEqaiNO61IEkbKllJ7KlzrfW.jpg",
    "posterAlt": "브레이킹 던 Part 1 포스터"
  },
  {
    "id": "movie_429",
    "title": "탑건",
    "genres": [
      "액션",
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      28,
      18,
      10749
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "Maverick",
      "Charlie",
      "Ice"
    ],
    "releaseYear": 1986,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oqn0k8FbQ5mKXk5WbtKrvHwV5yV.jpg",
    "posterAlt": "탑건 포스터"
  },
  {
    "id": "movie_430",
    "title": "S 중독자의 고백",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "배우들의 연기력",
      "감동"
    ],
    "characters": [
      "Valérie",
      "Jaime",
      "Sonia"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cRoXNkjFA8f4cP2hTH7H7GcZcTI.jpg",
    "posterAlt": "S 중독자의 고백 포스터"
  },
  {
    "id": "movie_431",
    "title": "햄넷",
    "genres": [
      "드라마",
      "로맨스",
      "역사"
    ],
    "genreIds": [
      18,
      10749,
      36
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "감동",
      "연출"
    ],
    "characters": [
      "Agnes",
      "Will",
      "Mary"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/96ikpEmn7Uxct77x6kTIUgnldh2.jpg",
    "posterAlt": "햄넷 포스터"
  },
  {
    "id": "movie_432",
    "title": "유령 신부",
    "genres": [
      "로맨스",
      "판타지",
      "애니메이션"
    ],
    "genreIds": [
      10749,
      14,
      16
    ],
    "tags": [
      "감동적인 음악",
      "세계관",
      "감동",
      "여운"
    ],
    "characters": [
      "Victor Van Dort (voice)",
      "Corpse Bride (voice)",
      "Victoria Everglot (voice)"
    ],
    "releaseYear": 2005,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dNFskiyB2AGpKJCsh6qviPN03NQ.jpg",
    "posterAlt": "유령 신부 포스터"
  },
  {
    "id": "movie_433",
    "title": "미녀와 야수",
    "genres": [
      "로맨스",
      "가족",
      "애니메이션"
    ],
    "genreIds": [
      10749,
      10751,
      16,
      14
    ],
    "tags": [
      "감동",
      "감동적인 음악",
      "여운",
      "캐릭터 매력"
    ],
    "characters": [
      "Belle (voice)",
      "Beast (voice)",
      "Gaston (voice)"
    ],
    "releaseYear": 1991,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xN8yuKcIIQEJo1Cuk6RuZpV64Uh.jpg",
    "posterAlt": "미녀와 야수 포스터"
  },
  {
    "id": "movie_434",
    "title": "감각의 제국",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "배우들의 연기력"
    ],
    "characters": [
      "Sada Abe",
      "Kichizo Ishida",
      "Toku"
    ],
    "releaseYear": 1976,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kmGFNOo1ls61APUNtMyH8FY7YYL.jpg",
    "posterAlt": "감각의 제국 포스터"
  },
  {
    "id": "movie_435",
    "title": "쓰리 미터스 어보브 헤븐",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "H.",
      "Babi",
      "Pollo"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/nNoMfNPnvEzGADXDkP6eJAP81KB.jpg",
    "posterAlt": "쓰리 미터스 어보브 헤븐 포스터"
  },
  {
    "id": "movie_436",
    "title": "플립",
    "genres": [
      "로맨스",
      "드라마"
    ],
    "genreIds": [
      10749,
      18
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Juli Baker",
      "Bryce Loski",
      "Patsy Loski"
    ],
    "releaseYear": 2010,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cTrDvMeKGagEk07x9lwewGNofgh.jpg",
    "posterAlt": "플립 포스터"
  },
  {
    "id": "movie_437",
    "title": "몽상가들",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Matthew",
      "Isabelle",
      "Theo"
    ],
    "releaseYear": 2003,
    "posterUrl": "https://image.tmdb.org/t/p/w780/gb0vVzJlxumQrsN8Mnud647Zh0V.jpg",
    "posterAlt": "몽상가들 포스터"
  },
  {
    "id": "movie_438",
    "title": "파리에서의 마지막 탱고",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Paul",
      "Jeanne",
      "Rosa's Mother"
    ],
    "releaseYear": 1972,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qX0Chw8rJP1RwcXEVAvMCPanGR2.jpg",
    "posterAlt": "파리에서의 마지막 탱고 포스터"
  },
  {
    "id": "movie_439",
    "title": "알라딘",
    "genres": [
      "애니메이션",
      "가족",
      "모험"
    ],
    "genreIds": [
      16,
      10751,
      12,
      14,
      10749
    ],
    "tags": [
      "감동적인 음악",
      "영상미",
      "세계관",
      "감동"
    ],
    "characters": [
      "Aladdin (voice)",
      "Genie / Peddler (voice)",
      "Jasmine (voice)"
    ],
    "releaseYear": 1992,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dNqpfCTQjUDRDGsaaAP6kdVAS8M.jpg",
    "posterAlt": "알라딘 포스터"
  },
  {
    "id": "movie_440",
    "title": "엘리멘탈",
    "genres": [
      "애니메이션",
      "코미디",
      "가족"
    ],
    "genreIds": [
      16,
      35,
      10751,
      14,
      10749
    ],
    "tags": [
      "감동",
      "영상미",
      "세계관",
      "유머"
    ],
    "characters": [
      "Ember (voice)",
      "Wade (voice)",
      "Bernie (voice)"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/w7eApyAshbepBnDyYRjSeGyRHi2.jpg",
    "posterAlt": "엘리멘탈 포스터"
  },
  {
    "id": "movie_441",
    "title": "내겐 너무 아찔한 그녀",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "액션",
      "배우들의 연기력",
      "유머",
      "캐릭터 매력"
    ],
    "characters": [
      "Matthew Kidman",
      "Danielle",
      "Kelly"
    ],
    "releaseYear": 2004,
    "posterUrl": "https://image.tmdb.org/t/p/w780/xwZJo5B48TdkbHS1V0GLWGbtEX6.jpg",
    "posterAlt": "내겐 너무 아찔한 그녀 포스터"
  },
  {
    "id": "movie_442",
    "title": "스턴트맨",
    "genres": [
      "액션",
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      28,
      35,
      10749
    ],
    "tags": [
      "액션",
      "유머",
      "몰입감",
      "캐릭터 매력"
    ],
    "characters": [
      "Colt Seavers",
      "Jody Moreno",
      "Tom Ryder"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/aUZ176q7ldMaPLYVnmaFWK4CApE.jpg",
    "posterAlt": "스턴트맨 포스터"
  },
  {
    "id": "movie_443",
    "title": "버진 테리토리",
    "genres": [
      "모험",
      "액션",
      "코미디"
    ],
    "genreIds": [
      12,
      28,
      35,
      10749
    ],
    "tags": [
      "유머",
      "액션",
      "몰입감",
      "캐릭터 매력"
    ],
    "characters": [
      "Lorenzo",
      "Pampinea",
      "Elissa"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zofWP7ZKhoVTh2VUltaDo4LRQXc.jpg",
    "posterAlt": "버진 테리토리 포스터"
  },
  {
    "id": "movie_444",
    "title": "친구와 연인사이",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "유머",
      "캐릭터 매력",
      "감동",
      "여운"
    ],
    "characters": [
      "Emma Kurtzman",
      "Adam Franklin",
      "Alvin Franklin"
    ],
    "releaseYear": 2011,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yxyxPMIyx1swMuJ5T68kEf51KcC.jpg",
    "posterAlt": "친구와 연인사이 포스터"
  },
  {
    "id": "movie_445",
    "title": "알라딘",
    "genres": [
      "모험",
      "판타지",
      "로맨스"
    ],
    "genreIds": [
      12,
      14,
      10749,
      10751
    ],
    "tags": [
      "액션",
      "감동",
      "감동적인 음악",
      "영상미"
    ],
    "characters": [
      "Genie / Mariner",
      "Aladdin",
      "Jasmine"
    ],
    "releaseYear": 2019,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hvoi0h5hX7cKjatXvbc3gYqT1Xw.jpg",
    "posterAlt": "알라딘 포스터"
  },
  {
    "id": "movie_446",
    "title": "Sidelined: The QB and Me",
    "genres": [
      "코미디",
      "로맨스"
    ],
    "genreIds": [
      35,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "유머",
      "캐릭터 매력",
      "감동"
    ],
    "characters": [
      "Dallas Bryan",
      "Drayton Lahey",
      "Nathan Bryan"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mSL6truNrWP1Bn9ng1rN0SkMI4f.jpg",
    "posterAlt": "Sidelined: The QB and Me 포스터"
  },
  {
    "id": "movie_447",
    "title": "빌로우 허",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "감동",
      "연출",
      "배우들의 연기력",
      "여운"
    ],
    "characters": [
      "Dallas",
      "Jasmine",
      "Rile"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5twlT43Kt18MoUCqYgfMqppVXfa.jpg",
    "posterAlt": "빌로우 허 포스터"
  },
  {
    "id": "movie_448",
    "title": "애프터: 그 후",
    "genres": [
      "드라마",
      "로맨스"
    ],
    "genreIds": [
      18,
      10749
    ],
    "tags": [
      "탄탄한 스토리",
      "배우들의 연기력",
      "감동",
      "여운"
    ],
    "characters": [
      "Tessa Young",
      "Hardin Scott",
      "Trevor Matthews"
    ],
    "releaseYear": 2020,
    "posterUrl": "https://image.tmdb.org/t/p/w780/d45gDeSa3eDpYo2Aj6AJ7SeHx0t.jpg",
    "posterAlt": "애프터: 그 후 포스터"
  },
  {
    "id": "movie_449",
    "title": "신데렐라",
    "genres": [
      "로맨스",
      "판타지",
      "가족"
    ],
    "genreIds": [
      10749,
      14,
      10751,
      18
    ],
    "tags": [
      "액션",
      "감동적인 음악",
      "영상미",
      "OST"
    ],
    "characters": [
      "Cinderella",
      "Stepmother, Lady Tremaine",
      "Prince"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/3yNm2SdzdcXYXv8D7cS9RV5H6DG.jpg",
    "posterAlt": "신데렐라 포스터"
  },
  {
    "id": "movie_450",
    "title": "리디밍 러브",
    "genres": [
      "로맨스",
      "드라마",
      "서부"
    ],
    "genreIds": [
      10749,
      18,
      37
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "OST",
      "감동"
    ],
    "characters": [
      "Angel",
      "Michael",
      "Duke"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/fiwiBgJNkRoDA1snWnPNxXVv4R.jpg",
    "posterAlt": "리디밍 러브 포스터"
  },
  {
    "id": "movie_451",
    "title": "백룸",
    "genres": [
      "공포",
      "미스터리",
      "SF"
    ],
    "genreIds": [
      27,
      9648,
      878
    ],
    "tags": [
      "반전",
      "탄탄한 스토리"
    ],
    "characters": [
      "Clark",
      "Mary",
      "Phil"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/c3Cb7h4ecFsGfUM02KF638kbbtC.jpg",
    "posterAlt": "백룸 포스터"
  },
  {
    "id": "movie_452",
    "title": "프로젝트 헤일메리",
    "genres": [
      "SF",
      "모험"
    ],
    "genreIds": [
      878,
      12
    ],
    "tags": [
      "탄탄한 스토리",
      "여운",
      "감동"
    ],
    "characters": [
      "Ryland Grace",
      "Eva Stratt",
      "Rocky (voice)"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/qqGpVVZk2KD1lAvccgTU4Z6nh1H.jpg",
    "posterAlt": "프로젝트 헤일메리 포스터"
  },
  {
    "id": "movie_453",
    "title": "아이언 렁",
    "genres": [
      "공포",
      "미스터리",
      "SF"
    ],
    "genreIds": [
      27,
      9648,
      878
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Simon",
      "Ava",
      "David"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/sIwakdbMGS1krtgendTWpxTY9Hw.jpg",
    "posterAlt": "아이언 렁 포스터"
  },
  {
    "id": "movie_454",
    "title": "아바타: 불과 재",
    "genres": [
      "SF",
      "모험",
      "판타지"
    ],
    "genreIds": [
      878,
      12,
      14
    ],
    "tags": [
      "감동",
      "세계관",
      "영상미"
    ],
    "characters": [
      "Jake",
      "Neytiri",
      "Kiri"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/l18o0AK18KS118tWeROOKYkF0ng.jpg",
    "posterAlt": "아바타: 불과 재 포스터"
  },
  {
    "id": "movie_455",
    "title": "듄: 파트 2",
    "genres": [
      "SF",
      "모험"
    ],
    "genreIds": [
      878,
      12
    ],
    "tags": [
      "탄탄한 스토리"
    ],
    "characters": [
      "Paul Atreides",
      "Chani",
      "Jessica"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8AsDR2o5AC3V8Jmj6JH6cpta7dz.jpg",
    "posterAlt": "듄: 파트 2 포스터"
  },
  {
    "id": "movie_456",
    "title": "에이리언",
    "genres": [
      "공포",
      "SF"
    ],
    "genreIds": [
      27,
      878
    ],
    "tags": [
      "공포",
      "SF"
    ],
    "characters": [
      "Dallas",
      "Ripley",
      "Lambert"
    ],
    "releaseYear": 1979,
    "posterUrl": "https://image.tmdb.org/t/p/w780/k3m1RdlYUlCx51PxxNMlmbm7QSk.jpg",
    "posterAlt": "에이리언 포스터"
  },
  {
    "id": "movie_457",
    "title": "판타스틱 4: 새로운 출발",
    "genres": [
      "SF",
      "모험",
      "액션"
    ],
    "genreIds": [
      878,
      12,
      28
    ],
    "tags": [
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Reed Richards / Mister Fantastic",
      "Sue Storm / Invisible Woman",
      "Ben Grimm / The Thing"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vXvcMeUL6dGr9iBhNOMG3SPRHGA.jpg",
    "posterAlt": "판타스틱 4: 새로운 출발 포스터"
  },
  {
    "id": "movie_458",
    "title": "아이언맨",
    "genres": [
      "액션",
      "SF",
      "모험"
    ],
    "genreIds": [
      28,
      878,
      12
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tony Stark",
      "Rhodey",
      "Obadiah Stane"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ziReGUV3xURsWmcmsn2GOunPc0L.jpg",
    "posterAlt": "아이언맨 포스터"
  },
  {
    "id": "movie_459",
    "title": "브라이드!",
    "genres": [
      "SF",
      "공포",
      "판타지"
    ],
    "genreIds": [
      878,
      27,
      14
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "감동적인 음악",
      "영상미"
    ],
    "characters": [
      "Ida / The Bride / Mary Shelley",
      "Frank",
      "Jake Wiles"
    ],
    "releaseYear": 2026,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ftIYdV8IEE4n8odMv7FLam9VDVy.jpg",
    "posterAlt": "브라이드! 포스터"
  },
  {
    "id": "movie_460",
    "title": "베놈: 라스트 댄스",
    "genres": [
      "SF",
      "액션",
      "모험"
    ],
    "genreIds": [
      878,
      28,
      12
    ],
    "tags": [
      "연출",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Eddie Brock / Venom",
      "Strickland",
      "Dr. Teddy Paine"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ptfoRD0MmL8Ry0iBVccYbqoN9Xc.jpg",
    "posterAlt": "베놈: 라스트 댄스 포스터"
  },
  {
    "id": "movie_461",
    "title": "어벤져스: 에이지 오브 울트론",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tony Stark / Iron Man",
      "Thor",
      "Bruce Banner / Hulk"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/y8pY5MIzpPAnF5vYUNm1tw1AzL3.jpg",
    "posterAlt": "어벤져스: 에이지 오브 울트론 포스터"
  },
  {
    "id": "movie_462",
    "title": "마스터 돌프",
    "genres": [
      "액션",
      "판타지",
      "SF"
    ],
    "genreIds": [
      28,
      14,
      878
    ],
    "tags": [
      "세계관",
      "액션",
      "몰입감",
      "영상미"
    ],
    "characters": [
      "He-Man",
      "Skeletor",
      "Gwildor"
    ],
    "releaseYear": 1987,
    "posterUrl": "https://image.tmdb.org/t/p/w780/gaUecXFd31V68yOTJPJYaB9YhAf.jpg",
    "posterAlt": "마스터 돌프 포스터"
  },
  {
    "id": "movie_463",
    "title": "스파이더맨 3",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Spider-Man / Peter Parker",
      "Mary Jane Watson",
      "New Goblin / Harry Osborn"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/9atb6Nn8TRGxfwROJGuzOD24GNl.jpg",
    "posterAlt": "스파이더맨 3 포스터"
  },
  {
    "id": "movie_464",
    "title": "아이언맨 3",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Tony Stark",
      "Pepper Potts",
      "Colonel James Rhodes"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/5aHoACZhLJR95uQN4Hd2k6swUZq.jpg",
    "posterAlt": "아이언맨 3 포스터"
  },
  {
    "id": "movie_465",
    "title": "모탈 컴뱃 2",
    "genres": [
      "액션",
      "판타지",
      "SF"
    ],
    "genreIds": [
      28,
      14,
      878
    ],
    "tags": [
      "액션",
      "세계관",
      "몰입감",
      "영상미"
    ],
    "characters": [
      "Liu Kang",
      "Kitana",
      "Raiden"
    ],
    "releaseYear": 1997,
    "posterUrl": "https://image.tmdb.org/t/p/w780/ttryglcY2osWZE3sRYBf3ewTZsW.jpg",
    "posterAlt": "모탈 컴뱃 2 포스터"
  },
  {
    "id": "movie_466",
    "title": "어메이징 스파이더맨",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Spider-Man / Peter Parker",
      "Gwen Stacy",
      "The Lizard / Dr. Curt Connors"
    ],
    "releaseYear": 2012,
    "posterUrl": "https://image.tmdb.org/t/p/w780/a1Kup5VnmxjAHnsT3Sz7RtrC9UU.jpg",
    "posterAlt": "어메이징 스파이더맨 포스터"
  },
  {
    "id": "movie_467",
    "title": "스타워즈 에피소드 8: 라스트 제다이",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Luke Skywalker / Dobbu Scay (voice)",
      "Leia Organa",
      "Kylo Ren"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zRvMTCzUVnkdW9lno9HQwrigWSr.jpg",
    "posterAlt": "스타워즈 에피소드 8: 라스트 제다이 포스터"
  },
  {
    "id": "movie_468",
    "title": "썬더볼츠*",
    "genres": [
      "액션",
      "SF",
      "모험"
    ],
    "genreIds": [
      28,
      878,
      12
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Yelena Belova",
      "Bucky Barnes",
      "Valentina Allegra de Fontaine"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iTX4O9gb8Jn0F5N5WgYnbIopdnP.jpg",
    "posterAlt": "썬더볼츠* 포스터"
  },
  {
    "id": "movie_469",
    "title": "퍼시픽 림",
    "genres": [
      "액션",
      "SF",
      "모험"
    ],
    "genreIds": [
      28,
      878,
      12
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Raleigh Becket",
      "Mako Mori",
      "Stacker Pentecost"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/BWJhHHqeW5oCRvqLXF5twAFAga.jpg",
    "posterAlt": "퍼시픽 림 포스터"
  },
  {
    "id": "movie_470",
    "title": "가디언즈 오브 갤럭시 Vol. 3",
    "genres": [
      "SF",
      "모험",
      "액션"
    ],
    "genreIds": [
      878,
      12,
      28
    ],
    "tags": [
      "감동",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Peter Quill / Star-Lord",
      "Gamora",
      "Drax"
    ],
    "releaseYear": 2023,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zK0FTsXvkWVS3yubZkbenbAFcnY.jpg",
    "posterAlt": "가디언즈 오브 갤럭시 Vol. 3 포스터"
  },
  {
    "id": "movie_471",
    "title": "캡틴 아메리카: 시빌 워",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Steve Rogers / Captain America",
      "Tony Stark / Iron Man",
      "Natasha Romanoff / Black Widow"
    ],
    "releaseYear": 2016,
    "posterUrl": "https://image.tmdb.org/t/p/w780/vaMRzME3Dt73robEjOtDw4SPJGA.jpg",
    "posterAlt": "캡틴 아메리카: 시빌 워 포스터"
  },
  {
    "id": "movie_472",
    "title": "고질라 X 콩: 뉴 엠파이어",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Ilene Andrews",
      "Bernie Hayes",
      "Trapper"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4z1VMmlxHrziG45901esjB4dpIa.jpg",
    "posterAlt": "고질라 X 콩: 뉴 엠파이어 포스터"
  },
  {
    "id": "movie_473",
    "title": "인크레더블 헐크",
    "genres": [
      "SF",
      "액션",
      "모험"
    ],
    "genreIds": [
      878,
      28,
      12
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Bruce Banner",
      "Betty Ross",
      "Emil Blonsky"
    ],
    "releaseYear": 2008,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hKoPe6G1piR73G1Lj9dHd5AG1b.jpg",
    "posterAlt": "인크레더블 헐크 포스터"
  },
  {
    "id": "movie_474",
    "title": "2001 스페이스 오디세이",
    "genres": [
      "SF",
      "미스터리",
      "모험"
    ],
    "genreIds": [
      878,
      9648,
      12
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "반전"
    ],
    "characters": [
      "Dr. David Bowman",
      "Dr. Frank Poole",
      "Dr. Heywood Floyd"
    ],
    "releaseYear": 1968,
    "posterUrl": "https://image.tmdb.org/t/p/w780/2qJjH5mYNlGPdVrPqfEq1J6Mgb4.jpg",
    "posterAlt": "2001 스페이스 오디세이 포스터"
  },
  {
    "id": "movie_475",
    "title": "스타워즈 에피소드 5: 제국의 역습",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Luke Skywalker",
      "Han Solo",
      "Princess Leia"
    ],
    "releaseYear": 1980,
    "posterUrl": "https://image.tmdb.org/t/p/w780/icaO5w8uLVm4JxMew71JJrQE2YX.jpg",
    "posterAlt": "스타워즈 에피소드 5: 제국의 역습 포스터"
  },
  {
    "id": "movie_476",
    "title": "어메이징 스파이더맨 2",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Spider-Man / Peter Parker",
      "Gwen Stacy",
      "Electro / Max Dillon"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/eYaFLrKuEdzrGw6XG5ZTVciH28v.jpg",
    "posterAlt": "어메이징 스파이더맨 2 포스터"
  },
  {
    "id": "movie_477",
    "title": "트론: 아레스",
    "genres": [
      "SF",
      "모험",
      "액션"
    ],
    "genreIds": [
      878,
      12,
      28
    ],
    "tags": [
      "세계관",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Ares",
      "Eve Kim",
      "Julian Dillinger"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/4nJcUMpWgnIPZPJ13TWKRxAdY9U.jpg",
    "posterAlt": "트론: 아레스 포스터"
  },
  {
    "id": "movie_478",
    "title": "가디언즈 오브 갤럭시 Vol. 2",
    "genres": [
      "SF",
      "모험",
      "액션"
    ],
    "genreIds": [
      878,
      12,
      28
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Peter Quill / Star-Lord",
      "Gamora",
      "Drax"
    ],
    "releaseYear": 2017,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uDuwGhQgffd5GQ695oUfy5oZGqP.jpg",
    "posterAlt": "가디언즈 오브 갤럭시 Vol. 2 포스터"
  },
  {
    "id": "movie_479",
    "title": "28년 후",
    "genres": [
      "공포",
      "스릴러",
      "SF"
    ],
    "genreIds": [
      27,
      53,
      878
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Isla",
      "Jamie",
      "Spike"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zRo90O0bTKJem1aDgVa6Sm0gthE.jpg",
    "posterAlt": "28년 후 포스터"
  },
  {
    "id": "movie_480",
    "title": "프레이",
    "genres": [
      "스릴러",
      "액션",
      "SF"
    ],
    "genreIds": [
      53,
      28,
      878
    ],
    "tags": [
      "긴장감",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Naru",
      "Taabe",
      "Aruka"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dBcot5vSnmn3XeAg1c4PZM63G5x.jpg",
    "posterAlt": "프레이 포스터"
  },
  {
    "id": "movie_481",
    "title": "맨 오브 스틸",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "감동",
      "세계관",
      "액션"
    ],
    "characters": [
      "Clark Kent / Superman / Kal-El",
      "Lois Lane",
      "Jor-El"
    ],
    "releaseYear": 2013,
    "posterUrl": "https://image.tmdb.org/t/p/w780/8Qx9fp2lZJU4v67jks6MmOMBCQg.jpg",
    "posterAlt": "맨 오브 스틸 포스터"
  },
  {
    "id": "movie_482",
    "title": "스타워즈 에피소드 1: 보이지 않는 위험",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Qui-Gon Jinn",
      "Obi-Wan Kenobi",
      "Padmé Amidala"
    ],
    "releaseYear": 1999,
    "posterUrl": "https://image.tmdb.org/t/p/w780/pt7oxFkvQFzXD0ByCe1uJumL6vD.jpg",
    "posterAlt": "스타워즈 에피소드 1: 보이지 않는 위험 포스터"
  },
  {
    "id": "movie_483",
    "title": "퓨리오사: 매드맥스 사가",
    "genres": [
      "액션",
      "SF",
      "모험"
    ],
    "genreIds": [
      28,
      878,
      12
    ],
    "tags": [
      "긴장감",
      "감동적인 음악",
      "OST",
      "몰입감"
    ],
    "characters": [
      "Furiosa",
      "Dementus",
      "Praetorian Jack"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zaUFDdJidS4Nyyd6jb2Ok3Kq4Vo.jpg",
    "posterAlt": "퓨리오사: 매드맥스 사가 포스터"
  },
  {
    "id": "movie_484",
    "title": "엑스맨: 데이즈 오브 퓨처 패스트",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Logan / Wolverine",
      "Charles Xavier",
      "Erik Lehnsherr"
    ],
    "releaseYear": 2014,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zm5zanw86TX2T7qJNTKilL3x3S8.jpg",
    "posterAlt": "엑스맨: 데이즈 오브 퓨처 패스트 포스터"
  },
  {
    "id": "movie_485",
    "title": "램페이지",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Davis Okoye",
      "Dr. Kate Caldwell",
      "Claire Wyden"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/uJeetKzCUEFfne2LRHlr6paxxKk.jpg",
    "posterAlt": "램페이지 포스터"
  },
  {
    "id": "movie_486",
    "title": "미키 17",
    "genres": [
      "SF",
      "코미디",
      "모험"
    ],
    "genreIds": [
      878,
      35,
      12
    ],
    "tags": [
      "반전",
      "탄탄한 스토리",
      "세계관",
      "유머"
    ],
    "characters": [
      "Mickey Barnes",
      "Nasha",
      "Timo"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/mH7QnJDxQibVZw0M66IBZbsw2O6.jpg",
    "posterAlt": "미키 17 포스터"
  },
  {
    "id": "movie_487",
    "title": "프리미티브 워",
    "genres": [
      "액션",
      "공포",
      "전쟁"
    ],
    "genreIds": [
      28,
      27,
      10752,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Colonel Jericho",
      "Sofia",
      "Baker"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/rPFXcEp6UNLJrjktuixG0aesNwe.jpg",
    "posterAlt": "프리미티브 워 포스터"
  },
  {
    "id": "movie_488",
    "title": "블랙 위도우",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "연출",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Natasha Romanoff / Black Widow",
      "Yelena Belova",
      "Melina"
    ],
    "releaseYear": 2021,
    "posterUrl": "https://image.tmdb.org/t/p/w780/oPMAUqhwQf9mLCU5xEGPv33lAJO.jpg",
    "posterAlt": "블랙 위도우 포스터"
  },
  {
    "id": "movie_489",
    "title": "블랙 팬서",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "T'Challa / Black Panther",
      "Erik Killmonger",
      "Nakia"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/iRkknrX0rRxZHSL79W2Rax0EFsL.jpg",
    "posterAlt": "블랙 팬서 포스터"
  },
  {
    "id": "movie_490",
    "title": "2012",
    "genres": [
      "액션",
      "모험",
      "SF"
    ],
    "genreIds": [
      28,
      12,
      878
    ],
    "tags": [
      "탄탄한 스토리",
      "세계관",
      "몰입감",
      "액션"
    ],
    "characters": [
      "Jackson Curtis",
      "Kate Curtis",
      "Adrian Helmsley"
    ],
    "releaseYear": 2009,
    "posterUrl": "https://image.tmdb.org/t/p/w780/kdyhLTaforuBk0CjnACiMXuj7zd.jpg",
    "posterAlt": "2012 포스터"
  },
  {
    "id": "movie_491",
    "title": "쥬라기 월드",
    "genres": [
      "모험",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      12,
      878,
      53
    ],
    "tags": [
      "감동적인 음악",
      "OST",
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Owen",
      "Claire",
      "Masrani"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/zJ5pZvsd5I8HYnRRAvLE2tSxtOW.jpg",
    "posterAlt": "쥬라기 월드 포스터"
  },
  {
    "id": "movie_492",
    "title": "쥬라기 월드: 도미니언",
    "genres": [
      "모험",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      12,
      878,
      53
    ],
    "tags": [
      "몰입감",
      "긴장감"
    ],
    "characters": [
      "Owen Grady",
      "Claire Dearing",
      "Ellie Sattler"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/upGiyJeCbG61899TXiY01mxdjEF.jpg",
    "posterAlt": "쥬라기 월드: 도미니언 포스터"
  },
  {
    "id": "movie_493",
    "title": "마녀 2",
    "genres": [
      "액션",
      "미스터리",
      "스릴러"
    ],
    "genreIds": [
      28,
      9648,
      53,
      878
    ],
    "tags": [
      "액션",
      "몰입감",
      "반전",
      "탄탄한 스토리"
    ],
    "characters": [
      "Girl",
      "Kyung-hee",
      "Jo-hyun"
    ],
    "releaseYear": 2022,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cah6iIYQBctvCmBjsKGb1NCiygr.jpg",
    "posterAlt": "마녀 2 포스터"
  },
  {
    "id": "movie_494",
    "title": "베놈",
    "genres": [
      "SF",
      "액션"
    ],
    "genreIds": [
      878,
      28
    ],
    "tags": [
      "액션",
      "몰입감"
    ],
    "characters": [
      "Eddie Brock / Venom",
      "Anne Weying",
      "Carlton Drake / Riot"
    ],
    "releaseYear": 2018,
    "posterUrl": "https://image.tmdb.org/t/p/w780/x4ojC59pYfPlAP4mmy2LSkCCuK2.jpg",
    "posterAlt": "베놈 포스터"
  },
  {
    "id": "movie_495",
    "title": "나는 전설이다",
    "genres": [
      "드라마",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      18,
      878,
      53
    ],
    "tags": [
      "탄탄한 스토리",
      "감동적인 음악",
      "세계관",
      "OST"
    ],
    "characters": [
      "Robert Neville",
      "Anna Montez",
      "Ethan"
    ],
    "releaseYear": 2007,
    "posterUrl": "https://image.tmdb.org/t/p/w780/yvaDfiS0DzsHDWBjlqxo6CPgDVJ.jpg",
    "posterAlt": "나는 전설이다 포스터"
  },
  {
    "id": "movie_496",
    "title": "컴패니언",
    "genres": [
      "공포",
      "SF",
      "스릴러"
    ],
    "genreIds": [
      27,
      878,
      53
    ],
    "tags": [
      "긴장감",
      "몰입감"
    ],
    "characters": [
      "Iris",
      "Josh",
      "Patrick"
    ],
    "releaseYear": 2025,
    "posterUrl": "https://image.tmdb.org/t/p/w780/dq7CEYFCvQPfYIpAXOvJr3w6VLY.jpg",
    "posterAlt": "컴패니언 포스터"
  },
  {
    "id": "movie_497",
    "title": "채피",
    "genres": [
      "범죄",
      "액션",
      "SF"
    ],
    "genreIds": [
      80,
      28,
      878
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "액션",
      "몰입감"
    ],
    "characters": [
      "Chappie",
      "Deon Wilson",
      "Vincent Moore"
    ],
    "releaseYear": 2015,
    "posterUrl": "https://image.tmdb.org/t/p/w780/hcGym66raZDzDIGjdkVDoQZvLks.jpg",
    "posterAlt": "채피 포스터"
  },
  {
    "id": "movie_498",
    "title": "에이리언: 로물루스",
    "genres": [
      "공포",
      "SF"
    ],
    "genreIds": [
      27,
      878
    ],
    "tags": [
      "감동적인 음악",
      "OST"
    ],
    "characters": [
      "Rain",
      "Andy",
      "Tyler"
    ],
    "releaseYear": 2024,
    "posterUrl": "https://image.tmdb.org/t/p/w780/AmWTYg3RCMv7fbQxwCqrxiaUhkc.jpg",
    "posterAlt": "에이리언: 로물루스 포스터"
  },
  {
    "id": "movie_499",
    "title": "스타워즈 에피소드 3: 시스의 복수",
    "genres": [
      "모험",
      "액션",
      "SF"
    ],
    "genreIds": [
      12,
      28,
      878
    ],
    "tags": [
      "액션",
      "영상미",
      "몰입감"
    ],
    "characters": [
      "Anakin Skywalker / Darth Vader",
      "Obi-Wan Kenobi",
      "Padmé Amidala"
    ],
    "releaseYear": 2005,
    "posterUrl": "https://image.tmdb.org/t/p/w780/cKrtSemvrt2tOeHLgxCWauJ3URr.jpg",
    "posterAlt": "스타워즈 에피소드 3: 시스의 복수 포스터"
  },
  {
    "id": "movie_500",
    "title": "블레이드 러너",
    "genres": [
      "SF",
      "드라마",
      "스릴러"
    ],
    "genreIds": [
      878,
      18,
      53
    ],
    "tags": [
      "긴장감",
      "탄탄한 스토리",
      "여운",
      "배우들의 연기력"
    ],
    "characters": [
      "Deckard",
      "Batty",
      "Rachael"
    ],
    "releaseYear": 1982,
    "posterUrl": "https://image.tmdb.org/t/p/w780/6yXqNiVIoJcMhio10Nkb5QMNeh8.jpg",
    "posterAlt": "블레이드 러너 포스터"
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
