/* INFO */
let infoContainer = document.getElementById("info");

/* MAP */
let map, markers = [];

/* TIMELINE */
let timeline;

 function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

/* ---------------------- KHỞI TẠO TẤT CẢ ---------------------- */
document.addEventListener("DOMContentLoaded", () => {

/* ---- TIMELINE ---- */
let items = new vis.DataSet(
    allEvents.map(ev => ({
        id: ev.id,
        content: ev.title,
        start: ev.date
    }))
);

const now = new Date();
const isMobile = window.innerWidth <= 768;

/* Thời gian mặc định */
const pcStart = new Date(now); pcStart.setDate(now.getDate() - 75); // 2.5 tháng trước
const pcEnd = now;

const mobileStart = new Date(now); mobileStart.setDate(now.getDate() - 20); // 20 ngày trước
const mobileEnd = new Date(now); mobileEnd.setDate(now.getDate() + 3);       // 3 ngày sau

function createTimeAxis() {
    return {
        scale: 'day',
        step: 1,
        format: {
            minorLabels: date => date.toLocaleDateString("vi-VN"), // ngày nhỏ
            majorLabels: date => `Tháng ${date.getMonth() + 1}`   // tháng
        }
    };
}

timeline = new vis.Timeline(
    document.getElementById("timeline"),
    items,
    {
        height: "100%",
        start: isMobile ? mobileStart : pcStart,
        end: isMobile ? mobileEnd : pcEnd,
        zoomMin: 1000 * 60 * 60 * 24,          // 1 ngày
        zoomMax: 1000 * 60 * 60 * 24 * 120,    // 4 tháng
        timeAxis: createTimeAxis(),
         locale: "vi"
    }
);

// Mở hình khi click event
timeline.on("select", props => {
     hideMapCover();   // <-- thêm dòng này
    const ev = allEvents.find(e => e.id === props.items[0]);
    if (ev) openViewer(ev.images);
});

// Ép lại cửa sổ timeline trên mobile
if (isMobile) {
    requestAnimationFrame(() => {
        timeline.setWindow(mobileStart, mobileEnd, { animation: false });
    });
}

// NÚT NOW
document.getElementById("nowBtn").addEventListener("click", () => {
    const now = new Date();

    let start, end;

    if (!isMobile) {
        start = new Date(now); start.setDate(now.getDate() - 10); // PC: 10 ngày trước
        end = new Date(now); end.setDate(now.getDate() + 3);      // 3 ngày sau
    } else {
        start = new Date(now); start.setDate(now.getDate() - 7);  // Mobile: 7 ngày trước
        end = new Date(now); end.setDate(now.getDate() + 3);      // 3 ngày sau
    }

    timeline.setOptions({ timeAxis: createTimeAxis() });
    timeline.setWindow(start, end, { animation: true });
});

/* ---- MAP ---- */
map = L.map("map");

// Tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

// Zoom về TP.HCM mặc định
map.setView([10.7769, 106.7009], 9);  // 12 là mức zoom, có thể tăng/giảm

    updateMap(allEvents);
    updateInfo(allEvents);

    // Thêm sự kiện click cho hình ở mapCover
const mapCoverImg = document.querySelector("#mapCover img");
if (mapCoverImg) {
    mapCoverImg.style.cursor = "pointer"; // Thay đổi con trỏ chuột khi hover
    mapCoverImg.addEventListener("click", () => {
        hideMapCover(); // Ẩn lớp phủ mapCover
        openViewer(["images/vietnam.jpg"]); // Mở popup xem đúng tấm hình này
    });
}

});

