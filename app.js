// ===========================
// DỮ LIỆU SỰ KIỆN
// ===========================
window.EVENT_DATA = [
    { id: "eventID1", title: "Bơi lội TP.HCM", date: "2025-01-10", location: "TP.HCM", lat: 10.780, lng: 106.699, folder: "eventID1", totalImages: 4 },
    { id: "eventID2", title: "Dã ngoại Vũng Tàu", date: "2025-03-02", location: "Vũng Tàu", lat: 10.346, lng: 107.083, folder: "eventID2", totalImages: 5 }
];

function getEventImages(folder, total) {
    const base = "https://vaotrlttfbkoxnuimdnf.supabase.co/storage/v1/object/public/family-photos/events/";
    let arr = [];
    for (let i = 1; i <= total; i++) arr.push(`${base}${folder}/${i}.jpg`);
    return arr;
}

window.FULL_EVENTS = EVENT_DATA.map(ev => ({ ...ev, images: getEventImages(ev.folder, ev.totalImages) }));

// ===========================
// SEARCH
// ===========================
function searchEvents() {
    const txt = document.getElementById("searchInput").value.toLowerCase();
    if (!txt) return;
    const matches = FULL_EVENTS.filter(ev => ev.title.toLowerCase().includes(txt));
    if (!matches.length) { alert("Không tìm thấy sự kiện"); return; }
    if (matches.length === 1) { openViewer(matches[0].images); return; }
    let msg = "Chọn sự kiện:\n";
    matches.forEach((ev, i) => msg += `${i+1}. ${ev.title}\n`);
    const choice = parseInt(prompt(msg)) - 1;
    if (matches[choice]) openViewer(matches[choice].images);
}

// ===========================
// FILTER NGÀY + ĐỊA ĐIỂM
// ===========================
window.filterEvents = function() {
    const dateMin = document.getElementById("filterDateMin").value;
    const dateMax = document.getElementById("filterDateMax").value;
    const location = document.getElementById("filterLocation").value;

    let filtered = FULL_EVENTS;
    if (dateMin) filtered = filtered.filter(ev => new Date(ev.date) >= new Date(dateMin));
    if (dateMax) filtered = filtered.filter(ev => new Date(ev.date) <= new Date(dateMax));
    if (location !== "all") filtered = filtered.filter(ev => ev.location === location);

    if (window.updateTimeline) window.updateTimeline(filtered);
    if (window.updateMap) window.updateMap(filtered);
    if (window.updateInfo) window.updateInfo(filtered);
};

// ===========================
// TẠO DANH SÁCH ĐỊA ĐIỂM
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    const locs = [...new Set(FULL_EVENTS.map(ev => ev.location))];
    const select = document.getElementById("filterLocation");
    locs.forEach(l => {
        const opt = document.createElement("option");
        opt.value = l;
        opt.textContent = l;
        select.appendChild(opt);
    });
});
