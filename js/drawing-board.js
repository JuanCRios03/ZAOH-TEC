class DrawingBoard {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.color = '#000000';
        this.lineWidth = 2;
        this.shapes = [];
        this.startX = 0;
        this.startY = 0;
        this.imageData = null;
    this.ruler = false; // cuando true, obliga líneas rectas y guía visual (legacy)
    this.angleIndicator = null; // DOM element para mostrar el ángulo
    this.rulerEl = null; // elemento DOM de la regla (imagen) - optional legacy
    // New: forced angle support
    this.forcedAngle = null; // number degrees or null
    this.forceAngleEnabled = false; // when true, use forcedAngle for line drawing
    // History for undo/redo (store ImageData snapshots)
    this.history = [];
    this.historyIndex = -1; // points to current state in history
    this.maxHistory = 50;
        
        this.initializeCanvas();
        this.addEventListeners();
    }

    initializeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Use a white paper-like background so bucket fill behaves predictably.
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;

        // Save initial empty state in history
        try {
            const img = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.history = [img];
            this.historyIndex = 0;
        } catch (err) {
            // Some browsers may throw if canvas not ready; ignore
        }
    }

    addEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        // Touch events: map touches to the same drawing handlers. Use passive:false to allow preventDefault.
        this.canvas.addEventListener('touchstart', (ev) => {
            // prevent the browser from panning/zooming while drawing
            if (ev.cancelable) ev.preventDefault();
            const t = ev.touches && ev.touches[0] ? ev.touches[0] : (ev.changedTouches && ev.changedTouches[0]);
            if (t) this.startDrawing({ clientX: t.clientX, clientY: t.clientY });
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (ev) => {
            if (ev.cancelable) ev.preventDefault();
            const t = ev.touches && ev.touches[0] ? ev.touches[0] : (ev.changedTouches && ev.changedTouches[0]);
            if (t) this.draw({ clientX: t.clientX, clientY: t.clientY });
        }, { passive: false });

        this.canvas.addEventListener('touchend', (ev) => {
            if (ev.cancelable) ev.preventDefault();
            this.stopDrawing();
        }, { passive: false });

        this.canvas.addEventListener('touchcancel', (ev) => {
            if (ev.cancelable) ev.preventDefault();
            this.stopDrawing();
        }, { passive: false });

        // Global handlers to keep drawing when the finger/mouse leaves the canvas area
        // Prevent page scroll while drawing by capturing touchmove at document level
        this._docTouchMove = (ev) => {
            if (!this.isDrawing) return;
            if (ev.cancelable) ev.preventDefault();
            const t = ev.touches && ev.touches[0] ? ev.touches[0] : (ev.changedTouches && ev.changedTouches[0]);
            if (t) this.draw({ clientX: t.clientX, clientY: t.clientY });
        };
        document.addEventListener('touchmove', this._docTouchMove, { passive: false });

        // Ensure mouseup/touchend anywhere stops drawing
        window.addEventListener('mouseup', this.stopDrawing.bind(this));
        window.addEventListener('touchend', this.stopDrawing.bind(this), { passive: false });
        window.addEventListener('touchcancel', this.stopDrawing.bind(this), { passive: false });
        window.addEventListener('resize', () => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            tempCtx.drawImage(this.canvas, 0, 0);
            
            this.initializeCanvas();
            
            this.ctx.drawImage(tempCanvas, 0, 0);
        });
    }

    // Convert viewport pointer coords to canvas pixel coords.
    // This keeps drawing aligned even when CSS size and canvas internal size differ.
    getCanvasPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width ? (this.canvas.width / rect.width) : 1;
        const scaleY = rect.height ? (this.canvas.height / rect.height) : 1;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
            viewX: (e.clientX - rect.left),
            viewY: (e.clientY - rect.top)
        };
    }

    startDrawing(e) {
        const point = this.getCanvasPoint(e);

        if (this.currentTool === 'fill') {
            this.floodFill(Math.floor(point.x), Math.floor(point.y));
            this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.saveHistorySnapshot();
            return;
        }

        this.isDrawing = true;
        this.startX = point.x;
        this.startY = point.y;
        this.lastX = this.startX;
        this.lastY = this.startY;

        // Guardar el estado actual del canvas para uso en vista previa
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        // Si la herramienta es lápiz, iniciar un nuevo trazo inmediatamente
        if (this.currentTool === 'pencil') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
        // Si hay una regla y la herramienta es línea, posicionarla en el punto inicial y mostrarla
        if (this.ruler && this.rulerEl && this.currentTool === 'line') {
            // position relative to wrapper (assumes rulerEl parent is wrapper)
            const wrapper = this.rulerEl.parentElement;
            if (wrapper) {
                const left = this.startX - 20; // offset to place base near start
                const top = this.startY - (this.rulerEl.height || 20) / 2;
                this.rulerEl.style.left = left + 'px';
                this.rulerEl.style.top = top + 'px';
                this.rulerEl.dataset.x = left;
                this.rulerEl.dataset.y = top;
            }
            this.rulerEl.style.display = 'block';
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const point = this.getCanvasPoint(e);
        const currentX = point.x;
        const currentY = point.y;

        // Restaurar el estado guardado antes de dibujar la vista previa
        if (this.currentTool !== 'pencil' && this.imageData) {
            this.ctx.putImageData(this.imageData, 0, 0);
        }

        this.ctx.strokeStyle = this.color;
        this.ctx.fillStyle = this.color;
        this.ctx.lineWidth = this.lineWidth;

        switch(this.currentTool) {
            case 'pencil':
                // trazo libre
                this.ctx.lineTo(currentX, currentY);
                this.ctx.stroke();
                break;

            case 'rectangle':
                this.ctx.beginPath();
                const width = currentX - this.startX;
                const height = currentY - this.startY;
                this.ctx.strokeRect(this.startX, this.startY, width, height);
                break;

            case 'circle':
                this.ctx.beginPath();
                const radius = Math.sqrt(
                    Math.pow(currentX - this.startX, 2) + 
                    Math.pow(currentY - this.startY, 2)
                );
                this.ctx.arc(this.startX, this.startY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                break;

            case 'line':
                // dibujar línea; si la regla está activada y hay elemento, usar su rotación
                if (this.imageData) this.ctx.putImageData(this.imageData, 0, 0);
                const dx = currentX - this.startX;
                const dy = currentY - this.startY;
                const dist = Math.sqrt(dx*dx + dy*dy) || 0;
                let angleDeg;
                // Priority: forced angle (user input) -> ruler element rotation (legacy) -> dynamic angle from mouse
                if (this.forceAngleEnabled && typeof this.forcedAngle === 'number') {
                    angleDeg = this.forcedAngle % 360;
                    if (angleDeg < 0) angleDeg += 360;
                } else if (this.ruler && this.rulerEl && this.rulerEl.dataset && this.rulerEl.dataset.rotation) {
                    angleDeg = Number(this.rulerEl.dataset.rotation) || 0;
                } else {
                    angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
                    if (angleDeg < 0) angleDeg += 360;
                }

                const rad = angleDeg * Math.PI / 180;
                const snapX = this.startX + Math.cos(rad) * dist;
                const snapY = this.startY + Math.sin(rad) * dist;

                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(snapX, snapY);
                this.ctx.stroke();

                // mostrar indicador: mostrar el múltiplo de 45 cercano además del ángulo real
                const snapped = Math.round(angleDeg / 45) * 45;
                if (this.angleIndicator) {
                    this.angleIndicator.style.display = 'block';
                    // If the user forced an angle, show that exact value; otherwise show the real current angle
                    const shown = (this.forceAngleEnabled && typeof this.forcedAngle === 'number') ? Math.round(angleDeg) : Math.round(angleDeg);
                    // shown is the real angle; keep snapped value available for other UI if needed
                    this.angleIndicator.textContent = shown + '°';
                    // Indicator is positioned in CSS pixels, not canvas internal pixels.
                    this.angleIndicator.style.left = (point.viewX + 12) + 'px';
                    this.angleIndicator.style.top = (point.viewY + 12) + 'px';
                }

                break;
        }

        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            // Guardar el estado final después de completar la figura
            this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            // ocultar indicador de ángulo
            if (this.angleIndicator) this.angleIndicator.style.display = 'none';
            // Save a history snapshot representing the state after this action so undo/redo works
            this.saveHistorySnapshot();
        }
    }

    // History management
    saveHistorySnapshot() {
        try {
            const snap = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            // If we undid some steps and then take a new action, drop future states
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }
            this.history.push(snap);
            // Trim history if necessary
            while (this.history.length > this.maxHistory) {
                this.history.shift();
            }
            // Ensure historyIndex points to the last snapshot
            this.historyIndex = this.history.length - 1;
        } catch (err) {
            console.warn('Unable to save history snapshot:', err);
        }
    }

    restoreHistoryIndex(idx) {
        if (idx < 0 || idx >= this.history.length) return false;
        try {
            const img = this.history[idx];
            this.ctx.putImageData(img, 0, 0);
            this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.historyIndex = idx;
            return true;
        } catch (err) {
            console.warn('Unable to restore history index:', err);
            return false;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.restoreHistoryIndex(this.historyIndex - 1);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.restoreHistoryIndex(this.historyIndex + 1);
        }
    }

    setTool(tool) {
        this.currentTool = tool;
        this.canvas.style.cursor = 'crosshair';
    }

    hexToRgba(hexColor) {
        const hex = (hexColor || '').replace('#', '').trim();
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return { r, g, b, a: 255 };
        }
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return { r, g, b, a: 255 };
        }
        return { r: 0, g: 0, b: 0, a: 255 };
    }

    colorNear(data, offset, color, tolerance) {
        return (
            Math.abs(data[offset] - color.r) <= tolerance &&
            Math.abs(data[offset + 1] - color.g) <= tolerance &&
            Math.abs(data[offset + 2] - color.b) <= tolerance &&
            Math.abs(data[offset + 3] - color.a) <= tolerance
        );
    }

    floodFill(startX, startY) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        if (startX < 0 || startY < 0 || startX >= width || startY >= height) return;

        const tolerance = 20;
        const image = this.ctx.getImageData(0, 0, width, height);
        const data = image.data;

        const startOffset = (startY * width + startX) * 4;
        const target = {
            r: data[startOffset],
            g: data[startOffset + 1],
            b: data[startOffset + 2],
            a: data[startOffset + 3]
        };
        const fill = this.hexToRgba(this.color);

        if (this.colorNear(data, startOffset, fill, 0)) return;

        const visited = new Uint8Array(width * height);
        const stack = [startX, startY];

        while (stack.length > 0) {
            const y = stack.pop();
            const x = stack.pop();

            if (x < 0 || y < 0 || x >= width || y >= height) continue;

            const idx = y * width + x;
            if (visited[idx]) continue;

            const offset = idx * 4;
            if (!this.colorNear(data, offset, target, tolerance)) continue;

            visited[idx] = 1;
            data[offset] = fill.r;
            data[offset + 1] = fill.g;
            data[offset + 2] = fill.b;
            data[offset + 3] = fill.a;

            stack.push(x + 1, y);
            stack.push(x - 1, y);
            stack.push(x, y + 1);
            stack.push(x, y - 1);
        }

        this.ctx.putImageData(image, 0, 0);
    }

    setRuler(enabled) {
        this.ruler = !!enabled;
        if (this.rulerEl) {
            this.rulerEl.style.display = (this.ruler && this.currentTool === 'line') ? 'block' : 'none';
        }
        // Do not forcibly hide the angle indicator here — angle display may be used without a visual ruler.
    }

    // Registrar elemento DOM de la regla (imagen overlay)
    setRulerElement(el) {
        this.rulerEl = el;
        if (this.rulerEl) {
            // asegurarse de que tenga dataset.rotation
            if (!this.rulerEl.dataset.rotation) this.rulerEl.dataset.rotation = '0';
            // make sure it's positioned absolute in the wrapper
            this.rulerEl.style.position = 'absolute';
            this.rulerEl.style.display = 'none';
        }
    }

    // Permite pasar un elemento DOM para mostrar el ángulo de la regla
    setAngleIndicator(el) {
        this.angleIndicator = el;
        if (this.angleIndicator) {
            this.angleIndicator.style.position = 'absolute';
            this.angleIndicator.style.pointerEvents = 'none';
            this.angleIndicator.style.display = 'none';
        }
    }

    // New: set the forced angle (degrees). Pass null to clear.
    setForcedAngle(deg) {
        if (deg === null || deg === undefined || deg === '') {
            this.forcedAngle = null;
            return;
        }
        const n = Number(deg);
        if (!isNaN(n)) {
            this.forcedAngle = n % 360;
            if (this.forcedAngle < 0) this.forcedAngle += 360;
        }
    }

    // New: enable or disable using the forced angle
    setForceAngleEnabled(enabled) {
        this.forceAngleEnabled = !!enabled;
    }

    setColor(color) {
        this.color = color;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
    }

    setLineWidth(width) {
        // Asegurar valor numérico
        const w = Number(width) || 1;
        this.lineWidth = w;
        this.ctx.lineWidth = w;
    }

    clear() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        // Save snapshot AFTER clear so the cleared state is the latest and undo will restore previous
        this.saveHistorySnapshot();
    }
}
