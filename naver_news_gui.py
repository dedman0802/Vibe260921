"""PyQt6 GUI 버전 네이버 뉴스 크롤러.

크롤링 로직(fetch, parse_search, parse_article, build_result)은
naver_news_crawler.py를 그대로 가져다 쓰고, 이 파일은 화면과 스레드 처리만 담당한다.

실행:
    python naver_news_gui.py

필요 패키지: PyQt6, requests, beautifulsoup4
"""
import html
import json
import sys

import requests
from PyQt6.QtCore import Qt, QThread, QUrl, pyqtSignal
from PyQt6.QtGui import QDesktopServices
from PyQt6.QtWidgets import (
    QAbstractItemView, QApplication, QDoubleSpinBox, QFileDialog, QHBoxLayout, QHeaderView,
    QLabel, QLineEdit, QMainWindow, QMessageBox, QProgressBar, QPushButton, QSpinBox,
    QSplitter, QTableWidget, QTableWidgetItem, QTextBrowser, QVBoxLayout, QWidget,
)

from naver_news_crawler import DEFAULT_URL, build_result, fetch, parse_article, parse_search, save_excel

COLUMNS = ["언론사", "제목", "게시 시각", "작성일"]


class CrawlWorker(QThread):
    """네트워크 요청은 화면이 멈추지 않도록 별도 스레드에서 실행한다."""

    status = pyqtSignal(str)
    progress = pyqtSignal(int, int)  # (완료 수, 전체 수)
    article = pyqtSignal(dict)
    failed = pyqtSignal(str)

    def __init__(self, url, limit, delay):
        super().__init__()
        self.url, self.limit, self.delay = url, limit, delay

    def run(self):
        self.status.emit("검색 결과를 불러오는 중...")
        try:
            items = parse_search(fetch(self.url))[: self.limit]
        except requests.RequestException as e:
            self.failed.emit(f"검색 결과 요청 실패: {e}")
            return
        except Exception as e:  # 예상치 못한 HTML 구조 등
            self.failed.emit(f"검색 결과 분석 실패: {e}")
            return

        total = len(items)
        if total == 0:
            self.failed.emit("기사를 찾지 못했습니다. URL을 확인하거나 네이버 페이지 구조가 바뀌었는지 확인하세요.")
            return

        self.progress.emit(0, total)
        for i, item in enumerate(items, 1):
            if self.isInterruptionRequested():
                self.status.emit("중지되었습니다.")
                return
            self.status.emit(f"[{i}/{total}] {item['title']}")
            article = {}
            if item["naver_url"]:
                self.msleep(int(self.delay * 1000))  # 서버에 부담을 주지 않도록 간격을 둔다
                try:
                    article = parse_article(fetch(item["naver_url"]))
                except requests.RequestException as e:
                    self.status.emit(f"[{i}/{total}] 본문 수집 실패: {e}")
            self.article.emit(build_result(item, article))
            self.progress.emit(i, total)
        self.status.emit(f"완료: {total}건 수집")


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("네이버 뉴스 크롤러")
        self.resize(1100, 720)
        self.results = []
        self.worker = None

        # ----- 입력 영역 -----
        self.url_edit = QLineEdit(DEFAULT_URL)
        self.url_edit.setCursorPosition(0)
        self.url_edit.setPlaceholderText("네이버 검색 결과 URL")
        self.url_edit.returnPressed.connect(self.start)

        self.limit_spin = QSpinBox()
        self.limit_spin.setRange(1, 50)
        self.limit_spin.setValue(10)
        self.delay_spin = QDoubleSpinBox()
        self.delay_spin.setRange(0.0, 10.0)
        self.delay_spin.setSingleStep(0.5)
        self.delay_spin.setValue(1.0)
        self.delay_spin.setSuffix(" 초")

        self.start_btn = QPushButton("크롤링 시작")
        self.start_btn.clicked.connect(self.start)
        self.stop_btn = QPushButton("중지")
        self.stop_btn.setEnabled(False)
        self.stop_btn.clicked.connect(self.stop)

        top = QHBoxLayout()
        top.addWidget(QLabel("URL"))
        top.addWidget(self.url_edit, 1)
        top.addWidget(QLabel("최대 기사 수"))
        top.addWidget(self.limit_spin)
        top.addWidget(QLabel("요청 간격"))
        top.addWidget(self.delay_spin)
        top.addWidget(self.start_btn)
        top.addWidget(self.stop_btn)

        # ----- 결과 표 + 상세 보기 -----
        self.table = QTableWidget(0, len(COLUMNS))
        self.table.setHorizontalHeaderLabels(COLUMNS)
        self.table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        self.table.verticalHeader().setVisible(False)
        header = self.table.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        self.table.itemSelectionChanged.connect(self.show_detail)
        self.table.cellDoubleClicked.connect(self.open_in_browser)

        self.detail = QTextBrowser()
        self.detail.setOpenExternalLinks(True)
        self.detail.setPlaceholderText("표에서 기사를 선택하면 본문이 여기에 표시됩니다. (더블클릭하면 브라우저로 열기)")

        splitter = QSplitter(Qt.Orientation.Vertical)
        splitter.addWidget(self.table)
        splitter.addWidget(self.detail)
        splitter.setSizes([260, 400])

        # ----- 하단 -----
        self.progress = QProgressBar()
        self.progress.setTextVisible(True)
        self.progress.setFormat("%v / %m")
        self.save_btn = QPushButton("JSON으로 저장")
        self.save_btn.setEnabled(False)
        self.save_btn.clicked.connect(self.save_json)
        self.excel_btn = QPushButton("엑셀로 저장")
        self.excel_btn.setEnabled(False)
        self.excel_btn.clicked.connect(self.save_xlsx)
        bottom = QHBoxLayout()
        bottom.addWidget(self.progress, 1)
        bottom.addWidget(self.excel_btn)
        bottom.addWidget(self.save_btn)

        layout = QVBoxLayout()
        layout.addLayout(top)
        layout.addWidget(splitter, 1)
        layout.addLayout(bottom)
        central = QWidget()
        central.setLayout(layout)
        self.setCentralWidget(central)
        self.statusBar().showMessage("준비됨")

    # ----- 크롤링 제어 -----
    def start(self):
        if self.worker and self.worker.isRunning():
            return
        url = self.url_edit.text().strip()
        if not url.startswith("http"):
            QMessageBox.warning(self, "URL 확인", "http:// 또는 https://로 시작하는 URL을 입력하세요.")
            return

        self.results.clear()
        self.table.setRowCount(0)
        self.detail.clear()
        self.progress.setValue(0)
        self.save_btn.setEnabled(False)
        self.excel_btn.setEnabled(False)

        self.worker = CrawlWorker(url, self.limit_spin.value(), self.delay_spin.value())
        self.worker.status.connect(self.statusBar().showMessage)
        self.worker.progress.connect(self.on_progress)
        self.worker.article.connect(self.add_row)
        self.worker.failed.connect(self.on_failed)
        self.worker.finished.connect(self.on_finished)
        self.set_running(True)
        self.worker.start()

    def stop(self):
        if self.worker:
            self.worker.requestInterruption()
            self.stop_btn.setEnabled(False)
            self.statusBar().showMessage("중지하는 중...")

    def set_running(self, running):
        self.start_btn.setEnabled(not running)
        self.stop_btn.setEnabled(running)
        self.url_edit.setEnabled(not running)
        self.limit_spin.setEnabled(not running)
        self.delay_spin.setEnabled(not running)

    def on_progress(self, done, total):
        self.progress.setMaximum(total)
        self.progress.setValue(done)

    def on_failed(self, message):
        self.statusBar().showMessage(message)
        QMessageBox.warning(self, "크롤링 실패", message)

    def on_finished(self):
        self.set_running(False)
        self.save_btn.setEnabled(bool(self.results))
        self.excel_btn.setEnabled(bool(self.results))

    # ----- 결과 표시 -----
    def add_row(self, result):
        self.results.append(result)
        row = self.table.rowCount()
        self.table.insertRow(row)
        values = [result["press"], result["title"], result["published"], result["date"]]
        for col, value in enumerate(values):
            self.table.setItem(row, col, QTableWidgetItem(value))
        if row == 0:
            self.table.selectRow(0)

    def selected_result(self):
        rows = self.table.selectionModel().selectedRows()
        return self.results[rows[0].row()] if rows else None

    def show_detail(self):
        r = self.selected_result()
        if not r:
            return
        body = r["content"] or r["summary"] or "(본문을 가져오지 못했습니다)"
        meta = " · ".join(x for x in (r["press"], r["date"] or r["published"]) if x)
        url = html.escape(r["url"], quote=True)
        self.detail.setHtml(
            f"<h2>{html.escape(r['title'])}</h2>"
            f"<p style='color:gray'>{html.escape(meta)}</p>"
            f"<p><a href=\"{url}\">{html.escape(r['url'])}</a></p>"
            f"<p style='line-height:150%'>{html.escape(body)}</p>"
        )

    def open_in_browser(self, row, _col):
        QDesktopServices.openUrl(QUrl(self.results[row]["url"]))

    def save_json(self):
        path, _ = QFileDialog.getSaveFileName(self, "JSON으로 저장", "news.json", "JSON (*.json)")
        if not path:
            return
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(self.results, f, ensure_ascii=False, indent=2)
        except OSError as e:
            QMessageBox.warning(self, "저장 실패", str(e))
            return
        self.statusBar().showMessage(f"{len(self.results)}건을 {path}에 저장했습니다.")

    def save_xlsx(self):
        path, _ = QFileDialog.getSaveFileName(self, "엑셀로 저장", "news.xlsx", "Excel 통합 문서 (*.xlsx)")
        if not path:
            return
        if not path.lower().endswith(".xlsx"):
            path += ".xlsx"
        try:
            save_excel(self.results, path)
        except OSError as e:  # 같은 이름의 파일이 엑셀에서 열려 있는 경우 등
            QMessageBox.warning(self, "저장 실패", f"{e}\n\n같은 이름의 파일이 열려 있다면 닫고 다시 시도하세요.")
            return
        self.statusBar().showMessage(f"{len(self.results)}건을 {path}에 저장했습니다.")

    def closeEvent(self, event):
        if self.worker and self.worker.isRunning():
            self.worker.requestInterruption()
            self.worker.wait(5000)
        super().closeEvent(event)


def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
