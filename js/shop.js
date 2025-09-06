(function(){
  "use strict";

  const packs = [
    { id: 1, name: "Мини-пак", costGrn: 50, rewardGrn: 120, rewardUsd: 0 },
    { id: 2, name: "Средний пак", costGrn: 200, rewardGrn: 500, rewardUsd: 1 },
    { id: 3, name: "Большой пак", costGrn: 500, rewardGrn: 1500, rewardUsd: 3 },
    { id: 4, name: "Мега-пак", costGrn: 2000, rewardGrn: 7000, rewardUsd: 10 }
  ];

  function api(){
    if (!window.gameAPI) {
      console.error("gameAPI не найден. Убедись, что base.js подключён и в нём есть window.gameAPI");
      return null;
    }
    return window.gameAPI;
  }

  function updateBalance(){
    const g = api();
    if (!g) return;
    const data = g.getData();
    const currentUser = g.getCurrentUser();
    if (!currentUser || !data[currentUser]) {
      document.getElementById("bal-grn").innerText = "0";
      document.getElementById("bal-usd").innerText = "0";
      return;
    }
    document.getElementById("bal-grn").innerText = data[currentUser].grivnas || 0;
    document.getElementById("bal-usd").innerText = data[currentUser].dollars || 0;
  }

  function buyPack(pack){
    const g = api();
    if (!g) return;
    const data = g.getData();
    const currentUser = g.getCurrentUser();
    if (!currentUser) {
      alert("Сначала войдите в игру!");
      return;
    }
    const user = data[currentUser];

    if ((user.grivnas || 0) < pack.costGrn) {
      alert("Недостаточно гривен!");
      return;
    }

    // списываем гривны
    user.grivnas -= pack.costGrn;

    // выдаем награду
    user.grivnas += pack.rewardGrn;
    user.dollars = (user.dollars || 0) + (pack.rewardUsd || 0);

    // сохраняем через API
    g.saveUsers();
    updateBalance();
    // красивое уведомление
    const msg = `Вы купили: ${pack.name}!\n+${pack.rewardGrn} ₴, +${pack.rewardUsd} $`;
    alert(msg);
  }

  function renderShop(){
    const container = document.getElementById("shop-container");
    container.innerHTML = "";
    packs.forEach(pack=>{
      const div = document.createElement("div");
      div.className = "pack";
      div.innerHTML = `
        <h2>${pack.name}</h2>
        <p>Цена: ${pack.costGrn} ₴</p>
        <p>Награда: +${pack.rewardGrn} ₴, +${pack.rewardUsd} $</p>
        <button>Купить</button>
      `;
      div.querySelector("button").addEventListener("click", ()=>buyPack(pack));
      container.appendChild(div);
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    renderShop();
    updateBalance();

    // Обновлять баланс, если вернулись из игры через ссылку
    window.addEventListener("focus", updateBalance);
  });

})();