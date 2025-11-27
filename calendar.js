/*** FullCalendar + Popup Sự kiện ***/

/* Hàm upload Supabase */
async function uploadToSupabase(file) {
  const folder = "events";
  const fileName = Date.now() + "-" + file.name;
  const filePath = `${folder}/${fileName}`;

  const { error } = await db.storage
    .from("family-photos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (error) {
    alert("Upload thất bại!");
    console.log(error);
    return null;
  }

  const { data: urlData } = db.storage
    .from("family-photos")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}


/*** POPUP XEM SỰ KIỆN ***/
window.viewEventDetail = function (name, images, date, eventId = null) {
  const modal = document.getElementById("event-modal");
  const modalBody = document.getElementById("modal-body");

  // Chuẩn hóa hình
  let imgArray = images.map(img => {
    if (typeof img === "string") return { url: img, note: "" };
    return img;
  });

  let html = `
    <h2>${name}</h2>

    <div class="slide-container">
      ${imgArray.map((img, i) => `
        <div class="slide-item ${i === 0 ? "active" : ""}">
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

    <div class="slide-controls">
      <button id="prevBtn">◀</button>
      <button id="nextBtn">▶</button>
      <button id="addImageBtn">Thêm ảnh</button>
    </div>

    <p><strong>Ngày:</strong> ${date}</p>
  `;

  modalBody.innerHTML = html;
  modal.style.display = "flex";

  let currentIndex = 0;
  const slides = modalBody.querySelectorAll(".slide-item");

  function showSlide(i) {
    slides.forEach((s, idx) => {
      s.classList.toggle("active", idx === i);
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

  /*** Thêm ảnh mới ***/
  modalBody.querySelector("#addImageBtn").onclick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const publicUrl = await uploadToSupabase(file);
      if (!publicUrl) return;

      imgArray.push({ url: publicUrl, note: "" });

      if (eventId) {
        await db.from("events").update({ images: imgArray }).eq("id", eventId);
      }

      viewEventDetail(name, imgArray, date, eventId);
    };

    fileInput.click();
  };

  /*** Đóng popup ***/
  document.querySelector(".close-btn").onclick = () => modal.style.display = "none";
  modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

  /*** Ghi chú ảnh ***/
  window.editNote = function (i) {
    modalBody.querySelector(`#note-${i}`).style.display = "block";
  };

  window.saveNote = async function (i, text) {
    imgArray[i].note = text;

    if (eventId) {
      await db.from("events").update({ images: imgArray }).eq("id", eventId);
    }

    viewEventDetail(name, imgArray, date, eventId);
  };
};


/*** FULLCALENDAR ***/
document.addEventListener("DOMContentLoaded", async function () {

  const calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
    initialView: "dayGridMonth",

    events: [
      { id: 1, title: "Sự kiện 1", start: "2025-11-19", images: ["images/1.jpg"] },
      { id: 2, title: "Sự kiện 2", start: "2025-11-26", images: ["images/2.jpg"] },
      { id: 3, title: "Sự kiện 3", start: "2025-12-22", images: ["images/3.jpg"] }
    ],

    eventClick: function (info) {
      viewEventDetail(
        info.event.title,
        info.event.extendedProps.images,
        info.event.startStr,
        info.event.id // truyền eventId vào popup
      );
    }
  });

  calendar.render();
});
