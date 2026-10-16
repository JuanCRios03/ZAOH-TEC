// ================= MENU HAMBURGER RESPONSIVE =================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar menú hamburger
    initMobileMenu();
    
    // Detectar redimensión de ventana para ajustar menú
    window.addEventListener('resize', function() {
        const nav = document.querySelector('.nav-menu');
        const toggle = document.querySelector('.mobile-menu-toggle');
        
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
        }
    });
});

function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            // Toggle active classes
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevenir scroll del body cuando el menú está abierto
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Cerrar menú al hacer click en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Cerrar menú al hacer click fuera de él
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// ================= TOUCH OPTIMIZATION FOR GAMES =================
// Optimizar juegos para dispositivos táctiles
function optimizeForTouch() {
    // Detectar si es dispositivo táctil
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Añadir clase para dispositivos táctiles
        document.body.classList.add('touch-device');
        
        // Optimizar sopa de letras para touch
        optimizeWordSearchForTouch();
        
        // Optimizar juego de memoria para touch
        optimizeMemoryGameForTouch();
        
        // Optimizar crucigrama para touch
        optimizeCrosswordForTouch();
    }
}

function optimizeWordSearchForTouch() {
    // Hacer las celdas de la sopa de letras más grandes en touch
    const wordGrid = document.querySelector('.word-grid');
    if (wordGrid) {
        wordGrid.classList.add('touch-optimized');
        
        // Añadir estilos específicos para touch
        const touchStyle = document.createElement('style');
        touchStyle.textContent = `
            .touch-device .word-grid td {
                min-width: 35px !important;
                min-height: 35px !important;
                font-size: 16px !important;
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
                touch-action: none;
            }
            
            .touch-device .word-grid {
                border-spacing: 2px;
                touch-action: none;
            }
            
            .touch-device .word-grid td.selecting {
                background-color: rgba(42, 171, 226, 0.5) !important;
                transform: scale(1.1);
                transition: all 0.1s ease;
            }
        `;
        
        if (!document.getElementById('touch-word-search-styles')) {
            touchStyle.id = 'touch-word-search-styles';
            document.head.appendChild(touchStyle);
        }
    }
}

function optimizeMemoryGameForTouch() {
    // Añadir feedback táctil a las cartas
    const memoryCards = document.querySelectorAll('.memory-card');
    memoryCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.add('touch-feedback');
        });
        
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-feedback');
            }, 150);
        });
    });
}

function optimizeCrosswordForTouch() {
    // Mejorar input del crucigrama para móviles
    const crosswordInputs = document.querySelectorAll('.crossword-cell input');
    crosswordInputs.forEach(input => {
        // Evitar zoom en iOS
        input.style.fontSize = '16px';
        
        // Mejorar la selección en touch
        input.addEventListener('touchstart', function() {
            this.select();
        });
        
        // Mejorar entrada de texto en móviles
        input.addEventListener('input', function(e) {
            const val = e.target.value.toUpperCase();
            e.target.value = val.slice(-1); // mantener solo último char
            
            // Detectar dirección automática y avanzar
            if (e.target.value) {
                const r = parseInt(e.target.dataset.row);
                const c = parseInt(e.target.dataset.col);
                
                // Buscar número de palabra activo para determinar dirección
                const wordDirection = detectWordDirection(e.target);
                
                if (wordDirection === 'H') {
                    // Mover horizontalmente
                    const nextCell = document.querySelector(`input[data-row="${r}"][data-col="${c+1}"]`);
                    if (nextCell) nextCell.focus();
                } else if (wordDirection === 'V') {
                    // Mover verticalmente
                    const nextCell = document.querySelector(`input[data-row="${r+1}"][data-col="${c}"]`);
                    if (nextCell) nextCell.focus();
                }
            }
        });
    });
    
    // Función para detectar dirección de palabra activa
    function detectWordDirection(input) {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        
        // Buscar número en la celda actual o celdas anteriores
        const currentCell = input.closest('.crossword-cell');
        
        // Si la celda tiene número, verificar qué direcciones son posibles
        if (currentCell.querySelector('.cw-number')) {
            const right = document.querySelector(`input[data-row="${r}"][data-col="${c+1}"]`);
            const down = document.querySelector(`input[data-row="${r+1}"][data-col="${c}"]`);
            
            // Si solo hay una dirección posible, usar esa
            if (right && !down) return 'H';
            if (down && !right) return 'V';
            
            // Si hay ambas direcciones, preferir horizontal por defecto
            if (right && down) return 'H';
        }
        
        // Buscar hacia atrás para encontrar el inicio de la palabra
        // Buscar horizontalmente hacia la izquierda
        for (let i = c - 1; i >= 0; i--) {
            const prevCell = document.querySelector(`input[data-row="${r}"][data-col="${i}"]`);
            if (!prevCell) break;
            
            const prevCellContainer = prevCell.closest('.crossword-cell');
            if (prevCellContainer.querySelector('.cw-number')) {
                // Verificar si desde esta celda hay continuidad horizontal
                let hasHorizontalContinuity = true;
                for (let j = i + 1; j <= c; j++) {
                    const checkCell = document.querySelector(`input[data-row="${r}"][data-col="${j}"]`);
                    if (!checkCell) {
                        hasHorizontalContinuity = false;
                        break;
                    }
                }
                if (hasHorizontalContinuity) return 'H';
            }
        }
        
        // Buscar verticalmente hacia arriba
        for (let i = r - 1; i >= 0; i--) {
            const prevCell = document.querySelector(`input[data-row="${i}"][data-col="${c}"]`);
            if (!prevCell) break;
            
            const prevCellContainer = prevCell.closest('.crossword-cell');
            if (prevCellContainer.querySelector('.cw-number')) {
                // Verificar si desde esta celda hay continuidad vertical
                let hasVerticalContinuity = true;
                for (let j = i + 1; j <= r; j++) {
                    const checkCell = document.querySelector(`input[data-row="${j}"][data-col="${c}"]`);
                    if (!checkCell) {
                        hasVerticalContinuity = false;
                        break;
                    }
                }
                if (hasVerticalContinuity) return 'V';
            }
        }
        
        // Por defecto, determinar según vecinos inmediatos
        const right = document.querySelector(`input[data-row="${r}"][data-col="${c+1}"]`);
        const down = document.querySelector(`input[data-row="${r+1}"][data-col="${c}"]`);
        
        if (right && !down) return 'H';
        if (down && !right) return 'V';
        
        // Si hay ambos o ninguno, usar horizontal por defecto
        return 'H';
    }
}

// Inicializar optimizaciones táctiles cuando se carga la página
document.addEventListener('DOMContentLoaded', optimizeForTouch);

// ================= CRUCIGRAMA DINÁMICO (10 PALABRAS) =================
// Generador automático que intenta cruzar todas las palabras y reintenta hasta lograr un solo componente conectado
class Crossword {
    constructor() {
        this.gridSize = 13;
        this.maxAttempts = 50;
        // Lista personalizada solicitada por el usuario (pregunta / respuesta)
        this.wordBank = [
            { word: 'REGLA', clue: 'Instrumento que se usa para trazar líneas rectas en el dibujo técnico.' },
            { word: 'GRAFITO', clue: 'Técnica de dibujo con lápices de diferentes durezas.' },
            { word: 'BORRADOR', clue: 'Objeto que se usa para borrar errores en el papel.' },
            { word: 'REALISMO', clue: 'Estilo de dibujo que representa la realidad con precisión.' },
            { word: 'TECNICO', clue: 'Tipo de dibujo usado para planos de ingeniería o arquitectura.' },
            { word: 'SOMBREADO', clue: 'Mezcla suave y difuminada de tonos en dibujo artístico.' },
            { word: 'PAPEL', clue: 'Superficie sobre la que normalmente se dibuja con lápiz.' },
            { word: 'PLANO', clue: 'Representación de un objeto a escala.' },
            { word: 'CARBONCILLO', clue: 'Técnica que usa carbón vegetal.' },
            { word: 'ACUARELA', clue: 'Técnica artística que usa agua y pigmentos transparentes.' }
        ];
        this.normalizeWords();
        this.generate();
        this.render();
        this.attachEvents();
        this.direction = 'H'; // dirección de escritura actual (H o V)
    }

    normalizeWords() {
        // Eliminar tildes y forzar mayúsculas
        const normalize = (w) => w.normalize('NFD').replace(/\p{Diacritic}/gu,'').toUpperCase();
        this.wordBank.forEach(w => w.word = normalize(w.word));
    }

    clearState() {
        this.grid = Array.from({length: this.gridSize}, ()=> Array(this.gridSize).fill(''));
        this.placedWords = [];
        this.numberMap = {};
        // Barajar wordBank para nuevo orden de pistas y numeración
        this.shuffleArray(this.wordBank);
    }

