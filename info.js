window.updateInfo = function(events = window.FULL_EVENTS) {
    const container = document.getElementById("info");
    container.innerHTML = "";

    // Sắp xếp mới nhất lên trước
    events.sort((a,b) => new Date(b.date) - new Date(a.date));

    events.forEach(ev => {
        const div = document.createElement("div");
        div.className = "event-item";
        div.innerHTML = `<strong>${ev.title}</strong><br><span class="event-date">${ev.date} - ${ev.location}</span>`;
        div.addEventListener("click", () => openViewer(ev.images));
        container.appendChild(div);
    });
};

// Khi load trang lần đầu
document.addEventListener("DOMContentLoaded", () => {
    if (window.updateInfo) window.updateInfo(window.FULL_EVENTS);
});
