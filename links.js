// ✏️ 선생님들 링크는 여기만 고치면 돼요!
// - name   : 물건 아래에 보이는 이름
// - teacher: 만든 선생님 이름
// - desc   : 공책에 나오는 설명
// - url    : 선생님이 주신 링크 (비워두면 "곧 열려요"로 보여요)
// - object : 책상 위 물건 모양 (book 책 / lamp 스탠드 / mug 머그컵 / plant 화분)

window.DESK_LINKS = [
  {
    object: "book",
    name: "고전 읽기",
    teacher: "○○ 선생님",
    desc: "오래된 책 속 한 문장을 오늘의 내 마음에 가만히 비춰 봐요.",
    url: ""
  },
  {
    object: "lamp",
    name: "오늘의 마음",
    teacher: "△△ 선생님",
    desc: "지금 내 기분은 어떤 색일까요? 스탠드 불빛 아래에서 마음을 골라 봐요.",
    url: ""
  },
  {
    object: "mug",
    name: "쉬어가기",
    teacher: "□□ 선생님",
    desc: "따뜻한 차 한 잔처럼, 잠깐 숨을 고르는 시간이에요.",
    url: ""
  },
  {
    object: "plant",
    name: "한 줄 쓰기",
    teacher: "◇◇ 선생님",
    desc: "오늘의 나를 한 줄로 적어 봐요. 작은 화분처럼 조금씩 자라요.",
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
window.BOOKMARK_URL = "";

// 📚 어떤 책갈피를 골라도 추천 도서는 무조건 "어린 왕자"예요.
window.BOOK_RESULT = {
  title: "어린 왕자",
  author: "앙투안 드 생텍쥐페리",
  image: "assets/little-prince-recommend.jpg"
};

// 🔁 설문 링크를 같은 창에서 열기 (true 권장). 설문이 끝나면 우리 사이트로 돌아오게 하려면 true로 두세요.
// 설문 도구의 "완료 후 이동 주소"에 아래 주소를 넣어요:  ○○.onpod.ai/?result=1
window.BOOKMARK_SAME_TAB = true;