    generate() {
        let attempt = 0;
        do {
            this.clearState();
            this.layoutOnce();
            attempt++;
            if (this.isConnected() && this.allWordsCrossed()) break;
        } while (attempt < this.maxAttempts);
        // Separar listas finales
        this.horizontals = this.placedWords.filter(w=>w.dir==='H');
        this.verticals = this.placedWords.filter(w=>w.dir==='V');
    }

    layoutOnce() {
        // Permitir elegir una palabra base entre las más largas (top 3) y orientación aleatoria
        const sortedLen = [...this.wordBank].sort((a,b)=> b.word.length - a.word.length);
        const candidates = sortedLen.slice(0, Math.min(3, sortedLen.length));
        const base = candidates[Math.floor(Math.random()*candidates.length)];
        const remaining = this.wordBank.filter(w => w !== base);
        const horizontal = Math.random() < 0.6; // ligeramente preferir horizontal
        let row, col;
        if (horizontal) {
            row = Math.floor(this.gridSize * (0.3 + Math.random()*0.4)); // evitar extremos
            col = Math.floor(Math.random() * (this.gridSize - base.word.length + 1));
            this.placeWord(base.word, row, col, 'H');
            this.placedWords.push({ ...base, row, col, dir:'H' });
        } else {
            col = Math.floor(this.gridSize * (0.3 + Math.random()*0.4));
            row = Math.floor(Math.random() * (this.gridSize - base.word.length + 1));
            this.placeWord(base.word, row, col, 'V');
            this.placedWords.push({ ...base, row, col, dir:'V' });
        }
        // Barajar resto para variedad en orden de inserción
        this.shuffleArray(remaining);
        for (const w of remaining) this.tryPlace(w);
        // Numeración según posición de inicio en orden de aparición de palabras colocadas
        let num=1;
        for (const w of this.placedWords) {
            const key=`${w.row}-${w.col}`;
            if(!this.numberMap[key]) this.numberMap[key]=num++;
            w.number=this.numberMap[key];
        }
    }

    placeWord(word, row, col, dir) {
        for (let i=0;i<word.length;i++) {
            if (dir==='H') this.grid[row][col+i]=word[i];
            else this.grid[row+i][col]=word[i];
        }
    }

    canPlace(word,row,col,dir) {
        if (dir==='H') {
            if (col<0 || col+word.length>this.gridSize) return false;
            for (let i=0;i<word.length;i++) {
                const cell=this.grid[row][col+i];
                if (cell && cell!==word[i]) return false;
                if (!cell) { // bordes verticales libres
                    if (row>0 && this.grid[row-1][col+i]) return false;
                    if (row<this.gridSize-1 && this.grid[row+1][col+i]) return false;
                }
            }
            // evitar letras adyacentes al inicio/fin
            if (col>0 && this.grid[row][col-1]) return false;
            if (col+word.length<this.gridSize && this.grid[row][col+word.length]) return false;
            return true;
        } else {
            if (row<0 || row+word.length>this.gridSize) return false;
            for (let i=0;i<word.length;i++) {
                const cell=this.grid[row+i][col];
                if (cell && cell!==word[i]) return false;
                if (!cell) {
                    if (col>0 && this.grid[row+i][col-1]) return false;
                    if (col<this.gridSize-1 && this.grid[row+i][col+1]) return false;
                }
            }
            if (row>0 && this.grid[row-1][col]) return false;
            if (row+word.length<this.gridSize && this.grid[row+word.length][col]) return false;
            return true;
        }
    }

    tryPlace(entry) {
        const word = entry.word;
        // Primero intentar cruzar con palabras ya colocadas
        const shuffled = [...this.placedWords];
        for (const placed of shuffled) {
            for (let i=0;i<word.length;i++) {
                const letter = word[i];
                for (let j=0;j<placed.word.length;j++) {
                    if (placed.word[j]===letter) {
                        if (placed.dir==='H') { // intentar vertical
                            const row = placed.row - i;
                            const col = placed.col + j;
                            if (this.canPlace(word,row,col,'V')) {
                                this.placeWord(word,row,col,'V');
                                this.placedWords.push({ ...entry,row,col,dir:'V'});
                                return;
                            }
                        } else { // placed vertical -> intentar horizontal
                            const row = placed.row + j;
                            const col = placed.col - i;
                            if (this.canPlace(word,row,col,'H')) {
                                this.placeWord(word,row,col,'H');
                                this.placedWords.push({ ...entry,row,col,dir:'H'});
                                return;
                            }
                        }
                    }
                }
            }
        }
        // Fallback: barrido
        // Si no se pudo cruzar, NO colocarla aislada (se intentará en otro intento global)
    }

    isConnected() {
        if (!this.placedWords.length) return false;
        // Construir grafo de palabras: arista si comparten una coordenada letra
        const n = this.placedWords.length;
        const adj = Array.from({length:n},()=>[]);
        const cellsMap = new Map(); // key row-col -> indices
        this.placedWords.forEach((w,idx)=>{
            for (let i=0;i<w.word.length;i++) {
                const r = w.dir==='H'? w.row : w.row+i;
                const c = w.dir==='H'? w.col+i : w.col;
                const key = `${r}-${c}`;
                if (!cellsMap.has(key)) cellsMap.set(key,[]);
                cellsMap.get(key).push(idx);
            }
        });
        cellsMap.forEach(list=>{
            if (list.length>1) {
                for (let i=0;i<list.length;i++) for (let j=i+1;j<list.length;j++) {
                    adj[list[i]].push(list[j]);
                    adj[list[j]].push(list[i]);
                }
            }
        });
        const visited = new Set();
        const stack=[0];
        while(stack.length){
            const v=stack.pop();
            if (visited.has(v)) continue;
            visited.add(v);
            for (const nb of adj[v]) if (!visited.has(nb)) stack.push(nb);
        }
        return visited.size===n;
    }

    allWordsCrossed() {
        if (this.placedWords.length < this.wordBank.length) return false;
        // Cada palabra debe tener al menos un cruce (compartir al menos una celda con otra) excepto la primera base
        const cellToWords = new Map();
        this.placedWords.forEach((w,idx)=>{
            for (let i=0;i<w.word.length;i++) {
                const r = w.dir==='H'? w.row : w.row+i;
                const c = w.dir==='H'? w.col+i : w.col;
                const key = r+'-'+c;
                if (!cellToWords.has(key)) cellToWords.set(key,[]);
                cellToWords.get(key).push(idx);
            }
        });
        const crossingCounts = Array(this.placedWords.length).fill(0);
        cellToWords.forEach(arr=>{ if(arr.length>1) arr.forEach(i=>crossingCounts[i]++); });
        return crossingCounts.every((count,idx)=> idx===0 ? true : count>0);
    }

    regenerate() {
        this.generate();
        this.render();
        // Limpiar mensaje de resultado/solución previo
        const res = document.getElementById('crossword-result');
        if (res) { res.style.display='none'; res.textContent=''; res.className='crossword-result'; }
        // Quitar clases de estado residuales si hubiera
        document.querySelectorAll('#crossword-grid input').forEach(i=> i.classList.remove('cw-correct','cw-error','locked'));
    }

    shuffleArray(arr){
        for(let i=arr.length-1;i>0;i--){
            const j=Math.floor(Math.random()*(i+1));
            [arr[i],arr[j]]=[arr[j],arr[i]];
        }
    }

    render() {
        const gridEl = document.getElementById('crossword-grid');
        if(!gridEl) return;
        gridEl.innerHTML='';
    // Usa variable CSS para permitir ajuste centralizado del tamaño de celdas
    gridEl.style.gridTemplateColumns = `repeat(${this.gridSize}, var(--cw-cell-size))`;
    gridEl.style.gridTemplateRows = `repeat(${this.gridSize}, var(--cw-cell-size))`;
    const starts = new Set(this.placedWords.map(w=>`${w.row}-${w.col}`));
        for (let r=0;r<this.gridSize;r++) {
            for (let c=0;c<this.gridSize;c++) {
                const cell = document.createElement('div');
                cell.className='crossword-cell';
                const val = this.grid[r][c];
                if (val) {
                    const input=document.createElement('input');
                    input.maxLength=1;
                    input.dataset.answer=val;
                    input.dataset.row=r;
                    input.dataset.col=c;
                    cell.appendChild(input);
                    const key=`${r}-${c}`;
                    if (starts.has(key)) {
                        const num = document.createElement('span');
                        num.className='number';
                        num.textContent=this.numberMap[key];
                        cell.appendChild(num);
                    }
                } else {
                    cell.classList.add('black');
                }
                gridEl.appendChild(cell);
            }
        }
        // Pistas
        const horiz = document.getElementById('horizontal-clues');
        const vert = document.getElementById('vertical-clues');
        if (horiz) horiz.innerHTML='';
        if (vert) vert.innerHTML='';
        const addClue = (parent, w) => {
            const div=document.createElement('div');
            div.className='clue';
            div.textContent=`${w.number}. ${w.clue}`;
            parent.appendChild(div);
        };
        this.horizontals.sort((a,b)=>a.number-b.number).forEach(w=>addClue(horiz,w));
        this.verticals.sort((a,b)=>a.number-b.number).forEach(w=>addClue(vert,w));

        // Después de renderizar, añadir navegación
        this.addNavigationHandlers();
    }

