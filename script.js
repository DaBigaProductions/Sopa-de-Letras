const select = document.getElementById('tamano');
const botones = document.getElementById('botones');
const resultado = document.getElementById('resultado');
let intervaloCronometro = null;

select.addEventListener('change', () => {
    const val = select.value;
    botones.innerHTML = `
        <div class="contenedorbotonesjugarverpalabrsas">
            <button class="botonjugar" onclick="cargar('jugar', ${val})">Jugar</button>
            <button class="botonpalabras" onclick="cargar('ver_palabras', ${val})">Ver Palabras</button>
        </div>
    `;
    resultado.innerHTML = '';
});

function cargar(accion, cuadricula) {
    const formData = new FormData();
    formData.append('accion', accion);
    formData.append('cuadricula', cuadricula);

    fetch('index.php', {  
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(html => {
        resultado.innerHTML = html;

        if (accion === 'jugar') {
            setTimeout(() => {
                window.inicioJuego = Date.now() / 1000;
                iniciarCronometro();
            }, 100);
        }
    });
}

function eliminarPalabra(id, cuadricula) {
    const formData = new FormData();
    formData.append('accion', 'eliminar');
    formData.append('id', id);

    fetch('index.php', {  
        method: 'POST',
        body: formData
    }).then(() => cargar('ver_palabras', cuadricula));
}

function agregarPalabra(event, cuadricula) {
    event.preventDefault();
    const input = event.target.querySelector('input[name="nueva"]');
    const formData = new FormData();
    formData.append('accion', 'agregar');
    formData.append('palabra', input.value);
    formData.append('cuadricula', cuadricula);

    fetch('index.php', {  
        method: 'POST',
        body: formData
    }).then(() => cargar('ver_palabras', cuadricula));
}

function editarPalabra(id, palabra) {
    const nueva = prompt("Nueva palabra:", palabra);
    if (!nueva) return;

    const formData = new FormData();
    formData.append('accion', 'editar');
    formData.append('id', id);
    formData.append('palabra', nueva);

    fetch('index.php', {
        method: 'POST',
        body: formData
    }).then(() => cargar('ver_palabras', document.getElementById('tamano').value));
}

let seleccion = [];
let seleccionando = false;
let direccionFija = null;

function empezarSeleccion(event) {
    if (!event.target.classList.contains('letra-btn')) return;

    seleccionando = true;
    reiniciarSeleccion();

    const btn = event.target;
    btn.classList.add('seleccionado');
    seleccion.push(btn);
    direccionFija = null;

    document.getElementById('seleccion').textContent = btn.textContent;
}

function continuarSeleccion(event) {
    if (!seleccionando || !event.target.classList.contains('letra-btn')) return;

    const btn = event.target;
    if (btn.classList.contains('seleccionado')) return;

    const anterior = seleccion[seleccion.length - 1];
    const dx = parseInt(btn.dataset.x) - parseInt(anterior.dataset.x);
    const dy = parseInt(btn.dataset.y) - parseInt(anterior.dataset.y);

    if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) return;

    if (seleccion.length === 1) {
        direccionFija = [dx, dy];
    } else {
        const [fx, fy] = direccionFija;
        if (dx !== fx || dy !== fy) return;
    }

    btn.classList.add('seleccionado');
    seleccion.push(btn);
    actualizarTextoSeleccionado();
}

function actualizarTextoSeleccionado() {
    const texto = seleccion.map(b => b.textContent.trim()).join('');
    document.getElementById('seleccion').textContent = texto;
}

function reiniciarSeleccion() {
    document.querySelectorAll('.letra-btn.seleccionado').forEach(btn => btn.classList.remove('seleccionado'));
    seleccion = [];
    direccionFija = null;
    document.getElementById('seleccion').textContent = '';
}

function verificarSeleccion() {
    const seleccionada = seleccion.map(b => b.textContent.trim()).join('').toUpperCase();
    const correcta = document.getElementById('respuesta-correcta').value.toUpperCase();
    const invertida = correcta.split('').reverse().join('');

    if (seleccionada === correcta || seleccionada === invertida) {
        alert("😮 Has encontrado la palabra, ¡muy bien!");

        detenerCronometro(); // ⏹ Detiene el cronómetro

        const fin = performance.now() / 1000; // En segundos
        const demora = fin - window.inicioJuego;
        const cuadricula = parseInt(document.getElementById('tamano').value);
        const palabra = correcta;

        const formData = new FormData();
        formData.append('palabra', palabra);
        formData.append('cuadricula', cuadricula);
        const minutos = Math.floor(demora / 60).toString().padStart(2, '0');
        const segundos = Math.floor(demora % 60).toString().padStart(2, '0');
        formData.append('demora', `${minutos}:${segundos}`);

        fetch('record.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.text())
        .then(msg => {
            if (msg === "nuevo_record") {
                alert("🎉 ¡Nuevo récord guardado!");
            } else {
                alert("✅ Palabra correcta. No es nuevo récord.");
            }
        });
    } else {
        alert("😒 Esa no es la palabra correcta.");
    }
}

// ⏱ Funciones del cronómetro
function iniciarCronometro() {
    if (intervaloCronometro) clearInterval(intervaloCronometro);

    intervaloCronometro = setInterval(() => {
        const ahora = Date.now() / 1000;
        const diferencia = ahora - window.inicioJuego;

        const minutos = Math.floor(diferencia / 60).toString().padStart(2, '0');
        const segundos = Math.floor(diferencia % 60).toString().padStart(2, '0');

        document.getElementById('cronometro').textContent = `${minutos}:${segundos}`;
    }, 1000);
}

function detenerCronometro() {
    clearInterval(intervaloCronometro);
}

// Eventos del mouse
document.addEventListener('mousedown', empezarSeleccion);
document.addEventListener('mouseover', continuarSeleccion);
document.addEventListener('mouseup', () => {
    seleccionando = false;
});
