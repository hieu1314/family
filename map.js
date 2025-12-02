document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([10.7769, 106.7009], 6); // trung tâm VN

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    window.updateMap = function(events = window.FULL_EVENTS) {
        if (window.mapMarkers) {
            window.mapMarkers.forEach(m => map.removeLayer(m));
        }
        window.mapMarkers = [];

        events.forEach(ev => {
            const marker = L.marker([ev.lat, ev.lng]).addTo(map)
                .bindPopup(`<b>${ev.title}</b><br>${ev.date}`)
                .on('click', () => openViewer(ev.images));
            window.mapMarkers.push(marker);
        });

        if (events.length) {
            const group = new L.featureGroup(window.mapMarkers);
            map.fitBounds(group.getBounds().pad(0.3));
        }
    };

    updateMap(window.FULL_EVENTS);
});