    attachEvents() {
        const checkBtn=document.getElementById('check-crossword');
        const clearBtn=document.getElementById('clear-crossword');
        const showBtn=document.getElementById('show-solution');
        const regenBtn=document.getElementById('regen-crossword');
        if (checkBtn) checkBtn.onclick=()=>this.check();
        if (clearBtn) clearBtn.onclick=()=>this.clear();
        if (showBtn) showBtn.onclick=()=>this.solve();
    if (regenBtn) regenBtn.onclick=()=>{ this.regenerate(); };
    }

    addNavigationHandlers() {
        const inputs = document.querySelectorAll('#crossword-grid input');
        inputs.forEach(inp => {
            inp.addEventListener('input', e => {
                const val = e.target.value.toUpperCase();
                e.target.value = val.slice(-1); // mantener solo último char
                
                // Detectar dirección inteligentemente y mover al siguiente
                if (e.target.value) {
                    this.smartFocusNext(e.target);
                }
            });
            
            inp.addEventListener('keydown', e => {
                const key = e.key;
                if (key === 'ArrowRight') { 
                    this.direction='H'; 
                    this.focusDirectional(e.target, 0, 1); 
                    e.preventDefault(); 
                }
                else if (key === 'ArrowLeft') { 
                    this.direction='H'; 
                    this.focusDirectional(e.target, 0, -1); 
                    e.preventDefault(); 
                }
                else if (key === 'ArrowDown') { 
                    this.direction='V'; 
                    this.focusDirectional(e.target, 1, 0); 
                    e.preventDefault(); 
                }
                else if (key === 'ArrowUp') { 
                    this.direction='V'; 
                    this.focusDirectional(e.target, -1, 0); 
                    e.preventDefault(); 
                }
                else if (key === 'Backspace') {
                    if (e.target.value) {
                        // Si hay una letra en la casilla actual, eliminarla
                        e.target.value = '';
                        e.preventDefault();
                    } else {
                        // Si la casilla está vacía, ir a la anterior y eliminar su contenido
                        this.smartFocusPrev(e.target);
                        if (document.activeElement && document.activeElement !== e.target) {
                            document.activeElement.value = '';
                        }
                        e.preventDefault();
                    }
                } else if (key === 'Tab') {
                    // permitir tabulador natural
                }
            });
            
            inp.addEventListener('click', e => {
                // Solo establecer dirección al hacer click inicial
                this.updateDirectionFromContext(e.target);
            });
            
            inp.addEventListener('focus', e => {
                // Solo establecer dirección si no hay una ya establecida
                if (!this.direction) {
                    this.updateDirectionFromContext(e.target);
                }
            });
        });
    }

    updateDirectionFromContext(input) {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        
        // Buscar número de palabra activo para determinar dirección
        const wordDirection = this.detectWordDirection(input);
        this.direction = wordDirection;
    }

    detectWordDirection(input) {
        const r = parseInt(input.dataset.row);
        const c = parseInt(input.dataset.col);
        
        // Buscar número en la celda actual
        const currentCell = input.closest('.crossword-cell');
        
        // Si la celda actual tiene número, verificar qué direcciones son posibles
        if (currentCell.querySelector('.cw-number')) {
            const right = document.querySelector(`input[data-row="${r}"][data-col="${c+1}"]`);
            const down = document.querySelector(`input[data-row="${r+1}"][data-col="${c}"]`);
            
            // Si solo hay una dirección posible, usar esa
            if (right && !down) return 'H';
            if (down && !right) return 'V';
            
            // Si hay ambas direcciones, preferir horizontal por defecto
            if (right && down) return 'H';
        }
        
        // Buscar hacia atrás para encontrar el inicio de la palabra
        // Buscar horizontalmente hacia la izquierda
        for (let i = c - 1; i >= 0; i--) {
            const prevCell = document.querySelector(`input[data-row="${r}"][data-col="${i}"]`);
            if (!prevCell) break;
            
            const prevCellContainer = prevCell.closest('.crossword-cell');
            if (prevCellContainer.querySelector('.cw-number')) {
                // Verificar si desde esta celda hay continuidad horizontal
                let hasHorizontalContinuity = true;
                for (let j = i + 1; j <= c; j++) {
                    const checkCell = document.querySelector(`input[data-row="${r}"][data-col="${j}"]`);
                    if (!checkCell) {
                        hasHorizontalContinuity = false;
                        break;
                    }
                }
                if (hasHorizontalContinuity) return 'H';
            }
        }
        
        // Buscar verticalmente hacia arriba
        for (let i = r - 1; i >= 0; i--) {
            const prevCell = document.querySelector(`input[data-row="${i}"][data-col="${c}"]`);
            if (!prevCell) break;
            
            const prevCellContainer = prevCell.closest('.crossword-cell');
            if (prevCellContainer.querySelector('.cw-number')) {
                // Verificar si desde esta celda hay continuidad vertical
                let hasVerticalContinuity = true;
                for (let j = i + 1; j <= r; j++) {
                    const checkCell = document.querySelector(`input[data-row="${j}"][data-col="${c}"]`);
                    if (!checkCell) {
                        hasVerticalContinuity = false;
                        break;
                    }
                }
                if (hasVerticalContinuity) return 'V';
            }
        }
        
        // Por defecto, determinar según vecinos inmediatos
        const right = document.querySelector(`input[data-row="${r}"][data-col="${c+1}"]`);
        const down = document.querySelector(`input[data-row="${r+1}"][data-col="${c}"]`);
        
        if (right && !down) return 'H';
        if (down && !right) return 'V';
        
        // Si hay ambos o ninguno, usar horizontal por defecto
        return 'H';
    }

    smartFocusNext(current) {
        // Usar la dirección ya establecida, NO detectar una nueva
        if (this.direction === 'H') {
            this.focusDirectional(current, 0, 1);
        } else {
            this.focusDirectional(current, 1, 0);
        }
    }

    smartFocusPrev(current) {
        // Usar la dirección ya establecida, NO detectar una nueva
        if (this.direction === 'H') {
            this.focusDirectional(current, 0, -1);
        } else {
            this.focusDirectional(current, -1, 0);
        }
    }

    focusDirectional(current, dr, dc) {
        const row = parseInt(current.dataset.row), col = parseInt(current.dataset.col);
        let r = row + dr, c = col + dc;
        while (r>=0 && r<this.gridSize && c>=0 && c<this.gridSize) {
            const next = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
            if (next) { next.focus(); return; }
            r += dr; c += dc;
        }
    }

    focusNext(current) {
        if (this.direction==='H') {
            this.focusDirectional(current, 0, 1);
        } else {
            this.focusDirectional(current, 1, 0);
        }
    }

    focusPrev(current) {
        if (this.direction==='H') {
            this.focusDirectional(current, 0, -1);
        } else {
            this.focusDirectional(current, -1, 0);
        }
    }

    check() {
        // Construir estado por palabra
        let letterCorrect=0, letterTotal=0, wordsOk=0;
        const wordStatus = this.placedWords.map(()=>true);
        this.placedWords.forEach((w,idx)=>{
            for (let i=0;i<w.word.length;i++) {
                const r = w.dir==='H'? w.row : w.row+i;
                const c = w.dir==='H'? w.col+i : w.col;
                const inp = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
                if (!inp) { wordStatus[idx]=false; continue; }
                letterTotal++;
                if (inp.value.toUpperCase()===inp.dataset.answer) letterCorrect++; else wordStatus[idx]=false;
            }
            if (wordStatus[idx]) wordsOk++;
        });
        // Limpiar clases previas
        document.querySelectorAll('#crossword-grid input').forEach(i=> i.classList.remove('cw-correct','cw-error'));
        // Aplicar clases
        this.placedWords.forEach((w,idx)=>{
            for (let i=0;i<w.word.length;i++) {
                const r = w.dir==='H'? w.row : w.row+i;
                const c = w.dir==='H'? w.col+i : w.col;
                const inp = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
                if (!inp) continue;
                if (wordStatus[idx]) inp.classList.add('cw-correct');
                else if (inp.value && inp.value.toUpperCase()!==inp.dataset.answer) inp.classList.add('cw-error');
            }
        });
        const pct = Math.round(letterCorrect/letterTotal*100);
        const res = document.getElementById('crossword-result');
        if (res) {
            res.className = 'crossword-result '+(pct===100?'correct':(pct>=60?'correct':'incorrect'));
            res.innerHTML = pct===100 ? '¡Excelente! Completo.' : `Letras correctas: ${letterCorrect}/${letterTotal} (${pct}%). Palabras completas: ${wordsOk}/${this.placedWords.length}`;
            res.style.display='block';
        }
        
        // Si está 100% completo, mostrar felicitaciones especiales
        if (pct === 100) {
            this.showVictoryMessage();
        }
    }
    
