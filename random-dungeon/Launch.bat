@echo off
REM C:
REM cd "C:\Program Files\Google\Chrome\Application"
set "file=index.html"
set "path=%~dp0%file%"
start chrome.exe --allow-file-access-from-files -incognito %path%