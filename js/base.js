(function(){
  "use strict";

  function log(...args){ console.log("[base.js]", ...args); }

  let data = {};            // объект всех пользователей
  let currentUser = null;   // текущий пользователь

  // --- Работа с localStorage ---
  function loadUsers(){
    const raw = localStorage.getItem("users");
    if (!raw) {
      data = {};
      log("Пользователей нет в localStorage");
      return;
    }
    try {
      data = JSON.parse(raw) || {};
      log("Загружены пользователи:", Object.keys(data));
    } catch (err) {
      console.error("[base.js] Ошибка парсинга users:", err);
      try {
        if (confirm("Данные пользователей в localStorage повреждены. Сбросить их?")) {
          localStorage.removeItem("users");
          data = {};
        } else {
          data = {};
        }
      } catch(e){ data = {}; }
    }
  }

  function saveUsers(){
    try {
      localStorage.setItem("users", JSON.stringify(data));
      log("Сохранены пользователи");
    } catch (err){
      console.error("[base.js] Не удалось сохранить users:", err);
    }
  }

  function saveCurrentUser(){
    try {
      if (currentUser) localStorage.setItem("currentUser", currentUser);
      else localStorage.removeItem("currentUser");
      log("Текущий пользователь сохранён:", currentUser);
    } catch(err){
      console.error("[base.js] Ошибка saveCurrentUser:", err);
    }
  }

  // --- UI helpers ---
  function clearAuthFields(){
    const ids = ["login-username","login-password","register-username","register-password","register-password-confirm"];
    ids.forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const le = document.getElementById("login-error");
    const re = document.getElementById("register-error");
    if (le) le.innerText = "";
    if (re) re.innerText = "";
  }

  function showAuthScreen(){
    const auth = document.getElementById("auth-container");
    const game = document.getElementById("game-screen");
    if(auth) auth.style.display = "block";
    if(game) game.style.display = "none";
    clearAuthFields();
  }

  function startGame(){
    if (!currentUser || !data[currentUser]) {
      showAuthScreen();
      return;
    }
    const auth = document.getElementById("auth-container");
    const game = document.getElementById("game-screen");
    if(auth) auth.style.display = "none";
    if(game) game.style.display = "flex";
    const playerEl = document.getElementById("player-name");
    if (playerEl) playerEl.innerText = currentUser;
    const g = document.getElementById("grivnas");
    const d = document.getElementById("dollars");
    if (g) g.innerText = data[currentUser].grivnas || 0;
    if (d) d.innerText = data[currentUser].dollars || 0;
    log("Игра запущена для", currentUser);
  }

  // --- Игровая логика ---
  function clickSuhuren() {
    if (!currentUser) {
      alert("Сначала войдите или зарегистрируйтесь");
      return;
    }

    // добавляем 1 гривну за клик
    data[currentUser].grivnas = (data[currentUser].grivnas || 0) + 1;

    // считаем общее количество кликов
    data[currentUser].clicks = (data[currentUser].clicks || 0) + 1;

    // каждые 50 кликов 15% шанс выпадения 1 доллара
    if (data[currentUser].clicks % 50 === 0) {
      if (Math.random() < 0.15) { // 15% шанс
        data[currentUser].dollars = (data[currentUser].dollars || 0) + 1;
        alert("🎉 Выпал доллар!");
      }
    }

    // обновляем отображение
    const g = document.getElementById("grivnas");
    const d = document.getElementById("dollars");
    if (g) g.innerText = data[currentUser].grivnas;
    if (d) d.innerText = data[currentUser].dollars;

    // сохраняем изменения
    saveUsers();
    log("Клик — обновлён баланс:", data[currentUser]);
  }

  // --- Авторизация / регистрация ---
  function login(){
    const username = (document.getElementById("login-username").value || "").trim();
    const password = document.getElementById("login-password").value || "";
    const err = document.getElementById("login-error");
    if (err) err.innerText = "";
    if (!username || !password) {
      if (err) err.innerText = "Заполните все поля!";
      return;
    }
    if (!data[username]) {
      if (err) err.innerText = "Такого пользователя нет!";
      return;
    }
    if (data[username].password !== password) {
      if (err) err.innerText = "Неверный пароль!";
      return;
    }
    currentUser = username;
    saveCurrentUser();
    startGame();
    clearAuthFields();
  }

  function register(){
    const username = (document.getElementById("register-username").value || "").trim();
    const password = document.getElementById("register-password").value || "";
    const confirmP = document.getElementById("register-password-confirm").value || "";
    const err = document.getElementById("register-error");
    if (err) err.innerText = "";
    if (!username || !password || !confirmP) {
      if (err) err.innerText = "Заполните все поля!";
      return;
    }
    if (password.length < 4) {
      if (err) err.innerText = "Пароль должен быть минимум 4 символа!";
      return;
    }
    if (password !== confirmP) {
      if (err) err.innerText = "Пароли не совпадают!";
      return;
    }
    if (data[username]) {
      if (err) err.innerText = "Пользователь уже существует!";
      return;
    }
    data[username] = { password: password, grivnas: 0, dollars: 0, clicks: 0 };
    saveUsers();
    currentUser = username;
    saveCurrentUser();
    startGame();
    clearAuthFields();
  }

  function deleteAccount(){
    if (!currentUser) { alert("Нет текущего пользователя"); return; }
    if (!confirm("Вы уверены, что хотите удалить аккаунт?")) return;
    delete data[currentUser];
    saveUsers();
    currentUser = null;
    saveCurrentUser();
    showAuthScreen();
  }

  // --- Экспорт функций в глобальную область ---
  window.login = login;
  // Экспорт API для внешних страниц (магазин и т.п.)
window.gameAPI = {
  getData: () => data,                   // возвращает объект всех пользователей (ссылка)
  getCurrentUser: () => currentUser,    // возвращает текущего пользователя (строка или null)
  saveUsers,                             // функция сохранения users в localStorage
  loadUsers,                             // можно вызвать при необходимости
  saveCurrentUser                         // сохранить currentUser в localStorage
};
  window.register = register;
  window.deleteAccount = deleteAccount;
  window.clickSuhuren = clickSuhuren;

  // --- Инициализация ---
  document.addEventListener("DOMContentLoaded", ()=>{
    log("DOMContentLoaded — инициализация");
    loadUsers();
    try {
      const saved = localStorage.getItem("currentUser");
      if (saved && data[saved]) {
        currentUser = saved;
        startGame();
      } else {
        showAuthScreen();
      }
    } catch(e) {
      console.error("[base.js] Ошибка при загрузке currentUser:", e);
      showAuthScreen();
    }

    // Вкладки
    const loginTab = document.getElementById("login-tab-btn");
    const registerTab = document.getElementById("register-tab-btn");
    if (loginTab && registerTab) {
      loginTab.addEventListener("click", ()=>{
        document.getElementById("login-screen").classList.add("active");
        document.getElementById("register-screen").classList.remove("active");
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        clearAuthFields();
      });
      registerTab.addEventListener("click", ()=>{
        document.getElementById("register-screen").classList.add("active");
        document.getElementById("login-screen").classList.remove("active");
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
        clearAuthFields();
      });
    }
  });

})();