    showVictoryMessage() {
        const overlay = document.createElement('div');
        overlay.className = 'victory-overlay-crossword';
        overlay.innerHTML = `
            <div class="victory-modal-crossword">
                <div class="victory-animation">
                    <i class="fas fa-trophy"></i>
                    <div class="confetti"></div>
                </div>
                <h2 class="victory-title-crossword">
                    🎉 ¡FELICITACIONES! 🎉
                </h2>
                <p class="victory-text-crossword">
                    ¡Has completado el crucigrama perfectamente!<br>
                    <span class="highlight-text">¡Eres un maestro de los conceptos de dibujo!</span>
                </p>
                <div class="victory-stats">
                    <div class="stat-item">
                        <i class="fas fa-check-circle"></i>
                        <span>100% Completado</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-star"></i>
                        <span>${this.placedWords.length} Palabras Correctas</span>
                    </div>
                </div>
                <div class="victory-buttons-crossword">
                    <button class="victory-btn-crossword play-again">
                        <i class="fas fa-redo"></i>
                        Jugar de Nuevo
                    </button>
                    <button class="victory-btn-crossword explore">
                        <i class="fas fa-cog"></i>
                        Explorar Técnico
                    </button>
                    <button class="victory-btn-crossword close">
                        <i class="fas fa-times"></i>
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('show'), 100);
        
        // Event listeners para los botones
        overlay.querySelector('.play-again').onclick = () => {
            overlay.remove();
            this.regenerate();
        };
        
        overlay.querySelector('.explore').onclick = () => {
            window.location.href = 'tecnico.html';
        };
        
        overlay.querySelector('.close').onclick = () => {
            overlay.remove();
        };
        
        // Cerrar al hacer clic fuera del modal
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }

    clear() {
        document.querySelectorAll('#crossword-grid input').forEach(i=>{ i.value=''; i.classList.remove('cw-correct','cw-error'); });
        const res=document.getElementById('crossword-result');
        if (res) res.style.display='none';
    }

    solve() {
        this.placedWords.forEach(w=>{
            for (let i=0;i<w.word.length;i++) {
                const r = w.dir==='H'? w.row : w.row+i;
                const c = w.dir==='H'? w.col+i : w.col;
                const inp = document.querySelector(`input[data-row="${r}"][data-col="${c}"]`);
                if (inp) { inp.value=inp.dataset.answer; inp.classList.add('cw-correct'); inp.classList.remove('cw-error'); }
            }
        });
        const res=document.getElementById('crossword-result');
        if (res) { res.textContent='Solución mostrada'; res.style.display='block'; }
    }
}

// Funcionalidad del carrusel
function initializeCarousel() {
    const carouselContainers = document.querySelectorAll('.carousel-container');

    carouselContainers.forEach((container) => {
        const wrapper = container.querySelector('.carousel-wrapper');
        const slides = container.querySelectorAll('.carousel-slide');
        const prevButton = container.querySelector('.carousel-button.prev');
        const nextButton = container.querySelector('.carousel-button.next');
        const dotsContainer = container.querySelector('.carousel-dots');

        if (!wrapper || !slides.length || !prevButton || !nextButton || !dotsContainer) {
            return;
        }

        let currentSlide = 0;
        const totalSlides = slides.length;

        dotsContainer.innerHTML = '';

        // Crear puntos indicadores para este carrusel
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        // Función para actualizar la posición del carrusel
        function updateCarousel() {
            wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        // Función para ir a una diapositiva específica
        function goToSlide(index) {
            currentSlide = index;
            updateCarousel();
        }

        // Event listeners para los botones
        prevButton.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        });

        nextButton.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        });

        // Auto-play
        let interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }, 5000);

        // Pausar auto-play cuando el mouse está sobre el carrusel
        container.addEventListener('mouseenter', () => clearInterval(interval));
        container.addEventListener('mouseleave', () => {
            interval = setInterval(() => {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateCarousel();
            }, 5000);
        });

        // Soporte para gestos táctiles
        let touchStartX = 0;
        let touchEndX = 0;

        wrapper.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        wrapper.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                currentSlide = (currentSlide + 1) % totalSlides;
            } else if (touchEndX - touchStartX > 50) {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            }
            updateCarousel();
        });
    });
}

// Inicializar solo el carrusel (la sopa de letras fue eliminada)
document.addEventListener('DOMContentLoaded', () => {
    initializeCarousel();
});

// Datos de ejemplo para los temas
const topics = {
    tecnica: [
        {
            title: 'Programación Básica',
            description: 'Aprende los fundamentos de la programación con ejemplos prácticos y divertidos.',
            steps: [
                'Introducción a algoritmos con ejemplos de la vida diaria',
                'Variables y tipos de datos usando analogías',
                'Estructuras de control con juegos interactivos',
                'Funciones básicas con ejemplos prácticos'
            ],
            videoUrl: '../assets/videos/programacion-basica.mp4',
        },
        {
            title: 'Robótica Educativa',
            description: 'Descubre el emocionante mundo de la robótica y cómo construir tus primeros proyectos.',
            steps: [
                'Conceptos básicos de robótica',
                'Componentes electrónicos principales',
                'Ensamblaje de un robot simple',
                'Programación básica del robot'
            ],
            videoUrl: '../assets/videos/robotica-educativa.mp4',
        }
    ],
    artistica: [
        {
            title: 'Diseño Digital Creativo',
            description: 'Explora tu creatividad utilizando herramientas digitales de diseño.',
            steps: [
                'Introducción a herramientas de diseño',
                'Creación de logos simples',
                'Diseño de carteles digitales',
                'Animaciones básicas'
            ],
            videoUrl: '../assets/videos/diseno-digital.mp4',
        },
        {
            title: 'Arte y Tecnología',
            description: 'Combina el arte tradicional con herramientas tecnológicas modernas.',
            steps: [
                'Digitalización de dibujos',
                'Edición básica de imágenes',
                'Creación de collages digitales',
                'Exposición digital de arte'
            ],
            videoUrl: '../assets/videos/arte-tecnologia.mp4',
        }
    ],
    teorica: [
        {
            title: 'Historia de la Computación',
            description: 'Conoce la fascinante evolución de las computadoras y la tecnología.',
            steps: [
                'Primeras máquinas de cálculo',
                'Evolución de los computadores',
                'Internet y su historia',
                'Tecnologías del futuro'
            ],
            videoUrl: '../assets/videos/historia-computacion.mp4',
        },
        {
            title: 'Seguridad Digital',
            description: 'Aprende a protegerte en el mundo digital y usar Internet de forma segura.',
            steps: [
                'Importancia de la seguridad en línea',
                'Creación de contraseñas seguras',
                'Navegación segura en Internet',
                'Protección de datos personales'
            ],
            videoUrl: '../assets/videos/seguridad-digital.mp4',
        }
    ],
};

// Función para crear una tarjeta de tema
function createTopicCard(topic) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    
    card.innerHTML = `
        <h3>${topic.title}</h3>
        <p>${topic.description}</p>
        <div class="steps">
            <h4>Pasos:</h4>
            <ol>
                ${topic.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
        <div class="video-container">
            <video controls>
                <source src="${topic.videoUrl}" type="video/mp4">
                Tu navegador no soporta el elemento de video.
            </video>
        </div>
    `;

    return card;
}

// Función para cargar los temas en cada sección
function loadTopics() {
    const sections = ['tecnica', 'artistica', 'teorica'];
    
    sections.forEach(section => {
        const container = document.querySelector(`#${section} .topics-container`);
        topics[section].forEach(topic => {
            container.appendChild(createTopicCard(topic));
        });
    });
}

// Cargar los temas cuando el documento esté listo
document.addEventListener('DOMContentLoaded', loadTopics);

// --- Fondo dinámico: parallax por movimiento del ratón y suavizado ---
(function() {
    const root = document.documentElement;
    const container = document.querySelector('.background-container');
    if (!container) return;

    let lastX = 0, lastY = 0;
    let rafId = null;

    // Throttle helper
    function throttleUpdate(x, y) {
        lastX = x;
        lastY = y;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            // Map mouse position to small translation values
            const tx = (lastX - window.innerWidth / 2) * 0.02; // reduce movement
            const ty = (lastY - window.innerHeight / 2) * 0.02;

            root.style.setProperty('--bg-x', `${-tx}px`);
            root.style.setProperty('--bg-y', `${-ty}px`);

            // Also move blobs slightly using CSS variables on each blob
            const blobs = document.querySelectorAll('.blob');
            blobs.forEach((b, i) => {
                const depth = (i + 1) * 6; // different depth per blob
                const bx = (lastX - window.innerWidth / 2) * (0.01 * (i + 1));
                const by = (lastY - window.innerHeight / 2) * (0.008 * (i + 1));
                b.style.transform = `translate3d(${bx}px, ${by}px, 0) scale(${1 + i*0.02})`;
            });

            rafId = null;
        });
    }

    // Mouse move for desktop
    function onMouseMove(e) {
        if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
        throttleUpdate(e.clientX, e.clientY);
    }

    // Touch fallback: use touchmove
    function onTouchMove(e) {
        const t = e.touches[0];
        if (!t) return;
        throttleUpdate(t.clientX, t.clientY);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // Reduce motion respect
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
    }
})();

