// 프로젝트 목록 데이터. 프로젝트를 추가하거나 수정할 때는 이 파일만 고치면 된다.
// demo: 브라우저에서 바로 실행해 볼 수 있는 링크 (선택)
// source: 소스 코드 링크 (선택)
window.PROJECTS = [
  {
    title: "테트리스",
    description: "HTML5 Canvas로 만든 브라우저 테트리스. 블록 낙하 위치 미리보기, 다음 블록 표시, 레벨에 따른 속도 증가를 지원합니다.",
    tech: ["HTML5", "CSS3", "JavaScript", "Canvas"],
    demo: { label: "데모 실행", url: "demos/tetris.html" }
  },
  {
    title: "뱀게임",
    description: "Python tkinter로 만든 데스크톱 뱀게임. 점수와 최고 점수 표시, 먹이를 먹을수록 빨라지는 속도를 구현했습니다. 내려받아 python snake.py로 실행합니다.",
    tech: ["Python", "tkinter"],
    source: { label: "소스 보기", url: "demos/snake.py" }
  }
];
