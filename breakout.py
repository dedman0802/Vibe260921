import math
import tkinter as tk

# ---- 게임 설정 ----
WIDTH, HEIGHT = 640, 520
HUD_H = 40                      # 상단 점수판 높이

PADDLE_W, PADDLE_H = 90, 12
PADDLE_Y = HEIGHT - 40
PADDLE_SPEED = 9                # 키보드 조작 시 프레임당 이동 픽셀

BALL_R = 8
BALL_START_SPEED = 6.0
BALL_MAX_SPEED = 12.0

BRICK_ROWS, BRICK_COLS = 6, 10
BRICK_W = WIDTH // BRICK_COLS
BRICK_H = 22
BRICK_TOP = HUD_H + 30

# 윗줄일수록 높은 점수
ROW_COLORS = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6"]
ROW_POINTS = [60, 50, 40, 30, 20, 10]

FONT = "Malgun Gothic"
FRAME_MS = 16                   # 약 60 FPS
START_LIVES = 3


class Breakout:
    def __init__(self, root):
        self.root = root
        root.title("블록깨기")
        root.resizable(False, False)

        self.canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="#1b1b2f",
                                highlightthickness=0)
        self.canvas.pack()

        self.keys = set()
        root.bind("<KeyPress>", lambda e: self.keys.add(e.keysym))
        root.bind("<KeyRelease>", lambda e: self.keys.discard(e.keysym))
        root.bind("<space>", self.on_space)
        root.bind("<p>", self.toggle_pause)
        root.bind("<P>", self.toggle_pause)
        root.bind("<r>", lambda e: self.new_game())
        root.bind("<R>", lambda e: self.new_game())
        self.canvas.bind("<Motion>", self.on_mouse)
        self.canvas.bind("<Button-1>", self.on_space)

        self.new_game()
        self.loop()

    # ---- 초기화 ----
    def new_game(self):
        self.score = 0
        self.lives = START_LIVES
        self.level = 1
        self.build_level()

    def build_level(self):
        """현재 레벨의 벽돌/패들/공을 새로 배치한다."""
        self.canvas.delete("all")
        self.state = "ready"    # ready / playing / paused / over / clear

        self.bricks = []
        for r in range(BRICK_ROWS):
            for c in range(BRICK_COLS):
                x1 = c * BRICK_W
                y1 = BRICK_TOP + r * BRICK_H
                item = self.canvas.create_rectangle(
                    x1 + 1, y1 + 1, x1 + BRICK_W - 1, y1 + BRICK_H - 1,
                    fill=ROW_COLORS[r], outline="")
                self.bricks.append({"id": item, "x1": x1, "y1": y1,
                                    "x2": x1 + BRICK_W, "y2": y1 + BRICK_H,
                                    "points": ROW_POINTS[r]})

        self.paddle_x = WIDTH / 2
        self.paddle = self.canvas.create_rectangle(0, 0, 0, 0, fill="#ecf0f1", outline="")
        self.ball = self.canvas.create_oval(0, 0, 0, 0, fill="#ffffff", outline="")
        self.reset_ball()

        self.canvas.create_rectangle(0, 0, WIDTH, HUD_H, fill="#0f0f1e", outline="")
        self.score_text = self.canvas.create_text(
            15, HUD_H / 2, anchor="w", fill="white", font=(FONT, 13, "bold"))
        self.level_text = self.canvas.create_text(
            WIDTH / 2, HUD_H / 2, fill="white", font=(FONT, 13, "bold"))
        self.lives_text = self.canvas.create_text(
            WIDTH - 15, HUD_H / 2, anchor="e", fill="#ff6b81", font=(FONT, 13, "bold"))
        self.message = self.canvas.create_text(
            WIDTH / 2, HEIGHT / 2 + 60, fill="white", justify="center",
            font=(FONT, 16, "bold"))
        self.update_hud()
        self.update_message()

    def reset_ball(self):
        """공을 패들 위에 올려놓고 대기 상태로 만든다."""
        self.state = "ready"
        self.speed = BALL_START_SPEED + (self.level - 1) * 0.7
        self.speed = min(self.speed, BALL_MAX_SPEED)
        self.ball_x = self.paddle_x
        self.ball_y = PADDLE_Y - BALL_R
        self.dx = 0.0
        self.dy = 0.0

    # ---- 입력 ----
    def on_mouse(self, event):
        if self.state in ("ready", "playing"):
            self.paddle_x = event.x

    def on_space(self, event=None):
        if self.state == "ready":
            angle = math.radians(-20)       # 살짝 비스듬하게 발사
            self.dx = self.speed * math.sin(angle)
            self.dy = -self.speed * math.cos(angle)
            self.state = "playing"
        elif self.state == "over":
            self.new_game()
        elif self.state == "clear":
            self.level += 1
            self.build_level()
        elif self.state == "paused":
            self.state = "playing"
        self.update_message()

    def toggle_pause(self, event=None):
        if self.state == "playing":
            self.state = "paused"
        elif self.state == "paused":
            self.state = "playing"
        self.update_message()

    # ---- 화면 표시 ----
    def update_hud(self):
        self.canvas.itemconfig(self.score_text, text=f"점수: {self.score}")
        self.canvas.itemconfig(self.level_text, text=f"레벨 {self.level}")
        self.canvas.itemconfig(self.lives_text, text="♥ " * self.lives)

    def update_message(self):
        texts = {
            "ready": "스페이스바 또는 클릭으로 시작\n← → 키 / 마우스로 패들 이동",
            "paused": "일시정지\nP 또는 스페이스바로 계속",
            "over": f"게임 오버!  최종 점수: {self.score}\n스페이스바 / R 로 다시 시작",
            "clear": f"레벨 {self.level} 클리어!\n스페이스바로 다음 레벨",
        }
        self.canvas.itemconfig(self.message, text=texts.get(self.state, ""))
        self.canvas.tag_raise(self.message)

    def draw(self):
        half = PADDLE_W / 2
        self.paddle_x = max(half, min(WIDTH - half, self.paddle_x))
        self.canvas.coords(self.paddle, self.paddle_x - half, PADDLE_Y,
                           self.paddle_x + half, PADDLE_Y + PADDLE_H)
        if self.state == "ready":
            self.ball_x = self.paddle_x
        self.canvas.coords(self.ball, self.ball_x - BALL_R, self.ball_y - BALL_R,
                           self.ball_x + BALL_R, self.ball_y + BALL_R)

    # ---- 게임 루프 ----
    def loop(self):
        if "Left" in self.keys:
            self.paddle_x -= PADDLE_SPEED
        if "Right" in self.keys:
            self.paddle_x += PADDLE_SPEED

        if self.state == "playing":
            self.step_ball()
        self.draw()
        self.root.after(FRAME_MS, self.loop)

    def step_ball(self):
        self.ball_x += self.dx
        self.ball_y += self.dy

        # 벽 충돌
        if self.ball_x - BALL_R < 0:
            self.ball_x = BALL_R
            self.dx = abs(self.dx)
        elif self.ball_x + BALL_R > WIDTH:
            self.ball_x = WIDTH - BALL_R
            self.dx = -abs(self.dx)
        if self.ball_y - BALL_R < HUD_H:
            self.ball_y = HUD_H + BALL_R
            self.dy = abs(self.dy)

        # 패들 충돌: 맞은 위치에 따라 반사각이 달라진다
        half = PADDLE_W / 2
        if (self.dy > 0
                and PADDLE_Y <= self.ball_y + BALL_R <= PADDLE_Y + PADDLE_H + self.dy
                and self.paddle_x - half - BALL_R <= self.ball_x <= self.paddle_x + half + BALL_R):
            offset = (self.ball_x - self.paddle_x) / half       # -1 ~ 1
            offset = max(-1.0, min(1.0, offset))
            angle = math.radians(offset * 60)
            self.dx = self.speed * math.sin(angle)
            self.dy = -self.speed * math.cos(angle)
            self.ball_y = PADDLE_Y - BALL_R

        self.check_bricks()

        # 바닥으로 떨어짐
        if self.ball_y - BALL_R > HEIGHT:
            self.lives -= 1
            self.update_hud()
            if self.lives <= 0:
                self.state = "over"
            else:
                self.reset_ball()
            self.update_message()

    def check_bricks(self):
        for brick in self.bricks:
            # 공 중심에서 벽돌까지 가장 가까운 점과의 거리로 충돌 판정
            nearest_x = max(brick["x1"], min(self.ball_x, brick["x2"]))
            nearest_y = max(brick["y1"], min(self.ball_y, brick["y2"]))
            if (self.ball_x - nearest_x) ** 2 + (self.ball_y - nearest_y) ** 2 >= BALL_R ** 2:
                continue

            # 겹친 정도가 작은 쪽 축으로 튕겨낸다
            overlap_x = min(self.ball_x + BALL_R - brick["x1"], brick["x2"] - (self.ball_x - BALL_R))
            overlap_y = min(self.ball_y + BALL_R - brick["y1"], brick["y2"] - (self.ball_y - BALL_R))
            if overlap_x < overlap_y:
                self.dx = -self.dx
            else:
                self.dy = -self.dy

            self.canvas.delete(brick["id"])
            self.bricks.remove(brick)
            self.score += brick["points"]

            # 벽돌을 깰수록 조금씩 빨라진다
            self.speed = min(self.speed + 0.08, BALL_MAX_SPEED)
            scale = self.speed / math.hypot(self.dx, self.dy)
            self.dx *= scale
            self.dy *= scale

            self.update_hud()
            if not self.bricks:
                self.state = "clear"
                self.update_message()
            return      # 한 프레임에 벽돌 하나만 처리


if __name__ == "__main__":
    root = tk.Tk()
    Breakout(root)
    root.mainloop()
