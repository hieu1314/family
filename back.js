// ====================================
//      HEADER IMAGE STRIP (PC + MOBILE)
// ====================================

// Tạo danh sách ảnh 1.jpg -> 20.jpg
const base = "images/";
const allImages = [];
for (let i = 1; i <= 20; i++) allImages.push(`${i}.jpg`);

const isMobile = window.innerWidth < 768;

let boxes = [];

if (isMobile) {
    // ===== MOBILE: 1 strip – 4 ảnh =====
    const strip = document.createElement("div");
    strip.id = "header-strip";
    document.querySelector("header").appendChild(strip);

    for (let i = 0; i < 4; i++) {
        const box = document.createElement("div");
        box.className = "header-img-box";
        const img = document.createElement("img");
        box.appendChild(img);
        strip.appendChild(box);
        boxes.push(img);
    }

} else {
    // ===== PC: chia 2 bên, mỗi bên 4 ảnh =====
    const header = document.querySelector("header");

    const leftStrip = document.createElement("div");
    leftStrip.id = "header-strip-left";
    header.appendChild(leftStrip);

    const rightStrip = document.createElement("div");
    rightStrip.id = "header-strip-right";
    header.appendChild(rightStrip);

    for (let i = 0; i < 4; i++) {
        const img = document.createElement("img");
        const box = document.createElement("div");
        box.className = "header-img-box";
        box.appendChild(img);
        leftStrip.appendChild(box);
        boxes.push(img);
    }

    for (let i = 0; i < 4; i++) {
        const img = document.createElement("img");
        const box = document.createElement("div");
        box.className = "header-img-box";
        box.appendChild(img);
        rightStrip.appendChild(box);
        boxes.push(img);
    }
}

// ====================================
//     THÊM HIỆU ỨNG MỚI TẠI ĐÂY
// ====================================

// effects cũ: show, flip, slide
// effects mới: pageflip, tornado
const effects = ["show", "flip", "slide", "pageflip", "tornado"];


// Load ảnh ban đầu
boxes.forEach(img => {
    img.src = base + allImages[Math.floor(Math.random() * allImages.length)];
    setTimeout(() => img.classList.add("show"), 80);
});

// Hàm đổi ảnh
function changeTile(img) {
    img.className = ""; // reset class

    const file = allImages[Math.floor(Math.random() * allImages.length)];
    const effect = effects[Math.floor(Math.random() * effects.length)];

    setTimeout(() => {
        img.src = base + file;
        img.classList.add("show", effect);
    }, 50);
}

// Đổi 1 hình mỗi 2–3 giây
setInterval(() => {
    const img = boxes[Math.floor(Math.random() * boxes.length)];
    changeTile(img);
}, 2000 + Math.random() * 1000);