/* ---------------------- INFO PANEL ---------------------- */
window.updateInfo = function(events){
    // Sắp xếp theo ngày mới nhất
    const sorted = [...events].sort((a,b)=> new Date(b.date)-new Date(a.date));
    infoContainer.innerHTML = "";

    sorted.forEach(ev => {
        let div = document.createElement("div");
        div.className = "info-event";

        // Tiêu đề + ngày
        div.innerHTML = `<div><b>${ev.title}</b></div>
                         <div>${formatDate(ev.date)}</div>`;

        // Note
        let noteDiv = document.createElement("div");
        noteDiv.className = "note";

        // Tiếng Ukraine
        let ukSpan = document.createElement("span");
        ukSpan.className = "text-ukraine";
        ukSpan.textContent = ev.ukText || "";

        // Tiếng Việt
        let vnSpan = document.createElement("span");
        vnSpan.className = "text-vn";
        vnSpan.textContent = ev.note || "";

        // Ẩn tiếng Ukraine trên mobile
        if (window.innerWidth <= 768) ukSpan.style.display = "none";

        // Thêm vào noteDiv
        noteDiv.appendChild(ukSpan);
        noteDiv.appendChild(vnSpan);

        div.appendChild(noteDiv);

        // Click tổng → zoom map
        div.addEventListener("click", () => {
            hideMapCover();  
            map.setView([ev.lat, ev.lng], 13, { animate:true });
        });

        // Nút xem hình
        let btn = document.createElement("button");
        btn.className = "showBtn";
btn.innerHTML = "📷"; // icon máy ảnh
btn.title = "Xem hình";
        btn.addEventListener("click", (e)=>{
            e.stopPropagation();
            openViewer(ev.images);
        });
        div.appendChild(btn);

        infoContainer.appendChild(div);
    });
}

// Resize tự động ẩn/hiện tiếng Ukraine
window.addEventListener("resize", () => {
    document.querySelectorAll(".text-ukraine").forEach(el => {
        el.style.display = window.innerWidth <= 768 ? "none" : "inline";
    });
});


/* ---------------------- MAP ---------------------- */
window.updateMap = function(events){
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    events.forEach(ev => {
        let m = L.marker([ev.lat, ev.lng]).addTo(map);

        m.bindPopup(`
            <b>${ev.title}</b><br>
            ${formatDate(ev.date)}<br>
            <span style="color:blue;cursor:pointer;" onclick="openViewerFromMap(${ev.id})">
                Xem hình
            </span>
        `);

        markers.push(m);
    });
};

window.openViewerFromMap = function(id){
    const ev = allEvents.find(e => e.id === id);
    if (ev) openViewer(ev.images);
};

/* ---------------------- VIEWER ---------------------- */
function openViewer(files) {
    const viewer = document.getElementById("viewer");
    const img = document.getElementById("viewerImg");

    // Thêm video element tĩnh trong viewer (HTML vẫn giữ nguyên viewer)
    let video = document.getElementById("viewerVideo");
    if (!video) {
        video = document.createElement("video");
        video.id = "viewerVideo";
        video.controls = true;
        video.style.maxWidth = "90%";
        video.style.maxHeight = "80vh";
        video.style.display = "none"; // mặc định ẩn
        const viewerContent = document.getElementById("viewer");
        viewerContent.appendChild(video);
    }

    let index = 0;

    function showFile(i) {
        const file = files[i];
        if (!file) return;

        if (file.endsWith(".mp4")) {
            // hiển thị video
            video.src = file;
            video.style.display = "block";
            img.style.display = "none";
        } else {
            // hiển thị hình ảnh
            img.src = file;
            img.style.display = "block";
            video.style.display = "none";
        }
    }

    showFile(index);
    viewer.classList.remove("hidden");

    document.getElementById("prevImg").onclick = () => {
        index = (index - 1 + files.length) % files.length;
        showFile(index);
    };

    document.getElementById("nextImg").onclick = () => {
        index = (index + 1) % files.length;
        showFile(index);
    };

    window.closeViewer = () => viewer.classList.add("hidden");
}

function showFile(i) {
    const file = files[i];
    if (!file) return;

    // reset animation
    img.style.animation = "none";
    video.style.animation = "none";
    void img.offsetWidth; // force reflow
    void video.offsetWidth;

    if (file.endsWith(".mp4")) {
        video.src = file;
        video.style.display = "block";
        img.style.display = "none";
        video.style.animation = "spinZoomIn 0.7s ease-out";
    } else {
        img.src = file;
        img.style.display = "block";
        video.style.display = "none";
        img.style.animation = "spinZoomIn 0.7s ease-out";
    }
}

/* ---------------------- FORMAT DATE ---------------------- */
function formatDate(d){
    return new Date(d).toLocaleDateString("vi-VN");
}


function hideMapCover() {
    const cover = document.getElementById("mapCover");
    if (cover) cover.classList.add("hidden");
}
