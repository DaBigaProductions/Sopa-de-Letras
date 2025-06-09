const select = document.getElementById('tamano');
const botones = document.getElementById('botones');
const resultado = document.getElementById('resultado');
let intervaloCronometro = null;

select.addEventListener('change', () => {
    detenerCronometro();
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
    detenerCronometro();

    const formData = new FormData();
    formData.append('accion', accion);
    formData.append('cuadricula', cuadricula);

    fetch('eluno.php', {
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

    fetch('eluno.php', {
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

    fetch('eluno.php', {
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

    fetch('eluno.php', {
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

    // Limpia selección previa pero SIN recargar la sopa
    document.querySelectorAll('.letra-btn.seleccionado').forEach(btn => btn.classList.remove('seleccionado'));
    seleccion = [];
    direccionFija = null;
    document.getElementById('seleccion').textContent = '';

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
    
    const tamano = parseInt(document.getElementById('tamano').value);

    cargar('jugar', tamano);
}


function verificarSeleccion() {
    const seleccionada = seleccion.map(b => b.textContent.trim()).join('').toUpperCase();
    const correcta = document.getElementById('respuesta-correcta').value.toUpperCase();
    const invertida = correcta.split('').reverse().join('');

    if (seleccionada === correcta || seleccionada === invertida) {
        alert("😮 Has encontrado la palabra, ¡muy bien!");
        detenerCronometro();

        const tiempoActual = document.getElementById('cronometro').textContent;
        alert(`⏱ Tu tiempo fue: ${tiempoActual}`);

        const formData = new FormData();
        formData.append('palabra', correcta); // SIEMPRE la original
        formData.append('cuadricula', parseInt(document.getElementById('tamano').value));
        formData.append('demora', tiempoActual);

        fetch('record.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(msg => {
            // Limpieza de mensaje si viene con HTML
            resultado.innerHTML = msg;

            if (msg.includes("✅ Registro guardado en el Top 3")) {
                alert("🎉 ¡Tu tiempo fue registrado en el Top 3!");
            } else if (msg.includes("No mejoras el tiempo")) {
                alert("😌 Buen intento, pero no entraste en el Top 3.");
            } else if (msg.includes("Datos inválidos")) {
                alert("⚠️ Datos inválidos, por favor revisa.");
            } else if (msg.includes("Error al guardar")) {
                alert("❌ Error al guardar el registro.");
            }
        });

    } else {
        alert("😒 Esa no es la palabra correcta.");
    }
}

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

document.addEventListener('mousedown', empezarSeleccion);
document.addEventListener('mouseover', continuarSeleccion);
document.addEventListener('mouseup', () => {
    seleccionando = false;
});
