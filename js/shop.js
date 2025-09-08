// shop.js
(function(){
  "use strict";

  // --- Настройки паков ---
  const packs = [
    { id: 1, name: "Обычный пак", costGrn: 1500, image: "../img/normal.png", characters: ["Тун Тун", "Сахура"] },
    { id: 2, name: "Редкий пак", costGrn: 3000, image: "../img/rare.png", characters: ["Редкий персонаж 1", "Редкий персонаж 2"] },
    { id: 3, name: "Сверх-редкий пак", costGrn: 7500, image: "../img/super-rare.png", characters: ["Супер редкий персонаж"] },
    { id: 4, name: "Эпический пак", costGrn: 10000, image: "../img/epic.png", characters: ["Эпический персонаж"] },
    { id: 5, name: "Мифический пак", costGrn: 15000, image: "../img/mypfik.png", characters: ["Мифический персонаж"] },
    { id: 6, name: "Легендарный пак", costGrn: 17500, image: "../img/legedndary.png", characters: ["Легендарный персонаж"] },
    { id: 7, name: "НЕ РЕАЛЬНЫЙ", costGrn: 25000, image: "../img/no-real.png", characters: ["Нереальный персонаж"] }
  ];

  // --- Получение API игры ---
  function api(){
    if (!window.gameAPI) {
      console.error("gameAPI не найден. Подключи base.js!");
      return null;
    }
    return window.gameAPI;
  }

  // --- Обновление баланса на странице ---
  function updateBalance(){
    const g = api();
    if (!g) return;
    const data = g.getData();
    const user = g.getCurrentUser();
    document.getElementById("bal-grn").innerText = data[user]?.grivnas || 0;
    document.getElementById("bal-usd").innerText = data[user]?.dollars || 0;
  }

  // --- Покупка пака ---
  function buyPack(pack){
    const g = api();
    if (!g) return;
    const currentUser = g.getCurrentUser();
    if (!currentUser) { alert("Сначала войдите в игру!"); return; }

    const data = g.getData();
    const user = data[currentUser];

    if ((user.grivnas || 0) < pack.costGrn) {
      alert("Недостаточно гривен!");
      return;
    }

    // Списываем гривны
    user.grivnas -= pack.costGrn;
    g.saveUsers();

    // Добавляем пак в инвентарь
    const inventory = JSON.parse(localStorage.getItem("inventory_" + currentUser) || "[]");
    inventory.push({
      id: pack.id,
      name: pack.name,
      image: pack.image,
      characters: pack.characters,
      date: new Date().toLocaleString()
    });
    localStorage.setItem("inventory_" + currentUser, JSON.stringify(inventory));

    alert(`Вы купили: ${pack.name}`);
    window.location.href = "../pages/inventory.html"; // переходим в инвентарь
  }

  // --- Отображение магазина ---
  function renderShop(){
    const container = document.getElementById("shop-container");
    container.innerHTML = "";

    packs.forEach(pack => {
      const div = document.createElement("div");
      div.className = "pack";
      div.innerHTML = `
        <img src="${pack.image}" alt="${pack.name}" class="pack-img">
        <h2>${pack.name}</h2>
        <p>Цена: ${pack.costGrn} ₴</p>
        <button class="buy-btn">Купить</button>
      `;
      div.querySelector(".buy-btn").addEventListener("click", () => buyPack(pack));
      container.appendChild(div);
    });
  }

  // --- Инициализация ---
  document.addEventListener("DOMContentLoaded", ()=>{
    renderShop();
    updateBalance();
    window.addEventListener("focus", updateBalance);
  });

})();