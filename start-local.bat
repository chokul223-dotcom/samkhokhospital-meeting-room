@echo off
chcp 65001 > nul
title ระบบจองห้องประชุม โรงพยาบาลสามโคก
echo ========================================================
echo   ระบบจองห้องประชุม โรงพยาบาลสามโคก (Local Server)
echo ========================================================
echo [1/2] กำลังเปิดเซิร์ฟเวอร์ Backend (Port 3001)...
start "Samkhok Backend (Node.js API)" cmd /k "npm run server"

timeout /t 2 /nobreak > nul

echo [2/2] กำลังเปิด Frontend (Vite)...
echo.
echo เข้าใช้งานได้ที่: http://localhost:8443
echo กด Ctrl+C เพื่อหยุดการทำงาน
echo ========================================================
npm run dev
