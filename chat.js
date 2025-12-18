import {
  getDatabase,
  ref,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { auth, app } from "./firebase-config.js";

const db = getDatabase(app, "https://family-hieu1314-default-rtdb.asia-southeast1.firebasedatabase.app"); 

const chatBox = document.getElementById("chatBox");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatMessage");

/* ================== EMOJI ================== */
const emojiBtn = document.getElementById("emojiBtn");
const emojiPanel = document.getElementById("emojiPanel");

/* MỞ / ĐÓNG EMOJI PANEL */
emojiBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  emojiPanel.classList.toggle("show");
});

/* CLICK NGOÀI → ĐÓNG EMOJI */
document.addEventListener("click", (e) => {
  if (
    !emojiPanel.contains(e.target) &&
    !emojiBtn.contains(e.target)
  ) {
    emojiPanel.classList.remove("show");
  }
});

/* CHÈN EMOJI */
window.addEmoji = function (emoji) {
  chatInput.value += emoji + " ";
  chatInput.focus();
};

/* TAB EMOJI */
window.openEmojiTab = function (tabId) {
  document
    .querySelectorAll(".emoji-content")
    .forEach(el => el.classList.remove("show"));

  document
    .querySelectorAll(".emoji-tab")
    .forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabId).classList.add("show");

  const tabs = [
    "tab-smileys",
    "tab-animals",
    "tab-food",
    "tab-travel",
    "tab-symbols"
  ];
  const index = tabs.indexOf(tabId);
  if (index !== -1) {
    document
      .querySelectorAll(".emoji-tab")[index]
      .classList.add("active");
  }
};

let currentUser = null;

/* ==== LẤY USER ĐANG LOGIN ==== */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // phòng hờ, thực tế index.html đã chặn rồi
    chatBox.classList.remove("show");
    return;
  }
  currentUser = user;
});

/* ==== TOGGLE CHAT ==== */
window.toggleChat = function () {
  chatBox.classList.toggle("show");
};

/* ==== GỬI TIN ==== */
window.sendMessage = function () {
  if (!currentUser) return;

  const text = chatInput.value.trim();
  if (!text) return;

  // lấy nickname từ localStorage nếu có
  const nickname = localStorage.getItem("chatNickname") || currentUser.email;

  push(ref(db, "messages"), {
    uid: currentUser.uid,
    name: nickname,
    text: text,
    time: Date.now()
  });

  chatInput.value = "";
};

/* ENTER KEY */
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

/* ==== NHẬN TIN REALTIME ==== */
onChildAdded(ref(db, "messages"), (snap) => {
  const data = snap.val();
  const div = document.createElement("div");
  div.className = "chat-message";

const d = new Date(data.time);
const timeStr = d.toLocaleString("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});


  div.innerHTML = `
    <b>${data.name}</b>
    <small style="color:#666">(${timeStr})</small><br>
    ${data.text}
  `;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    const nickname = localStorage.getItem("chatNickname"); // vẫn còn
    const userBtn = document.getElementById("userBtn");
    userBtn.textContent = nickname || user.email;
  } else {
    window.location.href = "login.html";
  }
});



