const select = document.getElementById('tamano');
const botones = document.getElementById('botones');
const resultado = document.getElementById('resultado');

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
    .then(html => resultado.innerHTML = html);
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
let inicioX = null;
let inicioY = null;

function empezarSeleccion(event) {
    seleccionando = true;
    reiniciarSeleccion();
    const btn = event.target;
    inicioX = parseInt(btn.dataset.x);
    inicioY = parseInt(btn.dataset.y);
    direccionFija = null; // Se determinará con la segunda letra
    seleccionarLetra(btn);
}

function continuarSeleccion(event) {
    if (!seleccionando || !event.target.classList.contains('letra-btn')) return;

    const btn = event.target;
    const x = parseInt(btn.dataset.x);
    const y = parseInt(btn.dataset.y);

    if (btn.classList.contains('seleccionado')) return;

    const seleccionados = document.querySelectorAll('.letra-btn.seleccionado');

    if (seleccionados.length === 1) {
        const first = seleccionados[0];
        const x1 = parseInt(first.dataset.x);
        const y1 = parseInt(first.dataset.y);

        const dx = x - x1;
        const dy = y - y1;

        if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || (dx === 0 && dy === 0)) return;

        // Guardar dirección como tupla (dx, dy)
        direccionFija = [dx, dy];

    } else {
        const lastBtn = seleccionados[seleccionados.length - 1];
        const lastX = parseInt(lastBtn.dataset.x);
        const lastY = parseInt(lastBtn.dataset.y);

        const dx = x - lastX;
        const dy = y - lastY;

        // Comparar dirección actual con la dirección fija
        if (!direccionFija || dx !== direccionFija[0] || dy !== direccionFija[1]) return;
    }

    seleccionarLetra(btn);
}

function terminarSeleccion() {
    seleccionando = false;
}

function seleccionarLetra(btn) {
    btn.classList.add('seleccionado');
    seleccion.push(btn.textContent.trim());
    document.getElementById('seleccion').textContent = seleccion.join('');
}

function reiniciarSeleccion() {
    document.querySelectorAll('.letra-btn.seleccionado').forEach(btn => btn.classList.remove('seleccionado'));
    seleccion = [];
    direccionFija = null;
    inicioX = null;
    inicioY = null;
    document.getElementById('seleccion').textContent = '';
}

function verificarSeleccion() {
    const seleccionada = seleccion.join('').toUpperCase();
    const correcta = document.getElementById('respuesta-correcta').value.toUpperCase();
    const invertida = correcta.split('').reverse().join('');

    if (seleccionada === correcta || seleccionada === invertida) {
        alert("😮😮😮Has encontrado la palabra, eres muy inteligente.");
    } else {
        alert("😒😒😒No fuiste capaz de encontrar la palabra?, sos un inútil.");
    }
}


document.addEventListener('mouseup', terminarSeleccion);