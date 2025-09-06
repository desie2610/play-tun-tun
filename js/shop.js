(function(){
  "use strict";

  const packs = [
    { 
      id: 1, 
      name: "Обычный пак", 
      costGrn: 50, 
      image: "../img/packs/common.png" 
    },
    { 
      id: 2, 
      name: "Редкий пак", 
      costGrn: 150, 
      image: "../img/packs/rare.png" 
    },
    { 
      id: 3, 
      name: "Сверх-редкий пак", 
      costGrn: 400, 
      image: "../img/packs/superrare.png" 
    },
    { 
      id: 4, 
      name: "Эпический пак", 
      costGrn: 1000, 
      image: "../img/packs/epic.png" 
    },
    { 
      id: 5, 
      name: "Мифический пак", 
      costGrn: 2500, 
      image: "../img/packs/mythic.png" 
    },
    { 
      id: 6, 
      name: "Легендарный пак", 
      costGrn: 5000, 
      image: "../img/packs/legendary.png" 
    }
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

    // сохраняем через API
    g.saveUsers();
    updateBalance();

    // уведомление о покупке
    const msg = `Вы купили: ${pack.name}!`;
    alert(msg);
  }

  function renderShop(){
    const container = document.getElementById("shop-container");
    container.innerHTML = "";
    packs.forEach(pack=>{
      const div = document.createElement("div");
      div.className = "pack";
      div.innerHTML = `
        <img src="${pack.image}" alt="${pack.name}" class="pack-img">
        <h2>${pack.name}</h2>
        <p>Цена: ${pack.costGrn} ₴</p>
        <button>Купить</button>
      `;
      div.querySelector("button").addEventListener("click", ()=>buyPack(pack));
      container.appendChild(div);
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    renderShop();
    updateBalance();
    window.addEventListener("focus", updateBalance);
  });

})();