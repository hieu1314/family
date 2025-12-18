import { auth } from "./firebase-config.js";

const userBtn = document.getElementById("userBtn");
const userDropdown = document.getElementById("userDropdown");
const changeNickBtn = document.getElementById("changeNickBtn");
const logoutBtn = document.getElementById("logoutBtn");

let nickname = localStorage.getItem('chatNickname') || null;

// Hiển thị menu khi click nút user
userBtn.addEventListener("click", () => {
  userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
});

// Click ngoài để đóng dropdown
document.addEventListener("click", (e) => {
  if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
    userDropdown.style.display = "none";
  }
});

// Đổi nickname
changeNickBtn.addEventListener("click", () => {
  const newNick = prompt("Nhập tên hiển thị mới:", nickname || "");
  if (newNick) {
    nickname = newNick;
    localStorage.setItem("chatNickname", nickname);
    alert("Tên hiển thị đã được cập nhật!");
    userBtn.textContent = nickname;
  }
  userDropdown.style.display = "none";
});

// Đăng xuất
logoutBtn.addEventListener("click", () => {
  auth.signOut().then(() => {
    localStorage.removeItem("chatNickname");
    window.location.href = "login.html";
  });
});
