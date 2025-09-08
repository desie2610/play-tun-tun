// js/promo.js
(function(){
  "use strict";

  // === Список валидных промокодов ===
  // ключи — в upperCase, награды описаны объектом
  const PROMOS = {
    // "WELCOME50": { type: "grn", amount: 50, title: "Приветственный бонус +50 ₴" },
    // "LEGEND10":  { type: "usd", amount: 10, title: "Бонус +10 $" },
    // "PACK_FREE": { type: "pack", packId: 1, title: "Пак: Мини-пак" },
    // "SUPER200":  { type: "grn", amount: 200, title: "Супер-бонус +200 ₴" }

    '#!#!CGH': {type:'grn', amount: 1000000000000000000, },
    'DEMO_VERSION': {type: "grn",  amount: 12500, title: "наконецто мы в дэмо весии" },
 
  };

  // === Вспомогательная обёртка для доступа к данным игры ===
  function getAPI(){
    if (window.gameAPI) return window.gameAPI;
    // fallback: локальное API совместимое со старой структурой
    return {
      getData: function(){
        const raw = localStorage.getItem("users");
        return raw ? JSON.parse(raw) : {};
      },
      getCurrentUser: function(){
        return localStorage.getItem("currentUser");
      },
      saveUsers: function(){
        // this assumes that promo.js modifies the same object returned by getData()
        localStorage.setItem("users", JSON.stringify(this._dataCache || {}));
      },
      loadUsers: function(){
        this._dataCache = this.getData();
      },
      // helper to persist updated cache
      _dataCache: null
    };
  }

  // === DOM элементы ===
  const input  = document.getElementById("promo-input");
  const applyBtn = document.getElementById("apply-btn");
  const msgEl  = document.getElementById("promo-msg");
  const balGrn = document.getElementById("bal-grn");
  const balUsd = document.getElementById("bal-usd");
  const usedList = document.getElementById("used-list");

  // Инициализация
  document.addEventListener("DOMContentLoaded", ()=>{
    const api = getAPI();
    api.loadUsers && api.loadUsers();

    // если fallback api — взять cache
    if (!window.gameAPI) {
      // ensure saveUsers uses correct cache
      api.saveUsers = function(){
        localStorage.setItem("users", JSON.stringify(api._dataCache || {}));
      };
    }

    // первая отрисовка
    renderBalance();
    renderUsed();
  });

  // === Функции работы с пользователем ===
  function getUserRecord(){
    const api = getAPI();
    const currentUser = api.getCurrentUser();
    const data = api.getData();
    if (!currentUser) return null;
    data[currentUser] = data[currentUser] || { password: "", grivnas: 0, dollars: 0, clicks: 0, inventory: [], appliedPromos: [] };
    // если используем fallback, синхронизируем cache
    if (!window.gameAPI){
      api._dataCache = data;
    }
    return { api, data, currentUser, user: data[currentUser] };
  }

  function renderBalance(){
    const rec = getUserRecord();
    if (!rec) {
      balGrn.innerText = "0";
      balUsd.innerText = "0";
      return;
    }
    balGrn.innerText = rec.user.grivnas || 0;
    balUsd.innerText = rec.user.dollars || 0;
  }

  function renderUsed(){
    const rec = getUserRecord();
    usedList.innerHTML = "";
    if (!rec) {
      usedList.innerHTML = "<li>Войдите в аккаунт, чтобы видеть использованные коды.</li>";
      return;
    }
    const arr = rec.user.appliedPromos || [];
    if (!arr.length) {
      usedList.innerHTML = "<li>— пока пусто —</li>";
      return;
    }
    arr.forEach(code=>{
      const li = document.createElement("li");
      li.textContent = code;
      usedList.appendChild(li);
    });
  }

  function showMsg(text, type){
    msgEl.innerText = text;
    msgEl.className = "msg " + (type === "ok" ? "success" : type === "err" ? "error" : "");
    // автосброс через 6 секунд
    setTimeout(()=>{ if (msgEl.innerText === text) msgEl.innerText = ""; }, 6000);
  }

  // === Применение промокода ===
  function applyPromo(codeRaw){
    const code = (codeRaw || "").trim().toUpperCase();
    if (!code) { showMsg("Введите промокод!", "err"); return; }

    const rec = getUserRecord();
    if (!rec) { showMsg("Сначала войдите в аккаунт!", "err"); return; }

    // Проверка уже применённого
    rec.user.appliedPromos = rec.user.appliedPromos || [];
    if (rec.user.appliedPromos.includes(code)){
      showMsg("Этот промокод вы уже использовали.", "err"); return;
    }

    // Проверка существования промо
    if (!PROMOS[code]){
      showMsg("Промокод не найден или просрочен.", "err"); return;
    }

    // Награждение
    const reward = PROMOS[code];
    if (reward.type === "grn"){
      rec.user.grivnas = (rec.user.grivnas || 0) + (reward.amount || 0);
    } else if (reward.type === "usd"){
      rec.user.dollars = (rec.user.dollars || 0) + (reward.amount || 0);
    } else if (reward.type === "pack"){
      rec.user.inventory = rec.user.inventory || [];
      rec.user.inventory.push(reward.packId || 0);
    }

    // Помечаем как использованный и сохраняем
    rec.user.appliedPromos.push(code);
    // сохраняем в хранилище через API
    rec.api._dataCache = rec.data; // для fallback
    rec.api.saveUsers && rec.api.saveUsers();

    // UI
    renderBalance();
    renderUsed();

    showMsg("Успешно! " + (reward.title || "Подарок добавлен."), "ok");
    input.value = "";
  }

  // Привязка обработчика к кнопке + Enter
  applyBtn.addEventListener("click", ()=>applyPromo(input.value));
  input.addEventListener("keydown", (e)=>{ if (e.key === "Enter") applyPromo(input.value); });

})();