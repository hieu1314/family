let currentImages = [];
let currentIndex = 0;

function openViewer(images) {
    currentImages = images;
    currentIndex = 0;
    document.getElementById("viewerImg").src = currentImages[currentIndex];
    document.getElementById("viewer").classList.remove("hidden");
}

function closeViewer() {
    document.getElementById("viewer").classList.add("hidden");
}

function prevImage() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    document.getElementById("viewerImg").src = currentImages[currentIndex];
}

function nextImage() {
    if (!currentImages.length) return;
    currentIndex = (currentIndex + 1) % currentImages.length;
    document.getElementById("viewerImg").src = currentImages[currentIndex];
}
