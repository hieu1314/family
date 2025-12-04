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

// Mặc định PC: 1 năm trước → hôm nay
const defaultStart = new Date(now.getTime());
defaultStart.setFullYear(now.getFullYear() - 1);
const defaultEnd = now;

// MOBILE: dùng like “Now button”
// 1 tháng trước → 3 ngày sau
const isMobile = window.innerWidth <= 768;

let mobileStart, mobileEnd;
if (isMobile) {
    mobileStart = new Date(now.getTime());
    mobileStart.setMonth(now.getMonth() - 1); // 1 tháng trước

    mobileEnd = new Date(now.getTime());
    mobileEnd.setDate(now.getDate() + 3); // 3 ngày sau
}

timeline = new vis.Timeline(
    document.getElementById("timeline"),
    items,
    {
        height: "100%",

        // PC dùng 1 năm, Mobile dùng 1 tháng + 3 ngày
        start: isMobile ? mobileStart : defaultStart,
        end: isMobile ? mobileEnd : defaultEnd,

        locale: "en",
        zoomMin: 1000 * 60 * 60 * 24,        // 1 ngày
        zoomMax: 1000 * 60 * 60 * 24 * 366,  // 1 năm

        timeAxis: {
            scale: isMobile ? 'day' : 'week', // Mobile: day view; PC: week view
            step: 1,

            format: {
                minorLabels: function(date) {
                    const weekNo = getWeekNumber(date);
                    return `Tuần ${weekNo}`;
                },
                majorLabels: function(date) {
                    const monthNo = date.getMonth() + 1;
                    return `Tháng ${monthNo}`;
                }
            }
        }
    }
);
// Click vào event → mở viewer
timeline.on("select", props => {
    const ev = allEvents.find(e => e.id === props.items[0]);
    if (ev) openViewer(ev.images);
});

// Nút NOW (cho PC + mobile luôn dùng)
document.getElementById("nowBtn").addEventListener("click", () => {
    const now = new Date();

    // 2 tháng trước
    const start = new Date(now.getTime());
    start.setMonth(now.getMonth() - 2);

    // 3 ngày sau
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

