import random
import tkinter as tk

CELL = 20
COLS = 30
ROWS = 20
WIDTH = CELL * COLS
HEIGHT = CELL * ROWS
START_DELAY = 150
MIN_DELAY = 60

DIRECTIONS = {
    "Up": (0, -1),
    "Down": (0, 1),
    "Left": (-1, 0),
    "Right": (1, 0),
    "w": (0, -1),
    "s": (0, 1),
    "a": (-1, 0),
    "d": (1, 0),
}


class SnakeGame:
    def __init__(self, root):
        self.root = root
        root.title("뱀게임")
        root.resizable(False, False)

        self.score_label = tk.Label(root, text="", font=("Malgun Gothic", 12))
        self.score_label.pack()
        self.canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="#1e1e1e", highlightthickness=0)
        self.canvas.pack()

        root.bind("<KeyPress>", self.on_key)
        self.best = 0
        self.reset()

    def reset(self):
        self.snake = [(COLS // 2 - i, ROWS // 2) for i in range(3)]
        self.direction = (1, 0)
        self.next_direction = self.direction
        self.score = 0
        self.delay = START_DELAY
        self.game_over = False
        self.paused = False
        self.food = self.spawn_food()
        self.update_score()
        self.tick()

    def spawn_food(self):
        free = [(x, y) for x in range(COLS) for y in range(ROWS) if (x, y) not in self.snake]
        return random.choice(free) if free else None

    def update_score(self):
        self.score_label.config(text=f"점수: {self.score}   최고 점수: {self.best}")

    def on_key(self, event):
        key = event.keysym
        if key in ("r", "R") and self.game_over:
            self.reset()
            return
        if key == "space" and not self.game_over:
            self.paused = not self.paused
            self.draw()
            return
        if key in DIRECTIONS:
            dx, dy = DIRECTIONS[key]
            cx, cy = self.direction
            # 정반대 방향으로는 바로 회전할 수 없음
            if (dx, dy) != (-cx, -cy):
                self.next_direction = (dx, dy)

    def tick(self):
        if self.game_over:
            return
        if not self.paused:
            self.step()
        if not self.game_over:
            self.draw()
            self.job = self.root.after(self.delay, self.tick)

    def step(self):
        self.direction = self.next_direction
        hx, hy = self.snake[0]
        new_head = (hx + self.direction[0], hy + self.direction[1])

        eating = new_head == self.food
        body = self.snake if eating else self.snake[:-1]
        if not (0 <= new_head[0] < COLS and 0 <= new_head[1] < ROWS) or new_head in body:
            self.end_game()
            return

        self.snake.insert(0, new_head)
        if eating:
            self.score += 10
            self.best = max(self.best, self.score)
            self.delay = max(MIN_DELAY, self.delay - 3)
            self.food = self.spawn_food()
            self.update_score()
            if self.food is None:
                self.end_game(won=True)
        else:
            self.snake.pop()

    def end_game(self, won=False):
        self.game_over = True
        self.draw()
        msg = "승리!" if won else "게임 오버"
        self.canvas.create_text(WIDTH // 2, HEIGHT // 2 - 15, text=msg, fill="white",
                                font=("Malgun Gothic", 28, "bold"))
        self.canvas.create_text(WIDTH // 2, HEIGHT // 2 + 25, text="R 키를 눌러 다시 시작",
                                fill="#cccccc", font=("Malgun Gothic", 14))

    def draw(self):
        self.canvas.delete("all")
        if self.food:
            fx, fy = self.food
            self.canvas.create_oval(fx * CELL + 2, fy * CELL + 2, (fx + 1) * CELL - 2, (fy + 1) * CELL - 2,
                                    fill="#e74c3c", outline="")
        for i, (x, y) in enumerate(self.snake):
            color = "#2ecc71" if i == 0 else "#27ae60"
            self.canvas.create_rectangle(x * CELL + 1, y * CELL + 1, (x + 1) * CELL - 1, (y + 1) * CELL - 1,
                                         fill=color, outline="")
        if self.paused:
            self.canvas.create_text(WIDTH // 2, HEIGHT // 2, text="일시정지", fill="white",
                                    font=("Malgun Gothic", 28, "bold"))


if __name__ == "__main__":
    root = tk.Tk()
    SnakeGame(root)
    root.mainloop()
