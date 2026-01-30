document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('#map-svg');
    const panZoom = Panzoom(el, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        minZoom: 1,
        minScale: 1,
        maxZoom: 10,
        fit: true,
        center: true,
        wheelEnabled: false
    });

    const zoomInBtn = document.querySelector('.zoom-in');
    const zoomOutBtn = document.querySelector('.zoom-out');
    const resetBtn = document.querySelector('.reset-btn');
    const hotspots = document.querySelector('.hotspots');
    zoomInBtn.addEventListener('click', () => {
        panZoom.zoomIn();
        updateZoomButtons();
    });
    zoomOutBtn.addEventListener('click', () => {
        panZoom.zoomOut();
        updateZoomButtons();
    });

    function updateZoomButtons() {
        const scale = panZoom.getScale();
        if (scale > 1) {
            zoomOutBtn.removeAttribute('disabled');
            resetBtn.removeAttribute('disabled');
            hotspots.style.display = 'none';
        } else {
            zoomOutBtn.setAttribute('disabled', 'disabled');
            resetBtn.setAttribute('disabled', 'disabled');
            hotspots.style.display = 'block';
        }
    }

    parent.addEventListener('wheel', () => {
        setTimeout(updateZoomButtons, 10); // маленькая задержка для обновления scale
    });

    document.querySelector('.zoom-image').addEventListener('pointermove', function () {
        const c = panZoom.getPan();
        if (c.x !== 0 || c.y !== 0) {
            const scale = panZoom.getScale();
            resetBtn.removeAttribute('disabled');
            hotspots.style.display = 'none';
        } else {
            const scale = panZoom.getScale();
            if (scale === 0) {
                resetBtn.setAttribute('disabled', 'disabled');
                hotspots.style.display = 'block';
            }
        }
    })

    resetBtn.addEventListener('click', () => {
        panZoom.reset();
        updateZoomButtons();
    });

    // *********************************
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('close');
    const modalSvg = document.getElementById('modal-svg');
    const image = document.getElementById('map-svg');

    document.querySelectorAll('.room-area').forEach(polygon => {
        polygon.addEventListener('click', () => {
            const bbox = polygon.getBBox();
            const points = polygon.getAttribute('points');

            modalSvg.innerHTML = '';
            const modalW = 500;
            const modalH = 400;

            console.log(bbox)
            const scaleX = modalW / bbox.width;
            const scaleY = modalH / bbox.height;

            const scale = Math.min(scaleX, scaleY);

            const corX = 0; //(modalW - bbox.width * scale) / 2;
            const tx = -bbox.x * scale + corX;
            const corY = (modalH - bbox.height * scale) / 2;
            const ty = -bbox.y * scale + corY;

            // Создаём defs для clipPath
            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            const clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
            clip.setAttribute('id', 'clip');

            const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            poly.setAttribute('points', points);
            clip.appendChild(poly);
            defs.appendChild(clip);
            modalSvg.appendChild(defs);

            // Добавляем изображение
            const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
            img.setAttributeNS(null, 'href', image.getAttribute('src'));
            img.setAttribute('height', modalH);
            img.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            // img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
            // img.style.willChange = 'transform';
            img.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${tx}, ${ty})`;
            img.setAttribute('clip-path', 'url(#clip)');
            modalSvg.appendChild(img);

            modalSvg.style.width = `${bbox.width * scale}px`

            modal.style.display = 'flex';
        });
    });

// Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });


});