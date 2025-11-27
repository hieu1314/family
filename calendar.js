/*** Upload ảnh lên Supabase Storage ***/
async function uploadToSupabase(file, eventId) {
  // Sử dụng folder theo format 'events/eventID1/'
  const folder = `events/eventID${eventId}`;  
  const fileName = Date.now() + "-" + file.name;  // Tạo tên file ngẫu nhiên dựa trên thời gian
  const filePath = `${folder}/${fileName}`;  // Đường dẫn file đầy đủ trong folder

  // Upload file lên Supabase Storage
  const { error } = await db.storage
    .from("family-photos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  // Nếu có lỗi trong quá trình upload
  if (error) {
    alert("Upload thất bại!");
    console.log(error);
    return null;
  }

  // Lấy URL của file đã upload để hiển thị
  const { data: urlData } = db.storage
    .from("family-photos")
    .getPublicUrl(filePath);

  // Sửa URL để có dạng đúng
  const fullUrl = urlData.publicUrl.replace("https://vaotrlttfbkoxnuimdnf.supabase.co/storage/v1/object/public", "https://vaotrlttfbkoxnuimdnf.supabase.co/storage/v1/object/public");

  return fullUrl;  // Trả về URL công khai của ảnh
}


/*** Popup xem sự kiện ***/
window.viewEventDetail = function(name, images, date, eventId = null) {
  const modal = document.getElementById("event-modal");
  const modalBody = document.getElementById("modal-body");

  const imgArray = images.map(img => typeof img === "string" ? { url: img, note: "" } : img);

  let html = `
    <h2>${name}</h2>
    <div class="slide-container">
      ${imgArray.map((img,i)=>`
        <div class="slide-item ${i===0 ? "active" : ""}">
          <img src="${img.url}" class="slide-image">
          <p class="image-note" onclick="editNote(${i})">
            ${img.note || "<em>Nhấn để thêm ghi chú...</em>"}
          </p>
          <input type="text" class="note-input" id="note-${i}" value="${img.note}" style="display:none" 
            onblur="saveNote(${i}, this.value)">
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
  function showSlide(i){ slides.forEach((s, idx)=>s.classList.toggle("active", idx===i)); }

  modalBody.querySelector("#prevBtn").onclick = ()=> { currentIndex=(currentIndex-1+slides.length)%slides.length; showSlide(currentIndex); };
  modalBody.querySelector("#nextBtn").onclick = ()=> { currentIndex=(currentIndex+1)%slides.length; showSlide(currentIndex); };

modalBody.querySelector("#addImageBtn").onclick = async () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file"; 
  fileInput.accept = "image/*";

  fileInput.onchange = async e => {
    const file = e.target.files[0]; 
    if (!file) return;
    
    // Lấy URL ảnh sau khi upload lên Supabase
    const publicUrl = await uploadToSupabase(file, eventId); 
    if (!publicUrl) return;

    // Thêm ảnh vào mảng imgArray và cập nhật lại sự kiện
    imgArray.push({ url: publicUrl, note: "" });

    // Cập nhật sự kiện với ảnh mới
    if (eventId) await db.from("events").update({ images: imgArray }).eq("id", eventId);
    
    // Hiển thị lại chi tiết sự kiện sau khi thêm ảnh
    viewEventDetail(name, imgArray, date, eventId);
  };

  fileInput.click();
};

  document.querySelector(".close-btn").onclick = ()=> modal.style.display="none";
  modal.onclick = e => { if(e.target===modal) modal.style.display="none"; };

  window.editNote = i => modalBody.querySelector(`#note-${i}`).style.display="block";
  window.saveNote = async (i,text)=>{
    imgArray[i].note=text;
    if(eventId) await db.from("events").update({images: imgArray}).eq("id",eventId);
    viewEventDetail(name,imgArray,date,eventId);
  };
};

/*** FullCalendar ***/
document.addEventListener("DOMContentLoaded", async function() {
  let eventsFromDB = [];
  try {
    const { data, error } = await db.from("events").select("*");
    if(error){ console.log(error); throw error; }
    eventsFromDB = data || [];
  } catch(e){
    console.log("Không lấy được events từ Supabase, dùng mẫu tạm");
    eventsFromDB = [
      {id:1,title:"Sự kiện 1",date:"2025-11-19",images:["images/1.jpg"]},
      {id:2,title:"Sự kiện 2",date:"2025-11-26",images:["images/2.jpg"]},
      {id:3,title:"Sự kiện 3",date:"2025-12-22",images:["images/3.jpg"]}
    ];
  }

  const calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
    initialView:"dayGridMonth",
    height:"auto",
    events: eventsFromDB.map(ev=>({id: ev.id, title: ev.title, start: ev.date, images: ev.images||[] })),
    eventClick: info=>{
      viewEventDetail(info.event.title, info.event.extendedProps.images, info.event.startStr, info.event.id);
    }
  });

  calendar.render();
});
