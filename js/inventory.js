// inventory.js
(function(){
  "use strict";

  // --- Получение API игры ---
  function api(){
    if (!window.gameAPI) {
      console.error("gameAPI не найден. Подключи base.js!");
      return null;
    }
    return window.gameAPI;
  }

  // --- Обновление баланса ---
  function updateBalance(){
    const g = api();
    if (!g) return;
    const data = g.getData();
    const user = g.getCurrentUser();
    document.getElementById("bal-grn").innerText = data[user]?.grivnas || 0;
    document.getElementById("bal-usd").innerText = data[user]?.dollars || 0;
  }

  // --- Открытие пака ---
  function openPack(index){
    const g = api();
    if (!g) return;
    const currentUser = g.getCurrentUser();
    if (!currentUser) return;

    let inventory = JSON.parse(localStorage.getItem("inventory_" + currentUser) || "[]");
    const pack = inventory[index];
    if (!pack || !pack.characters) return;

    // выбираем случайного персонажа
    const randomChar = pack.characters[Math.floor(Math.random() * pack.characters.length)];

    // добавляем персонажа в коллекцию
    const collection = JSON.parse(localStorage.getItem("collection_" + currentUser) || "[]");
    collection.push({
      name: randomChar,
      date: new Date().toLocaleString()
    });
    localStorage.setItem("collection_" + currentUser, JSON.stringify(collection));

    // удаляем пак из инвентаря
    inventory.splice(index, 1);
    localStorage.setItem("inventory_" + currentUser, JSON.stringify(inventory));

    alert(`Вы открыли пак и получили: ${randomChar}`);
    renderInventory();
  }

  // --- Отображение инвентаря ---
  function renderInventory(){
    const g = api();
    if (!g) return;
    const currentUser = g.getCurrentUser();
    const container = document.getElementById("inventory-container");
    if (!currentUser) { container.innerHTML = "<p>Ошибка: пользователь не найден.</p>"; return; }

    const inventory = JSON.parse(localStorage.getItem("inventory_" + currentUser) || "[]");
    if (inventory.length === 0) { 
      container.innerHTML = "<p>Инвентарь пуст.</p>"; 
      return; 
    }

    container.innerHTML = "";
    inventory.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "inv-item";
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="inv-img">
        <div class="inv-info">
          <h2>${item.name}</h2>
          <p><small>Дата покупки: ${item.date}</small></p>
          <button class="open-pack-btn">Открыть пак (пока нельзя)</button>
        </div>
      `;
      div.querySelector(".open-pack-btn").addEventListener("click", ()=>openPack(index));
      container.appendChild(div);
    });
  }

  // --- Инициализация ---
  document.addEventListener("DOMContentLoaded", ()=>{
    renderInventory();
    updateBalance();
    window.addEventListener("focus", ()=>{
      renderInventory();
      updateBalance();
    });
  });

})();