// ===============================================
// SISTEMA DE JUEGOS DE VISTAS TÉCNICAS
// ===============================================

// Estado global de los juegos
let gameStates = {
    1: { completed: false, score: 0, attempts: 0 },
    2: { completed: false, score: 0, attempts: 0 },
    3: { completed: false, score: 0, attempts: 0 },
    4: { completed: false, score: 0, attempts: 0 },
    5: { completed: false, score: 0, attempts: 0 },
    6: { completed: false, score: 0, attempts: 0 },
    7: { completed: false, score: 0, attempts: 0 },
    8: { completed: false, score: 0, attempts: 0 },
    9: { completed: false, score: 0, attempts: 0 },
    10: { completed: false, score: 0, attempts: 0 }
};

// Inicializar juegos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeViewGames();
});

function initializeViewGames() {
    // Agregar event listeners a todas las opciones
    document.querySelectorAll('.option-view').forEach(option => {
        option.addEventListener('click', handleOptionClick);
    });
    
    // Actualizar el progreso general
    updateOverallProgress();
}

function handleOptionClick(event) {
    const option = event.currentTarget;
    const gameElement = option.closest('.view-game');
    const gameNumber = parseInt(gameElement.dataset.game);
    
    // Si el juego ya está completado, no permitir más clics
    if (gameStates[gameNumber].completed) {
        return;
    }
    
    // Remover selección anterior
    gameElement.querySelectorAll('.option-view').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Marcar la opción seleccionada
    option.classList.add('selected');
    
    // Verificar respuesta después de un breve delay para mostrar la selección
    setTimeout(() => {
        checkAnswer(gameNumber, option);
    }, 500);
}

function checkAnswer(gameNumber, selectedOption) {
    const gameElement = document.querySelector(`[data-game="${gameNumber}"]`);
    const isCorrect = selectedOption.dataset.correct === 'true';
    const resultElement = document.getElementById(`result-${gameNumber}`);
    const statusElement = document.getElementById(`status-${gameNumber}`);
    
    // Incrementar intentos
    gameStates[gameNumber].attempts++;
    
    // Mostrar todas las respuestas
    gameElement.querySelectorAll('.option-view').forEach(option => {
        if (option.dataset.correct === 'true') {
            option.classList.add('correct');
        } else if (option.classList.contains('selected')) {
            option.classList.add('incorrect');
        }
        
        // Deshabilitar más clics
        option.style.pointerEvents = 'none';
    });
    
    // Mostrar resultado
    resultElement.style.display = 'block';
    
    if (isCorrect) {
        // Respuesta correcta
        const baseScore = 1000;
        const attemptPenalty = (gameStates[gameNumber].attempts - 1) * 100;
        const finalScore = Math.max(baseScore - attemptPenalty, 100);
        
        gameStates[gameNumber].score = finalScore;
        gameStates[gameNumber].completed = true;
        
        resultElement.classList.add('correct');
        resultElement.querySelector('.result-message').innerHTML = `
            <i class="fas fa-check-circle"></i> ¡Excelente! Respuesta correcta<br>
            <small>Puntuación obtenida: ${finalScore} puntos</small>
        `;
        
        statusElement.querySelector('.score').textContent = `Puntuaje: ${finalScore}`;
        
        // Celebración con confeti (opcional)
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        
    } else {
        // Respuesta incorrecta
        resultElement.classList.add('incorrect');
        resultElement.querySelector('.result-message').innerHTML = `
            <i class="fas fa-times-circle"></i> Respuesta incorrecta<br>
            <small>La respuesta correcta se destacará en verde.</small>
        `;
    }
    
    // Actualizar progreso general
    updateOverallProgress();
}

function updateOverallProgress() {
    const completedGames = Object.values(gameStates).filter(game => game.completed).length;
    const totalScore = Object.values(gameStates).reduce((sum, game) => sum + game.score, 0);
    const maxPossibleScore = 10000; // 10 juegos × 1000 puntos máximo
    
    // Actualizar elementos del DOM
    const completedElement = document.getElementById('completed-games');
    const totalScoreElement = document.getElementById('total-score');
    const progressFill = document.getElementById('overall-progress');
    
    if (completedElement) {
        completedElement.textContent = `${completedGames}/10`;
    }
    
    if (totalScoreElement) {
        totalScoreElement.textContent = `${totalScore}/${maxPossibleScore}`;
    }
    
    if (progressFill) {
        const progressPercentage = (completedGames / 10) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    // Mostrar botón de reiniciar cuando se completen todos los juegos
    const restartContainer = document.getElementById('restart-container');
    console.log('Juegos completados:', completedGames);
    console.log('Elemento restart-container:', restartContainer);
    
    if (restartContainer) {
        if (completedGames >= 1) {  // Mostrar con 1 o más juegos completados
            console.log('Mostrando botón de reiniciar');
            restartContainer.style.display = 'block';
        } else {
            restartContainer.style.display = 'none';
        }
    }
    
    // Mensaje especial cuando completen todos los juegos
    if (completedGames === 10) {
        setTimeout(() => {
            showCompletionMessage(totalScore);
        }, 1000);
    }
}

function showCompletionMessage(totalScore) {
    const percentage = (totalScore / 10000) * 100;
    let message = '';
    let level = '';
    
    if (percentage >= 90) {
        level = '¡EXPERTO!';
        message = '¡Increíble! Dominas perfectamente las vistas técnicas.';
    } else if (percentage >= 75) {
        level = '¡MUY BUENO!';
        message = '¡Excelente trabajo! Tienes un gran conocimiento de vistas técnicas.';
    } else if (percentage >= 60) {
        level = '¡BUENO!';
        message = '¡Bien hecho! Continúa practicando para mejorar aún más.';
    } else {
        level = '¡SIGUE PRACTICANDO!';
        message = 'Buen esfuerzo. Te recomendamos repasar los conceptos y volver a intentar.';
    }
    
    // Crear modal de felicitación
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-trophy"></i> ¡Juegos Completados!</h2>
            </div>
            <div class="modal-body">
                <div class="completion-badge">
                    <div class="badge-icon">🎯</div>
                    <div class="badge-level">${level}</div>
                </div>
                <p>${message}</p>
                <div class="final-stats">
                    <div class="stat">
                        <span class="stat-number">${totalScore}</span>
                        <span class="stat-label">Puntos Totales</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${percentage.toFixed(1)}%</span>
                        <span class="stat-label">Precisión</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="restartTest()" class="restart-test-btn">
                    <i class="fas fa-redo"></i> Reiniciar Test
                </button>
                <button onclick="closeCompletionModal()" class="close-modal-btn">
                    <i class="fas fa-check"></i> ¡Genial!
                </button>
            </div>
        </div>
    `;
    
    // Agregar estilos del modal
    const style = document.createElement('style');
    style.textContent = `
        .completion-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        .completion-modal .modal-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
            margin: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideInUp 0.4s ease;
        }
        .completion-modal .modal-header h2 {
            color: var(--primary-color);
            margin-bottom: 30px;
        }
        .completion-badge {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 25px;
        }
        .badge-icon {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .badge-level {
            font-size: 1.5rem;
            font-weight: bold;
        }
        .final-stats {
            display: flex;
            justify-content: space-around;
            margin: 25px 0;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        .stat-label {
            font-size: 0.9rem;
            color: #666;
        }
        .modal-footer {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        .restart-test-btn {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .restart-test-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
        }
        .close-modal-btn {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .close-modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideInUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
}

function closeCompletionModal() {
    const modal = document.querySelector('.completion-modal');
    if (modal) {
        modal.remove();
    }
}

function restartTest() {
    // Cerrar el modal de finalización
    closeCompletionModal();
    
    // Reiniciar todos los estados de los juegos
    for (let i = 1; i <= 10; i++) {
        gameStates[i] = {
            completed: false,
            attempts: 0,
            score: 0
        };
        
        // Resetear estado visual de cada juego
        const gameElement = document.querySelector(`[data-game="${i}"]`);
        if (gameElement) {
            // Limpiar selecciones
            gameElement.querySelectorAll('.option-view').forEach(option => {
                option.classList.remove('selected', 'correct', 'incorrect');
                option.style.pointerEvents = 'auto';
            });
            
            // Ocultar resultado
            const resultElement = document.getElementById(`result-${i}`);
            if (resultElement) {
                resultElement.style.display = 'none';
                resultElement.classList.remove('correct', 'incorrect');
            }
            
            // Resetear puntuación
            const statusElement = document.getElementById(`status-${i}`);
            if (statusElement) {
                statusElement.querySelector('.score').textContent = 'Puntaje: 0';
            }
        }
    }
    
    // Actualizar progreso general
    updateOverallProgress();
    
    // SCROLL SIMPLE AL INICIO DE LA PÁGINA
    console.log('Ejecutando scroll al inicio...');
    
    // Método más simple y directo
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
    
    // Fallback sin animación por si el smooth no funciona
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        console.log('Scroll completado');
    }, 100);
}

// ===== PERSPECTIVE TEST - MISMA PÁGINA =====
function openPerspectiveGame() {
    console.log('Abriendo Test de Perspectiva en la misma página...');
    
    // Ocultar la sección principal
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.display = 'none';
    }
    
    // Mostrar la sección del test
    const testSection = document.getElementById('test-perspectiva-section');
    if (testSection) {
        testSection.style.display = 'block';
        // Hacer scroll al top
        window.scrollTo(0, 0);
        console.log('Test de Perspectiva activado');
    }
}

function closePerspectiveTest() {
    console.log('Cerrando Test de Perspectiva...');
    
    // Ocultar la sección del test
    const testSection = document.getElementById('test-perspectiva-section');
    if (testSection) {
        testSection.style.display = 'none';
    }
    
    // Mostrar la sección principal
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.style.display = 'block';
        // Hacer scroll al top
        window.scrollTo(0, 0);
        console.log('Volviendo a la sección técnica');
    }
}

