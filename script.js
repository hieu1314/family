document.addEventListener("DOMContentLoaded", function () {

  /* ============================
     1) TÌM KIẾM SỰ KIỆN (trong FullCalendar DOM)
  ============================ */
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  searchBtn.addEventListener('click', function () {
    const query = searchInput.value.toLowerCase();
    const events = document.querySelectorAll('.fc-event');

    events.forEach(ev => {
      const title = ev.querySelector('.fc-event-title').textContent.toLowerCase();
      ev.style.display = title.includes(query) ? 'block' : 'none';
    });
  });


  /* ============================
     2) KHỞI TẠO BẢN ĐỒ LEAFLET
  ============================ */
  const map = L.map('map', {
    center: [16.0583, 108.2772],
    zoom: 5.5,
    scrollWheelZoom: true,
    zoomControl: true
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);


  /* ============================
     3) DANH SÁCH ĐỊA ĐIỂM + MARKER
  ============================ */
  const locations = [
    { lat: 21.0285, lon: 105.8542, name: 'Hà Nội', image: 'images/1.jpg', date: '2025-11-19' },
    { lat: 12.865, lon: 108.235, name: 'Đà Lạt', image: 'images/2.jpg', date: '2025-11-19' },
    { lat: 12.238, lon: 109.1967, name: 'Nha Trang', image: 'images/3.jpg', date: '2025-11-19' },
    { lat: 10.762622, lon: 106.660172, name: 'TP.HCM', image: 'images/4.jpg', date: '2025-11-19' }
  ];

  locations.forEach(loc => {
    const marker = L.marker([loc.lat, loc.lon]).addTo(map);

    marker.bindPopup(`
      <strong>${loc.name}</strong><br>
      <img src="${loc.image}" style="width:100px"><br>
      <em>${loc.date}</em><br>
      <a href="#" 
         onclick='openMapPopup(
           "${loc.name}",
           ${JSON.stringify([{ url: loc.image, note: "Ảnh chụp tại " + loc.name }])},
           "${loc.date}"
         )'>
         Xem chi tiết
       </a>
    `);
  });


  /* ============================
     4) POPUP ẢNH NHỎ TRONG LEAFLET (Không đụng popup lớn)
  ============================ */
  window.openMapPopup = function (name, images, date) {
    const box = document.getElementById("event-detail");
    let html = `
      <h3>${name}</h3>
      <img src="${images[0].url}" style="width: 100%; border-radius: 6px;">
      <p><strong>Ngày:</strong> ${date}</p>
    `;

    box.innerHTML = html;
    box.style.display = "block";
  };


  /* ============================
     5) FIX MAP JUMP / BROKEN WIDTH
  ============================ */
  setTimeout(() => map.invalidateSize(), 500);
  window.addEventListener("resize", () => map.invalidateSize());
});
