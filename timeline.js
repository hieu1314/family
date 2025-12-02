document.addEventListener("DOMContentLoaded", () => {
    const timelineEl = document.getElementById("timeline");

    // Container timeline
    const container = document.createElement("div");
    container.id = "timelineContainer";
    timelineEl.appendChild(container);

    // Thanh zoom bar
    const zoomBar = document.createElement("div");
    zoomBar.id = "zoomBar";
    zoomBar.innerHTML = `
        <input type="range" id="zoomSlider" min="1" max="100" value="50">
    `;
    timelineEl.appendChild(zoomBar);

    initTimeline(container);
});

let timeline;
let items;

const ZOOM_MIN = 1000 * 60 * 60 * 24 * 7;          // 7 ngày
const ZOOM_MAX = 1000 * 60 * 60 * 24 * 365 * 3;    // 3 năm

function initTimeline(container) {
    items = new vis.DataSet(
        window.FULL_EVENTS.map(ev => ({
            id: ev.id,
            content: ev.title,
            start: ev.date,
            images: ev.images ?? []
        }))
    );

   timeline = new vis.Timeline(container, items, {
    editable: false,
    zoomable: true,
    zoomMin: ZOOM_MIN,
    zoomMax: ZOOM_MAX,
    margin: { item: 20 },
    
    height: "100%",
    horizontalScroll: true,
    min: new Date(2023, 0, 1),   // ngày nhỏ nhất timeline
    max: new Date(2050, 11, 31), // ngày lớn nhất timeline
    moveable: true,
    showCurrentTime: false
});


    // Click mở viewer
    timeline.on("select", function (props) {
        if (!props.items.length) return;

        const selectedId = props.items[0];
        const ev = items.get(selectedId);

        if (ev.images && ev.images.length) openViewer(ev.images);
    });

    // Double-click zoom in
    timeline.on("doubleClick", function () {
        smoothZoom(0.5); // 0.5 = zoom vào
    });

    // Shift + doubleClick zoom out
    timeline.dom.container.ondblclick = function (e) {
        if (e.shiftKey) smoothZoom(2); // zoom ra
    };

    // Thanh slider zoom
    document.getElementById("zoomSlider").addEventListener("input", onSliderZoom);

    // Nút back-to-center
    addCenterButton();

    setDefaultView();
}

/* -------------------------------------------
   SMOOTH ZOOM – zoom mượt 
--------------------------------------------*/
function smoothZoom(scale) {
    const range = timeline.getWindow();
    const center = (range.start.getTime() + range.end.getTime()) / 2;

    const newStart = new Date(center + (range.start.getTime() - center) * scale);
    const newEnd = new Date(center + (range.end.getTime() - center) * scale);

    timeline.setWindow(newStart, newEnd, { animation: { duration: 300, easing: "easeInOutQuad" } });
}

/* -------------------------------------------
   SLIDER ZOOM 
--------------------------------------------*/
function onSliderZoom() {
    const slider = document.getElementById("zoomSlider").value / 100;

    const targetRange = ZOOM_MIN + (ZOOM_MAX - ZOOM_MIN) * slider;

    const windowRange = timeline.getWindow();
    const center = (windowRange.start.getTime() + windowRange.end.getTime()) / 2;

    const half = targetRange / 2;

    timeline.setWindow(
        new Date(center - half),
        new Date(center + half),
        { animation: { duration: 300, easing: "easeInOutQuad" } }
    );
}

/* -------------------------------------------
   NÚT VỀ GIỮA MÀN HÌNH
--------------------------------------------*/
function addCenterButton() {
    const btn = document.createElement("button");
    btn.textContent = "🚩";
    btn.style.position = "absolute";
    btn.style.top = "5px";
    btn.style.left = "10px";
    btn.style.zIndex = "20";
    btn.style.padding = "3px 8px";
    btn.style.fontSize = "20px";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "6px";
    btn.style.background = "white";
    btn.style.border = "1px solid #ccc";

    btn.onclick = viewLastThreeMonths;

    document.getElementById("timeline").appendChild(btn);
}

/* -------------------------------------------
   VIEW MẶC ĐỊNH (1 năm xung quanh dữ liệu)
--------------------------------------------*/
function setDefaultView() {
    const events = window.FULL_EVENTS;
    if (!events.length) return;

    const min = new Date(Math.min(...events.map(e => new Date(e.date))));
    const max = new Date(Math.max(...events.map(e => new Date(e.date))));
    const center = new Date((min + max) / 2);

    timeline.setWindow(
        new Date(center.getFullYear() - 1, 0, 1),
        new Date(center.getFullYear() + 1, 0, 1),
        { animation: { duration: 500, easing: "easeInOutQuad" } }
    );
}
/* hiển thị 3 tháng gần nhất */
function viewLastThreeMonths() {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    timeline.setWindow(threeMonthsAgo, now, {
        animation: { duration: 500, easing: "easeInOutQuad" }
    });

    // Đảm bảo nhãn hiển thị đầy đủ theo ngày
    timeline.setOptions({
        zoomMin: ZOOM_MIN,  // 7 ngày
        zoomMax: ZOOM_MAX,
        timeAxis: { scale: 'day', step: 1 } // bắt buộc hiện từng ngày
    });
}