// Inicializar los botones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, configurando Test de Perspectiva en misma página...');
    
    // Botón para abrir el test
    const openBtn = document.getElementById('open-perspective-test');
    if (openBtn) {
        console.log('Botón de apertura encontrado');
        openBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón clickeado! Abriendo test en misma página...');
            openPerspectiveGame();
        });
    }
    
    // Botones para cerrar el test
    const closeBtn = document.getElementById('close-test');
    const backBtn = document.getElementById('back-to-tecnico');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closePerspectiveTest();
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closePerspectiveTest();
        });
    }

    // Initialize image zoom functionality
    initializeImageZoom();
});

// Image Zoom Functionality
function initializeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    const zoomImg = document.getElementById('zoomImage');
    const zoomCaption = document.getElementById('zoomCaption');
    const closeBtn = document.getElementById('zoomClose');
    
    // Add click event to all images
    document.querySelectorAll('.view-image').forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent the click from bubbling up to parent elements
            e.preventDefault();  // Prevent any default behavior
            openImageZoom(this.src, this.alt);
        });
    });
    
    // Close modal events
    closeBtn.addEventListener('click', closeImageZoom);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageZoom();
        }
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeImageZoom();
        }
    });
}

function openImageZoom(src, alt) {
    const modal = document.getElementById('imageZoomModal');
    const zoomImg = document.getElementById('zoomImage');
    const zoomCaption = document.getElementById('zoomCaption');
    
    zoomImg.src = src;
    zoomImg.alt = alt;
    zoomCaption.textContent = alt;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ===== JUEGO DE BUSCAR PAREJAS =====

class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('memory-game-board');
        this.timerElement = document.getElementById('timer');
        this.pairsElement = document.getElementById('pairs-found');
        this.attemptsElement = document.getElementById('attempts');
        this.startBtn = document.getElementById('start-game');
        this.restartBtn = document.getElementById('restart-game');
        
        // Nuevo sistema de notificaciones
        this.gameResult = document.getElementById('game-result');
        this.resultMessage = document.getElementById('result-message');
        this.resultStats = document.getElementById('result-stats');
        this.closeResultBtn = document.getElementById('close-result');
        
        // Verificar que todos los elementos existan
        if (!this.gameResult) {
            console.error('Game result elements not found!');
            return;
        }
        
        console.log('Memory game initialized successfully'); // Debug
        
        // Imágenes artísticas para las parejas (8 parejas = 16 cartas)
        this.artworks = [
            {
                image: 'assets/images/campo de trigo con cipreses.jpg',
                name: 'Campo de Trigo con Cipreses'
            },
            {
                image: 'assets/images/campo de trigo con cuervos.jpeg',
                name: 'Campo de Trigo con Cuervos'
            },
            {
                image: 'assets/images/Comedores de patatas.jpg',
                name: 'Los Comedores de Patatas'
            },
            {
                image: 'assets/images/composición VII.jpg',
                name: 'Composición VII'
            },
            {
                image: 'assets/images/mona lisa.webp',
                name: 'La Mona Lisa'
            },
            {
                image: 'assets/images/Noche estrellada.webp',
                name: 'La Noche Estrellada'
            },
            {
                image: 'assets/images/Primera acuarela abstracta.jpg',
                name: 'Primera Acuarela Abstracta'
            },
            {
                image: 'assets/images/the blue rigi.jpeg',
                name: 'The Blue Rigi'
            }
        ];
        
        // Estado del juego
        this.reset();
        
        // Event listeners
        this.initEventListeners();
    }
    
    reset() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.gameTime = 90; // 1 minuto 30 segundos
        this.gameStarted = false;
        this.gameEnded = false;
        this.timer = null;
        
        this.updateStats();
    }
    
    initEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.closeResultBtn.addEventListener('click', () => this.closeResult());
    }
    
    startGame() {
        // Asegurar que no haya resultados visibles
        this.gameResult.style.display = 'none';
        this.gameBoard.style.display = 'grid';
        
        this.reset();
        this.createBoard();
        this.startTimer();
        this.gameStarted = true;
        
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'flex';
    }
    
    restartGame() {
        // Ocultar cualquier resultado visible
        this.gameResult.style.display = 'none';
        
        // Mostrar el tablero de juego
        this.gameBoard.style.display = 'grid';
        
        // Reiniciar el juego directamente
        this.endGame();
        this.startGame();
    }
    
    createBoard() {
        // Crear array con pares de obras de arte
        const gameArtworks = [...this.artworks, ...this.artworks];
        
        // Mezclar las cartas
        this.shuffleArray(gameArtworks);
        
        // Limpiar el tablero
        this.gameBoard.innerHTML = '';
        
        // Crear las cartas
        gameArtworks.forEach((artwork, index) => {
            const card = this.createCard(artwork, index);
            this.cards.push(card);
            this.gameBoard.appendChild(card.element);
        });
    }
    
    createCard(artwork, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.index = index;
        
        cardElement.innerHTML = `
            <div class="card-face card-front">
                <div class="card-question">?</div>
            </div>
            <div class="card-face card-back">
                <img src="${artwork.image}" alt="${artwork.name}" class="artwork-image" onerror="console.error('Error loading image: ${artwork.image}')">
                <div class="artwork-title">${artwork.name}</div>
            </div>
        `;
        
        const card = {
            element: cardElement,
            artwork: artwork,
            index: index,
            isFlipped: false,
            isMatched: false
        };
        
        cardElement.addEventListener('click', () => this.flipCard(card));
        
        // Debug: verificar que la imagen se está creando correctamente
        console.log('Card created:', artwork.name, artwork.image);
        
        return card;
    }
    
    flipCard(card) {
        if (!this.gameStarted || this.gameEnded || card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }
        
        console.log('Flipping card:', card.artwork.name); // Debug
        
        card.isFlipped = true;
        card.element.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.attempts++;
            this.updateStats();
            setTimeout(() => this.checkMatch(), 1500); // Aumentar tiempo para ver las imágenes
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.artwork.image === card2.artwork.image) {
            // ¡Pareja encontrada!
            card1.isMatched = true;
            card2.isMatched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            
            this.matchedPairs++;
            this.updateStats();
            
            // Verificar si se completó el juego
            if (this.matchedPairs === this.artworks.length) {
                this.endGame(true); // Victoria
            }
        } else {
            // No coinciden, voltear de vuelta
            card1.isFlipped = false;
            card2.isFlipped = false;
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }
        
        this.flippedCards = [];
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.gameTime--;
            this.updateTimer();
            
            if (this.gameTime <= 0) {
                this.endGame(false); // Derrota por tiempo agotado
            }
        }, 1000);
    }
    
    updateTimer() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Cambiar color cuando queda poco tiempo
        if (this.gameTime <= 30) {
            this.timerElement.style.color = 'var(--accent-color)';
        } else {
            this.timerElement.style.color = 'var(--color-blue)';
        }
    }
    
    updateStats() {
        this.pairsElement.textContent = `${this.matchedPairs}/${this.artworks.length}`;
        this.attemptsElement.textContent = this.attempts;
    }
    
    endGame(victory = false) {
        this.gameEnded = true;
        this.gameStarted = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.showResult(victory);
        
        this.startBtn.style.display = 'flex';
        this.restartBtn.style.display = 'none';
    }
    
    showResult(victory) {
        console.log('Showing result, victory:', victory); // Debug
        
        // Ocultar el tablero de juego
        this.gameBoard.style.display = 'none';
        
        // Mostrar el resultado
        this.gameResult.style.display = 'block';
        
        if (victory) {
            this.gameResult.className = 'memory-game-result victory';
            this.resultMessage.innerHTML = '🏆 ¡Felicitaciones!<br>¡Has encontrado todas las 8 parejas!';
            
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            this.resultStats.innerHTML = `
                <p><strong>🎉 ¡Juego Completado!</strong></p>
                <p>⏱️ Tiempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
                <p>🎯 Total de intentos: ${this.attempts}</p>
                <p>⭐ ¡Excelente trabajo!</p>
            `;
        } else {
            this.gameResult.className = 'memory-game-result defeat';
            this.resultMessage.innerHTML = '⏰ ¡Tiempo agotado!<br>No completaste el juego a tiempo';
            
            this.resultStats.innerHTML = `
                <p><strong>⌛ Se acabó el tiempo</strong></p>
                <p>🎯 Parejas encontradas: ${this.matchedPairs}/8</p>
                <p>🎲 Total de intentos: ${this.attempts}</p>
                <p>💪 ¡Inténtalo de nuevo!</p>
            `;
        }
        
        console.log('Result should be visible now'); // Debug
    }
    
    closeResult() {
        this.gameResult.style.display = 'none';
        this.gameBoard.style.display = 'grid';
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}


