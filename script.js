document.addEventListener("DOMContentLoaded", function () {

  /*** 1) TÌM KIẾM SỰ KIỆN ***/
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

  /*** 2) KHỞI TẠO BẢN ĐỒ LEAFLET ***/
  const map = L.map('map', {
    center: [16.0583, 108.2772],
    zoom: 5.5,
    scrollWheelZoom: true,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

  /*** 3) DANH SÁCH ĐỊA ĐIỂM ***/
  const locations = [
    { lat: 21.0285, lon: 105.8542, name: 'Hà Nội', image: 'images/1.jpg', date: '2025-11-19' },
    { lat: 12.865, lon: 108.235, name: 'Đà Lạt', image: 'images/2.jpg', date: '2025-11-19' },
    { lat: 12.238, lon: 109.1967, name: 'Nha Trang', image: 'images/3.jpg', date: '2025-11-19' },
    { lat: 10.762622, lon: 106.660172, name: 'TP.HCM', image: 'images/4.jpg', date: '2025-11-19' },
  ];

  locations.forEach(loc => {
    const marker = L.marker([loc.lat, loc.lon]).addTo(map);

    marker.bindPopup(`
      <strong>${loc.name}</strong><br>
      <img src="${loc.image}" style="width:100px"><br>
      <em>${loc.date}</em><br>

      <a href="#" onclick='viewEventDetail(
        "${loc.name}",
        ${JSON.stringify([{ url: loc.image, note: "Ảnh chụp tại " + loc.name }])},
        "${loc.date}"
      )'>Xem chi tiết</a>
    `);
  });

  /*** POPUP XEM SỰ KIỆN DẠNG OVERLAY ***/
  window.viewEventDetail = function (name, images, date) {

  const modal = document.getElementById('event-modal');
  const modalBody = document.getElementById('modal-body');

  // Chuẩn hóa dữ liệu ảnh
  let imgArray = images.map(img => {
    if (typeof img === 'string') return { url: img, note: "" };
    return img;
  });

  let html = `
    <h2>${name}</h2>

    <div class="slide-container">
      ${imgArray.map((img, i) => `
        <div class="slide-item ${i === 0 ? 'active' : ''}">
          <img src="${img.url}" class="slide-image">

          <p class="image-note" onclick="editNote(${i})">
            ${img.note || "<em>Nhấn để thêm ghi chú...</em>"}
          </p>

          <input type="text" class="note-input" id="note-${i}" 
            value="${img.note}" 
            style="display:none"
            onblur="saveNote(${i}, this.value)"
          >
        </div>
      `).join("")}
    </div>

    <div style="text-align:center; margin-top:10px;">
      <button id="prevBtn">◀</button>
      <button id="nextBtn">▶</button>
      <button id="addImageBtn">Thêm ảnh</button>
    </div>

    <p><strong>Ngày:</strong> ${date}</p>
  `;

  modalBody.innerHTML = html;
  modal.style.display = "flex";

  let currentIndex = 0;
  const slides = modalBody.querySelectorAll('.slide-item');

  function showSlide(i) {
    slides.forEach((s, idx) => {
      s.classList.remove("active");
      if (idx === i) s.classList.add("active");
    });
  }

  modalBody.querySelector('#prevBtn').onclick = () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  };

  modalBody.querySelector('#nextBtn').onclick = () => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  };

  /***  👉 Thêm ảnh mới ***/
  modalBody.querySelector('#addImageBtn').onclick = () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1) Upload file lên Supabase Storage
    const publicUrl = await uploadToSupabase(file);
    if (!publicUrl) return;

    // 2) Thêm ảnh vào danh sách ảnh local
    imgArray.push({
      url: publicUrl,
      note: ""
    });

    // 3) Lưu vào database Supabase
    await db.from("events").update({
      images: imgArray
    }).eq("id", eventId);

    // 4) Refresh slide popup
    viewEventDetail(name, imgArray, date);
  };

  fileInput.click();
};

  /***  👉 Đóng popup ***/
  document.querySelector('.close-btn').onclick = () => modal.style.display = "none";
  modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

  /***  👉 Chỉnh sửa ghi chú ***/
  window.editNote = function (index) {
    modalBody.querySelector(`#note-${index}`).style.display = "block";
  };

  window.saveNote = function (index, text) {
    imgArray[index].note = text;
    viewEventDetail(name, imgArray, date);
  };
};


  /*** 5) FULLCALENDAR ***/
  const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',

    events: [
      { title: 'Sự kiện 1', start: '2025-11-19', images: ['images/1.jpg'] },
      { title: 'Sự kiện 2', start: '2025-11-26', images: ['images/2.jpg'] },
      { title: 'Sự kiện 3', start: '2025-12-22', images: ['images/3.jpg'] },
    ],

    eventClick: function (info) {
      viewEventDetail(
        info.event.title,
        info.event.extendedProps.images,
        info.event.startStr
      );
    }
  });

  calendar.render();

  /*** 6) Sửa lỗi map bị vỡ khi load ***/
  setTimeout(() => { map.invalidateSize(); }, 500);
  window.addEventListener("resize", () => map.invalidateSize());

});


/*** 7) ĐỔI TÊN SỰ KIỆN (trong popup Leaflet) ***/
window.addEventName = function (currentName) {
  const newName = prompt("Nhập tên sự kiện mới:", currentName);
  if (!newName) return;

  alert("Tên sự kiện đã cập nhật: " + newName);

  // Cập nhật popup Leaflet
  document.querySelectorAll('.leaflet-popup-content').forEach(popup => {
    popup.innerHTML = popup.innerHTML.replace(currentName, newName);
  });
};
/* hàm upload ảnh vào SupaBase chuẩn nhất, giảm lỗi 403, tên file bị trùng */
async function uploadToSupabase(file) {

  const folder = "events";
  const fileName = Date.now() + "-" + file.name;  // tránh trùng tên
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await db.storage
    .from("family-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.log(error);
    alert("Upload thất bại!");
    return null;
  }

  // Lấy public URL
  const { data: urlData } = db.storage
    .from("family-photos")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
