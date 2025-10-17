@echo off
echo Запуск сервера ОБУВЬ...
echo.
echo Если Node.js не установлен, установите его с https://nodejs.org/
echo.
cd server
if not exist node_modules (
    echo Установка зависимостей...
    npm install
)
echo.
echo Создание администратора...
node create-admin.js
echo.
echo Запуск сервера...
echo Сервер будет доступен по адресу: http://localhost:3000
echo Админ-панель: admin.obuv@secure-shop.com / ObuvSecure2024!Admin
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.
npm start
pause
