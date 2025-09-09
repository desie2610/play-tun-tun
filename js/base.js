// js/base.js

// === Firebase Подключение ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  deleteUser, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ⚠️ Замени на свои данные из Firebase console
 const firebaseConfig = {
  apiKey: "AIzaSyCbzlefIEUyLcf1bk308Xeaf2KA6ZuZCTI",
  authDomain: "tun-tun-cliker.firebaseapp.com",
  projectId: "tun-tun-cliker",
  storageBucket: "tun-tun-cliker.appspot.com",
  messagingSenderId: "794569010",
  appId:"1:794569010:web:1b8d2d6a1931aca8334f2b"
}; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// === Элементы ===
const authContainer = document.getElementById("auth-container");
const gameScreen = document.getElementById("game-screen");
const playerNameEl = document.getElementById("player-name");
const grivnasEl = document.getElementById("grivnas");
const dollarsEl = document.getElementById("dollars");

// === Переключение вкладок (Вход/Регистрация) ===
document.getElementById("login-tab-btn").addEventListener("click", () => {
  document.getElementById("login-screen").classList.add("active");
  document.getElementById("register-screen").classList.remove("active");
});
document.getElementById("register-tab-btn").addEventListener("click", () => {
  document.getElementById("register-screen").classList.add("active");
  document.getElementById("login-screen").classList.remove("active");
});

// === Регистрация ===
async function register() {
  const username = document.getElementById("register-username").value.trim();
  const password = document.getElementById("register-password").value.trim();
  const confirmPassword = document.getElementById("register-password-confirm").value.trim();
  const errorEl = document.getElementById("register-error");

  errorEl.textContent = "";

  if (!username || !password || !confirmPassword) {
    errorEl.textContent = "Заполните все поля!";
    return;
  }
  if (password !== confirmPassword) {
    errorEl.textContent = "Пароли не совпадают!";
    return;
  }

  try {
    // ⚠️ Firebase требует email — делаем фейковый через ник
    const email = `${username}@game.com`;
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // создаем запись в БД
    await setDoc(doc(db, "players", userCred.user.uid), {
      username: username,
      grivnas: 0,
      dollars: 0
    });

    console.log("Пользователь зарегистрирован:", username);
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

// === Вход ===
async function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const errorEl = document.getElementById("login-error");

  errorEl.textContent = "";

  if (!username || !password) {
    errorEl.textContent = "Введите ник и пароль!";
    return;
  }

  try {
    const email = `${username}@game.com`;
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    errorEl.textContent = "Ошибка входа: " + err.message;
  }
}

// === Удалить аккаунт ===
async function deleteAccount() {
  if (!auth.currentUser) return;
  try {
    await deleteDoc(doc(db, "players", auth.currentUser.uid));
    await deleteUser(auth.currentUser);
    alert("Аккаунт удален!");
  } catch (err) {
    alert("Ошибка: " + err.message);
  }
}

// === Кликер с шансом на доллар каждые 50 кликов ===
async function clickSuhuren() {
  if (!auth.currentUser) return;
  const userRef = doc(db, "players", auth.currentUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    let data = snap.data();

    // Увеличиваем гривны
    data.grivnas += 1;

    // Каждые 50 кликов шанс 50% получить доллар
    if (data.grivnas % 50 === 0) {
      if (Math.random() < 0.5) {
        data.dollars += 1;
        alert("Вам повезло! Вы получили 1 доллар!");
      }
    }

    // Сохраняем обновленные данные
    await updateDoc(userRef, { grivnas: data.grivnas, dollars: data.dollars });
    grivnasEl.textContent = data.grivnas;
    dollarsEl.textContent = data.dollars;
  }
}

// === Авто-вход при загрузке страницы ===
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, "players", user.uid));
    if (snap.exists()) {
      const data = snap.data();
      playerNameEl.textContent = data.username;
      grivnasEl.textContent = data.grivnas;
      dollarsEl.textContent = data.dollars;
    }

    authContainer.style.display = "none";
    gameScreen.style.display = "block";
  } else {
    authContainer.style.display = "block";
    gameScreen.style.display = "none";
  }
});

// === Глобальные функции для кнопок ===
window.register = register;
window.login = login;
window.clickSuhuren = clickSuhuren;
window.deleteAccount = deleteAccount;