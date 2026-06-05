@echo off
:: =============================================
:: 知多なおゆきサポート LP - ローカルプレビュー起動
:: =============================================
:: このファイルをダブルクリックするか、コマンドプロンプトから実行してください。
:: Python が必要です（https://www.python.org/）

cd /d "%~dp0"

echo.
echo =============================================
echo  知多なおゆきサポート LP プレビュー起動中...
echo =============================================
echo.
echo ブラウザで以下のURLを開いてください：
echo   http://localhost:8080
echo.
echo 終了するには Ctrl+C を押してください。
echo.

:: Python 3 を優先、なければ Python 2 を試行
python -m http.server 8080 2>nul
if errorlevel 1 (
  python -m SimpleHTTPServer 8080 2>nul
)
if errorlevel 1 (
  echo.
  echo [エラー] Python が見つかりませんでした。
  echo Python をインストールするか、index.html を直接ブラウザで開いてください。
  echo.
  pause
)
