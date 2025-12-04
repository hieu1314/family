/* INFO */
let infoContainer = document.getElementById("info");

/* MAP */
let map, markers = [];

/* TIMELINE */
let timeline;

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

    timeline = new vis.Timeline(
        document.getElementById("timeline"),
        items,
        { height: "100%" }
    );

    timeline.on("select", props => {
        const ev = allEvents.find(e => e.id === props.items[0]);
        if (ev) openViewer(ev.images);
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
