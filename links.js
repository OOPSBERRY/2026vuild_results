// ✏️ 선생님들 링크는 여기만 고치면 돼요!
// - name   : 물건 아래에 보이는 이름
// - teacher: 만든 선생님 이름
// - desc   : 공책에 나오는 설명
// - url    : 선생님이 주신 링크 (비워두면 "곧 열려요"로 보여요)
// - object : 책상 위 물건 모양 (book 책 / lamp 스탠드 / mug 머그컵 / plant 화분)

window.DESK_LINKS = [
  {
    object: "book",
    name: "책갈피 찾기",
    teacher: "○○ 선생님",
    desc: "나에게 어울리는 책갈피를 찾고, 오늘의 책을 만나 봐요.",
    url: ""
  },
  {
    object: "lamp",
    name: "독서하러 가자",
    teacher: "△△ 선생님",
    desc: "한 권의 책과 함께 오늘의 독서를 시작해요.",
    url: ""
  },
  {
    object: "mug",
    name: "색다른 경험",
    teacher: "□□ 선생님",
    desc: "책 밖으로 나가는 색다른 경험을 해 봐요.",
    url: ""
  },
  {
    object: "plant",
    name: "고전 단톡방",
    teacher: "◇◇ 선생님",
    desc: "고전 이야기를 함께 나누는 단톡방이에요.",
    url: ""
  }
];

// 🖼️ 실사 이미지를 쓰고 싶을 때: 이미지 파일을 이 폴더에 넣고 파일 이름만 적어요.
// 비워두면 코드로 그린 나무결/벽/창밖이 쓰여요.
window.DESK_IMAGES = {
  desk: "assets/walnut-espresso.png", // 호두나무 책상 질감
  wall: "",    // 뒤쪽 벽 사진 (예: "wall.jpg")
  window: ""   // 창밖 풍경 사진 (예: "window.jpg")
};

// 📱 QR 코드가 가리킬 주소. 비워두면 지금 열린 주소가 자동으로 들어가요.
// 배포가 끝나면 ○○.onpod.ai 주소가 자동으로 QR이 돼요.
window.DESK_QR_URL = "";

// 🔖 책갈피 설문 링크 (나중에 여기에 넣어요). 비워두면 "곧 열려요"로 보여요.
window.BOOKMARK_URL = "https://book-planet-starlit-voyage.shrewdbluebell.chatgpt.site/";

// 📚 어떤 책갈피를 골라도 추천 도서는 무조건 "어린 왕자"예요.
window.BOOK_RESULT = {
  title: "어린 왕자",
  author: "앙투안 드 생텍쥐페리",
  image: "assets/little-prince-recommend.jpg"
};

// 🔁 설문 링크를 같은 창에서 열기 (true 권장). 설문이 끝나면 우리 사이트로 돌아오게 하려면 true로 두세요.
// 설문 도구의 "완료 후 이동 주소"에 아래 주소를 넣어요:  ○○.onpod.ai/?result=1
window.BOOKMARK_SAME_TAB = true;

// 👥 "만든 사람" 패널에 나오는 명단 (이름은 여기만 고치면 돼요)
window.DESK_CREDITS = [
  { role: "기획", name: "○○ 선생님" },
  { role: "책갈피 찾기", name: "△△ 선생님" },
  { role: "디자인", name: "□□ 선생님" }
];

// 📖 "독서하러 가자" 공책에 손글씨로 써지는 활동 (제목을 누르면 url로 이동해요. 링크는 나중에 여기에 넣어요)
window.READING_ACTIVITIES = [
  { title: "Book生극장", desc: "나의 선택이 이야기에 어떤 영향을 주는지 결정해보세요.", url: "" },
  { title: "고전네컷", desc: "현대적 관점으로 이야기를 이어써보세요.", url: "" },
  { title: "모두의 고전", desc: "작품 속 인물의 감정을 나만의 캐릭터와 카드로 표현해보세요.", url: "" }
];

// 🎭 "색다른 경험" 안내창의 선택지 2가지 (제목을 누르면 url로 이동해요. 링크는 나중에 여기에 넣어요)
window.EXPERIENCE_CHOICES = [
  { title: "너를 보여줘", desc: "작품 속 인물 시점의 다시보는 뮤직비디오를 확인해보세요.", url: "" },
  { title: "북커버 디자이너", desc: "나만의 책 표지를 만들어보세요.", url: "" }
];
