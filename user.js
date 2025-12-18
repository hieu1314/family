import { auth } from "./firebase-config.js";

/* =========================
   INJECT CSS (USER AVATAR)
========================= */
const style = document.createElement("style");
style.textContent = `
#userMenu {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 5000;
}

#userBtn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  cursor: pointer;

  background: radial-gradient(
    circle at top left,
    #ffd1dc,
    #ff7aa2 60%,
    #ff4f72
  );

  color: white;
  font-weight: bold;
  font-size: 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow:
    0 0 8px rgba(255,79,114,0.6),
    0 2px 8px rgba(0,0,0,0.25);

  transition: transform 0.2s, box-shadow 0.2s;
}

#userBtn:hover {
  transform: scale(1.1);
  box-shadow:
    0 0 12px rgba(255,79,114,0.9),
    0 4px 12px rgba(0,0,0,0.35);
}

#userDropdown {
  display: none;
  position: absolute;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  min-width: 160px;
  overflow: hidden;
}

#userDropdown button {
  display: block;
  width: 100%;
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
}

#userDropdown button:hover {
  background: #ffeef3;
}
`;
document.head.appendChild(style);

/* =========================
   LOGIC USER MENU
========================= */
const userBtn = document.getElementById("userBtn");
const userDropdown = document.getElementById("userDropdown");
const changeNickBtn = document.getElementById("changeNickBtn");
const logoutBtn = document.getElementById("logoutBtn");

let nickname = localStorage.getItem("chatNickname") || null;

/* =========================
   AVATAR RENDER
========================= */
function renderAvatar() {
  if (nickname && nickname.length > 0) {
    userBtn.textContent = nickname.charAt(0).toUpperCase();
  } else if (auth.currentUser?.email) {
    userBtn.textContent = auth.currentUser.email.charAt(0).toUpperCase();
  } else {
    userBtn.textContent = "👤";
  }
}

renderAvatar();

/* =========================
   EVENTS
========================= */
userBtn.addEventListener("click", () => {
  userDropdown.style.display =
    userDropdown.style.display === "block" ? "none" : "block";
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
    renderAvatar();
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

/* =========================
   CHẶN HIỂN THỊ MAIL (FIX CUỐI)
========================= */
const observer = new MutationObserver(() => {
  if (userBtn.textContent.length > 1) {
    renderAvatar(); // ép quay về avatar
  }
});

observer.observe(userBtn, {
  childList: true,
  characterData: true,
  subtree: true
});
