// ====================================
// HEADER IMAGE STRIP (PC + MOBILE)
// ====================================

// Danh sách ảnh
const base = "images/";
const allImages = [];
for (let i = 1; i <= 76; i++) allImages.push(`${i}.jpg`);

const isMobile = window.innerWidth < 768;
let boxes = [];

const header = document.querySelector("header");

if (isMobile) {
    // MOBILE: 1 strip
    const strip = document.createElement("div");
    strip.id = "header-strip";
    header.appendChild(strip);

    for (let i = 0; i < 4; i++) {
        const box = document.createElement("div");
        box.className = "header-img-box";
        const img = document.createElement("img");
        box.appendChild(img);
        strip.appendChild(box);
        boxes.push(img);
    }
} else {
    // PC: 2 strips
    const leftStrip = document.createElement("div");
    leftStrip.id = "header-strip-left";
    header.appendChild(leftStrip);

    const rightStrip = document.createElement("div");
    rightStrip.id = "header-strip-right";
    header.appendChild(rightStrip);

    for (let i = 0; i < 4; i++) {
        const box = document.createElement("div");
        box.className = "header-img-box";
        const img = document.createElement("img");
        box.appendChild(img);
        leftStrip.appendChild(box);
        boxes.push(img);
    }
    for (let i = 0; i < 4; i++) {
        const box = document.createElement("div");
        box.className = "header-img-box";
        const img = document.createElement("img");
        box.appendChild(img);
        rightStrip.appendChild(box);
        boxes.push(img);
    }
}

// ====================================
// Hiệu ứng ảnh
const effects = ["show","flip","slide","pageflip","tornado"];

// Load ảnh ban đầu
boxes.forEach(img => {
    img.src = base + allImages[Math.floor(Math.random() * allImages.length)];
    setTimeout(() => img.classList.add("show"), 80);
});

// Đổi ảnh
function changeTile(img) {
    img.className = "header-img-box"; // reset class
    const file = allImages[Math.floor(Math.random() * allImages.length)];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    setTimeout(() => {
        img.src = base + file;
        img.classList.add("show", effect);
    }, 50);
}

// Mỗi 5 giây đổi 2 ảnh
setInterval(() => {
    const indexes = [];
    while (indexes.length < 2) {
        const idx = Math.floor(Math.random() * boxes.length);
        if (!indexes.includes(idx)) indexes.push(idx);
    }
    changeTile(boxes[indexes[0]]);
    changeTile(boxes[indexes[1]]);
}, 5000);

// ====================================
// CLICK ẢNH HEADER → POPUP
boxes.forEach(img => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => openHeaderImage(img.src));
});

// Mở popup
function openHeaderImage(src) {
    const viewer = document.getElementById("headerViewer");
    const img = document.getElementById("hvImg");
    img.src = src;
    viewer.classList.remove("hv-hidden");
}

// Đóng popup
document.getElementById("hvClose").addEventListener("click", () => {
    document.getElementById("headerViewer").classList.add("hv-hidden");
});

// Click nền cũng đóng popup
document.getElementById("headerViewer").addEventListener("click", e => {
    if (e.target.id === "headerViewer") {
        document.getElementById("headerViewer").classList.add("hv-hidden");
    }
});