// Inicializar el juego cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar el juego si estamos en la página artística
    if (document.getElementById('memory-game-board')) {
        new MemoryGame();
    }
    
    // Inicializar crucigrama si estamos en la página teórica
    if (document.getElementById('crossword-grid')) {
        new Crossword();
    }
    // Inicializar sopa de letras (versión original basada en tabla) si existe el contenedor
    if (document.getElementById('word-search-game')) {
        renderWordSearch();
    }
});

// ===== IMPLEMENTACIÓN ORIGINAL DE SOPA DE LETRAS (TABLA) =====
// Configuración de la sopa de letras
const wordSearchConfig = {
    words: [
        'CUBO',
        'ISOMETRICO',
        'VISTA LATERAL',
        'PROYECCION',
        'EJES',
        'PLANOS',
        'FIGURAS',
        'SOMBREADO',
        'AREA',
        'DIMENSION'
    ],
    gridSize: 12,
    directions: ['horizontal', 'vertical', 'diagonal']
};

// Función para crear la matriz de la sopa de letras
function createWordSearchGrid() {
    const grid = Array(wordSearchConfig.gridSize).fill().map(() => 
        Array(wordSearchConfig.gridSize).fill(''));
    const placedWords = [];
    
    // Ordenar palabras por longitud (más largas primero)
    const sortedWords = wordSearchConfig.words.slice().sort((a, b) => b.replace(/\s/g, '').length - a.replace(/\s/g, '').length);
    
    for (let word of sortedWords) {
        word = word.replace(/\s/g, ''); // Remover espacios
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 300) {
            const direction = wordSearchConfig.directions[Math.floor(Math.random() * wordSearchConfig.directions.length)];
            const { success, newGrid } = tryPlaceWord(word, grid, direction);
            
            if (success) {
                placed = true;
                grid.forEach((row, i) => {
                    grid[i] = [...newGrid[i]];
                });
                placedWords.push(word);
            }
            attempts++;
        }
    }
    
    // Llenar espacios vacíos con letras aleatorias
    for (let i = 0; i < wordSearchConfig.gridSize; i++) {
        for (let j = 0; j < wordSearchConfig.gridSize; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
    
    return grid;
}

// Función para intentar colocar una palabra en la grilla
function tryPlaceWord(word, grid, direction) {
    const gridCopy = grid.map(row => [...row]);
    let startRow, startCol, rowInc, colInc;
    
    if (direction === 'horizontal') {
        startRow = Math.floor(Math.random() * wordSearchConfig.gridSize);
        startCol = Math.floor(Math.random() * (wordSearchConfig.gridSize - word.length + 1));
        rowInc = 0;
        colInc = 1;
    } else if (direction === 'vertical') {
        startRow = Math.floor(Math.random() * (wordSearchConfig.gridSize - word.length + 1));
        startCol = Math.floor(Math.random() * wordSearchConfig.gridSize);
        rowInc = 1;
        colInc = 0;
    } else { // diagonal
        startRow = Math.floor(Math.random() * (wordSearchConfig.gridSize - word.length + 1));
        startCol = Math.floor(Math.random() * (wordSearchConfig.gridSize - word.length + 1));
        rowInc = 1;
        colInc = 1;
    }
    
    // Verificar si la palabra se puede colocar
    let row = startRow;
    let col = startCol;
    let canPlace = true;
    
    for (let i = 0; i < word.length; i++) {
        if (row >= wordSearchConfig.gridSize || col >= wordSearchConfig.gridSize || row < 0 || col < 0) {
            canPlace = false;
            break;
        }
        
        if (gridCopy[row][col] !== '' && gridCopy[row][col] !== word[i]) {
            canPlace = false;
            break;
        }
        
        row += rowInc;
        col += colInc;
    }
    
    if (canPlace) {
        row = startRow;
        col = startCol;
        
        for (let i = 0; i < word.length; i++) {
            gridCopy[row][col] = word[i];
            row += rowInc;
            col += colInc;
        }
        
        return { success: true, newGrid: gridCopy };
    }
    
    return { success: false, newGrid: gridCopy };
}

// Función para renderizar la sopa de letras
function renderWordSearch() {
    const grid = createWordSearchGrid();
    const container = document.getElementById('word-search-game');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'word-search-grid';
    
    for (let i = 0; i < wordSearchConfig.gridSize; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < wordSearchConfig.gridSize; j++) {
            const cell = document.createElement('td');
            cell.textContent = grid[i][j];
            cell.dataset.row = i;
            cell.dataset.col = j;
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    
    container.appendChild(table);
    
    // Variables para la selección
    let isSelecting = false;
    let startCell = null;
    let selectedCells = new Set();
    let foundWords = new Set();
    
    // Array de colores de la paleta
    const colorPalette = ['color-red', 'color-orange', 'color-yellow', 'color-pink', 'color-blue'];
    const wordColors = new Map(); // Para mantener el color asignado a cada palabra
    
    // Función para obtener un color aleatorio
    function getRandomColor() {
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }
    
    // Funciones auxiliares
    function getSelectedWord() {
        return Array.from(selectedCells).map(cell => cell.textContent).join('');
    }
    
    function checkWord(word) {
        const normalizedWord = word.replace(/\s/g, '');
        const reversedWord = normalizedWord.split('').reverse().join('');
        
        return wordSearchConfig.words.some(originalWord => {
            const normalizedOriginal = originalWord.replace(/\s/g, '');
            return normalizedOriginal === normalizedWord || normalizedOriginal === reversedWord;
        });
    }
    
    function markWordAsFound(word, colorClass) {
        const wordListItems = document.querySelectorAll('#word-list li');
        wordListItems.forEach(li => {
            if (li.textContent.replace(/\s/g, '') === word.replace(/\s/g, '')) {
                li.classList.add('found', colorClass);
            }
        });
    }
    
    // Event listeners para la interacción (Mouse + Touch)
    
    // Función para obtener las coordenadas de un evento (mouse o touch)
    function getEventCoordinates(e) {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    }
    
    // Función para obtener la celda en una posición específica
    function getCellAtPosition(x, y) {
        return document.elementFromPoint(x, y);
    }
    
    // Función para iniciar selección
    function startSelection(target) {
        if (target.tagName === 'TD') {
            isSelecting = true;
            startCell = target;
            selectedCells.clear();
            selectedCells.add(target);
            target.classList.add('selecting');
        }
    }
    
    // Función para actualizar selección
    function updateSelection(target) {
        if (!isSelecting || target.tagName !== 'TD') return;
        
        const currentRow = parseInt(target.dataset.row);
        const currentCol = parseInt(target.dataset.col);
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        
        // Limpiar selección anterior
        document.querySelectorAll('.word-search-grid td').forEach(cell => 
            cell.classList.remove('selecting')
        );
        selectedCells.clear();
        
        // Selección horizontal
        if (currentRow === startRow) {
            const fromCol = Math.min(startCol, currentCol);
            const toCol = Math.max(startCol, currentCol);
            for (let c = fromCol; c <= toCol; c++) {
                const cell = table.rows[currentRow].cells[c];
                cell.classList.add('selecting');
                selectedCells.add(cell);
            }
        }
        // Selección vertical
        else if (currentCol === startCol) {
            const fromRow = Math.min(startRow, currentRow);
            const toRow = Math.max(startRow, currentRow);
            for (let r = fromRow; r <= toRow; r++) {
                const cell = table.rows[r].cells[currentCol];
                cell.classList.add('selecting');
                selectedCells.add(cell);
            }
        }
        // Selección diagonal
        else if (Math.abs(currentRow - startRow) === Math.abs(currentCol - startCol)) {
            const rowDirection = currentRow > startRow ? 1 : -1;
            const colDirection = currentCol > startCol ? 1 : -1;
            const steps = Math.abs(currentRow - startRow);
            
            for (let k = 0; k <= steps; k++) {
                const cell = table.rows[startRow + rowDirection * k].cells[startCol + colDirection * k];
                cell.classList.add('selecting');
                selectedCells.add(cell);
            }
        }
    }
    
    // Función para finalizar selección
    function endSelection() {
        if (!isSelecting) return;
        
        isSelecting = false;
        const selectedWord = getSelectedWord();
        
        if (checkWord(selectedWord) && !foundWords.has(selectedWord)) {
            foundWords.add(selectedWord);
            
            // Asignar color a la palabra si no tiene uno
            if (!wordColors.has(selectedWord)) {
                wordColors.set(selectedWord, getRandomColor());
            }
            
            const colorClass = wordColors.get(selectedWord);
            selectedCells.forEach(cell => {
                cell.classList.add('found', colorClass);
                cell.classList.remove('selecting');
            });
            
            markWordAsFound(selectedWord, colorClass);
            
            // Verificar si se han encontrado todas las palabras
            if (foundWords.size === wordSearchConfig.words.length) {
                setTimeout(() => showVictoryMessage(), 100);
            }
        } else {
            // Limpiar selección si la palabra no es válida
            selectedCells.forEach(cell => cell.classList.remove('selecting'));
        }
        
        selectedCells.clear();
    }
    
    // Event listeners para MOUSE
    table.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startSelection(e.target);
    });
    
    table.addEventListener('mouseover', (e) => {
        updateSelection(e.target);
    });
    
    document.addEventListener('mouseup', endSelection);
    
    // Event listeners para TOUCH (móviles y tablets)
    table.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const coords = getEventCoordinates(e);
        const target = getCellAtPosition(coords.clientX, coords.clientY);
        startSelection(target);
    });
    
    table.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const coords = getEventCoordinates(e);
        const target = getCellAtPosition(coords.clientX, coords.clientY);
        if (target && target.tagName === 'TD') {
            updateSelection(target);
        }
    });
    
    table.addEventListener('touchend', (e) => {
        e.preventDefault();
        endSelection();
    });
    
    // Prevenir el comportamiento por defecto del navegador en touch
    table.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        endSelection();
    });
    
    function showVictoryMessage() {
        // Crear el modal usando el sistema existente del sitio
        const modal = document.createElement('div');
        modal.className = 'game-modal active';
        
        // Overlay para cerrar el modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = () => modal.remove();
        
        // Contenido del modal
        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.cssText = `
            max-width: 500px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            background: linear-gradient(45deg, #2AABE2, #F387AB, #FDDB33, #F37423, #EE4A31);
            background-size: 400% 400%;
            animation: gradientShift 4s ease infinite;
            border: none;
            border-radius: 25px;
            padding: 4px;
        `;
        
        // Contenedor interno blanco
        const innerContent = document.createElement('div');
        innerContent.style.cssText = `
            background: white;
            border-radius: 21px;
            overflow: hidden;
            position: relative;
        `;
        
        // Header del modal con gradiente muy colorido
        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #EE4A31, #F37423, #FDDB33, #2AABE2, #F387AB);
            background-size: 300% 300%;
            animation: gradientShift 3s ease infinite;
            padding: 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        `;
        
        header.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.3) 2px, transparent 2px); background-size: 40px 40px; animation: gradientShift 5s ease infinite;"></div>
            <h2 style="position: relative; z-index: 2; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-size: 1.8rem; margin: 0; font-family: 'FREITAG TRIAL HEAVY', Arial, sans-serif;">
                🎉 ¡FELICITACIONES! 🎉
            </h2>
            <button class="close-modal" onclick="this.closest('.game-modal').remove()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.3); border: none; color: white; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 1.2rem; z-index: 3;">
                ✕
            </button>
        `;
        
        // Body del modal
        const body = document.createElement('div');
        body.style.cssText = `
            padding: 25px 20px;
            text-align: center;
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 50%, #fff 100%);
            position: relative;
        `;
        
        body.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background: 
                radial-gradient(circle at 20% 20%, #2AABE2 2px, transparent 2px),
                radial-gradient(circle at 80% 20%, #EE4A31 2px, transparent 2px),
                radial-gradient(circle at 20% 80%, #F37423 2px, transparent 2px),
                radial-gradient(circle at 80% 80%, #F387AB 2px, transparent 2px),
                radial-gradient(circle at 50% 50%, #FDDB33 2px, transparent 2px);
                background-size: 60px 60px;"></div>
            
            <div style="position: relative; z-index: 2;">
                <p style="font-size: 1.2rem; color: #495057; margin-bottom: 20px; font-weight: 600;">
                    Has completado exitosamente la sopa de letras
                </p>
                
                <div style="background: linear-gradient(135deg, #FFD700, #F37423, #EE4A31, #F387AB); color: white; padding: 20px; border-radius: 20px; margin: 20px 0; font-size: 1.1rem; font-weight: bold; box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5); position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent); transform: rotate(45deg); animation: shine 2s infinite;"></div>
                    <div style="position: relative; z-index: 2;">
                        🏆 ¡Encontraste todas las ${wordSearchConfig.words.length} palabras! 🏆
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin: 20px 0; justify-content: center;">
                    <div style="flex: 1; background: linear-gradient(135deg, #2AABE2, #1f8cbc); color: white; padding: 15px 10px; border-radius: 15px; box-shadow: 0 6px 15px rgba(42, 171, 226, 0.4); text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 3px;">${wordSearchConfig.words.length}</div>
                        <div style="font-size: 0.8rem; opacity: 0.9;">Palabras</div>
                    </div>
                    <div style="flex: 1; background: linear-gradient(135deg, #F387AB, #e0739a); color: white; padding: 15px 10px; border-radius: 15px; box-shadow: 0 6px 15px rgba(243, 135, 171, 0.4); text-align: center;">
                        <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 3px;">100%</div>
                        <div style="font-size: 0.8rem; opacity: 0.9;">Completo</div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 25px;">
                    <button class="continue-btn" style="width: 100%; padding: 15px; border: none; border-radius: 20px; background: linear-gradient(135deg, #2AABE2, #1f8cbc); color: white; font-weight: bold; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(42, 171, 226, 0.4); font-size: 1rem;">
                        <i class="fas fa-cog"></i> Continuar con Dibujo Técnico
                    </button>
                    <button class="artistic-btn" style="width: 100%; padding: 15px; border: none; border-radius: 20px; background: linear-gradient(135deg, #F37423, #EE4A31); color: white; font-weight: bold; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(243, 116, 35, 0.4); font-size: 1rem;">
                        <i class="fas fa-paint-brush"></i> Explorar Dibujo Artístico
                    </button>
                    <button class="again-btn" style="width: 100%; padding: 15px; border: none; border-radius: 20px; background: linear-gradient(135deg, #FDDB33, #F37423); color: white; font-weight: bold; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(253, 219, 51, 0.4); font-size: 1rem; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
                        <i class="fas fa-redo"></i> Jugar de Nuevo
                    </button>
                </div>
            </div>
        `;
        
        // Agregar eventos a los botones
        const continueBtn = body.querySelector('.continue-btn');
        const artisticBtn = body.querySelector('.artistic-btn');
        const againBtn = body.querySelector('.again-btn');
        
        [continueBtn, artisticBtn, againBtn].forEach(btn => {
            btn.onmouseover = () => {
                btn.style.transform = 'scale(1.02)';
                btn.style.boxShadow = btn.style.boxShadow.replace('0 6px', '0 8px');
            };
            btn.onmouseout = () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = btn.style.boxShadow.replace('0 8px', '0 6px');
            };
        });
        
        continueBtn.onclick = () => {
            modal.remove();
            const nextSection = document.querySelector('.gallery-section, .video-section');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
        
        artisticBtn.onclick = () => {
            window.location.href = 'artistica.html';
        };
        
        againBtn.onclick = () => {
            modal.remove();
            location.reload();
        };
        
        // Ensamblar el modal
        innerContent.appendChild(header);
        innerContent.appendChild(body);
        content.appendChild(innerContent);
        modal.appendChild(overlay);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Crear confetti después de mostrar el modal
        setTimeout(() => createConfetti(), 200);
    }
    
    // Función simplificada de confetti
    function createConfetti() {
        const colors = ['#EE4A31', '#F37423', '#FDDB33', '#F387AB', '#2AABE2'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: 50%;
                    z-index: 10001;
                    pointer-events: none;
                    animation: confetti-fall ${Math.random() * 2 + 3}s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                // Remover después de la animación
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.remove();
                    }
                }, 5000);
            }, i * 100);
        }
    }
}