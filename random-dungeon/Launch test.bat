@echo off
C:
cd "C:\Program Files\Google\Chrome\Application"
set "file=test.htm"
set "path=%~dp0%file%"
start chrome.exe --allow-file-access-from-files -incognito %path%