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

// PC: 1 năm
const defaultStart = new Date(now.getTime());
defaultStart.setFullYear(now.getFullYear() - 1);
const defaultEnd = now;

// MOBILE: 10 ngày trước – 3 ngày sau
let mobileStart, mobileEnd;
if (isMobile) {
    mobileStart = new Date(now.getTime());
    mobileStart.setDate(now.getDate() - 10);

    mobileEnd = new Date(now.getTime());
    mobileEnd.setDate(now.getDate() + 3);
}

timeline = new vis.Timeline(
    document.getElementById("timeline"),
    items,
    {
        height: "100%",

        // PC: 1 năm – MOBILE: 10d → 3d
        start: isMobile ? mobileStart : defaultStart,
        end: isMobile ? mobileEnd : defaultEnd,

        locale: "en",

        zoomMin: 1000 * 60 * 60 * 24,          // 1 ngày
        zoomMax: 1000 * 60 * 60 * 24 * 90,     // mobile không zoom tới mức quá lớn

        timeAxis: {
            scale: isMobile ? 'day' : 'week',
            step: 1,
            format: {
                minorLabels: date => date.getDate(),  // hiển thị số ngày
                majorLabels: date => `Tháng ${date.getMonth() + 1}`
            }
        }
    }
);

// Mở hình khi click event
timeline.on("select", props => {
    const ev = allEvents.find(e => e.id === props.items[0]);
    if (ev) openViewer(ev.images);
});

// MOBILE: ép lại cửa sổ để chắc chắn hiển thị đúng
if (isMobile) {
    requestAnimationFrame(() => {
        timeline.setWindow(mobileStart, mobileEnd, { animation: false });
    });
}

// NÚT NOW: 10 ngày trước → 3 ngày sau
document.getElementById("nowBtn").addEventListener("click", () => {
    const now = new Date();

    const start = new Date(now.getTime());
    start.setDate(now.getDate() - 10);

    const end = new Date(now.getTime());
    end.setDate(now.getDate() + 3);

    timeline.setWindow(start, end, { 
        animation: true,
        timeAxis: { scale: 'day', step: 1 }
    });
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
});

/* ---------------------- INFO PANEL ---------------------- */
window.updateInfo = function(events){
    const sorted = [...events].sort((a,b)=> new Date(b.date)-new Date(a.date));
    infoContainer.innerHTML = "";

    sorted.forEach(ev => {
        let div = document.createElement("div");
        div.className = "info-event";

      div.innerHTML = `
    <div><b>${ev.title}</b></div>
    <div>${formatDate(ev.date)}</div>
    <div class="note">${ev.note || ""}</div>
    <button class="showBtn">Xem hình</button>
`;

        /* Click tổng → zoom map */
        div.addEventListener("click", () => {
            map.setView([ev.lat, ev.lng], 13, { animate:true });
        });

        /* Click nút xem hình */
        div.querySelector(".showBtn").addEventListener("click", (e)=>{
            e.stopPropagation();
            openViewer(ev.images);
        });

        infoContainer.appendChild(div);
    });
};

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
function openViewer(images){
    const viewer = document.getElementById("viewer");
    const img = document.getElementById("viewerImg");
    let index = 0;

    img.src = images[index];
    viewer.classList.remove("hidden");

    document.getElementById("prevImg").onclick = () => {
        index = (index - 1 + images.length) % images.length;
        img.src = images[index];
    };

    document.getElementById("nextImg").onclick = () => {
        index = (index + 1) % images.length;
        img.src = images[index];
    };

    window.closeViewer = () => viewer.classList.add("hidden");
}

function formatDate(d){
    return new Date(d).toLocaleDateString("vi-VN");
}

