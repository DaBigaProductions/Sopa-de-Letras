const select = document.getElementById('tamano');
const botones = document.getElementById('botones');
const resultado = document.getElementById('resultado');

select.addEventListener('change', () => {
    const val = select.value;
    botones.innerHTML = `
        <button class="botonjugar" onclick="cargar('jugar', ${val})" style="">Jugar</button>
        <button class="botonpalabras" onclick="cargar('ver_palabras', ${val})">Ver Palabras</button>
    `;
    resultado.innerHTML = '';
});

function cargar(accion, cuadricula) {
    const formData = new FormData();
    formData.append('accion', accion);
    formData.append('cuadricula', cuadricula);

    fetch('index.php', {  // 👈 Aquí nos aseguramos de apuntar a index.php
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

    fetch('index.php', {  // 👈 También apuntamos a index.php
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

    fetch('index.php', {  // 👈 Siempre usar index.php
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

document.addEventListener('click', e => {
    if (e.target.tagName === 'TD') {
        e.target.classList.add('seleccionado');
        seleccion.push(e.target.textContent);
        document.getElementById('seleccion').textContent = seleccion.join('');
    }
});

function reiniciarSeleccion() {
    document.querySelectorAll('.seleccionado').forEach(td => td.classList.remove('seleccionado'));
    seleccion = [];
    document.getElementById('seleccion').textContent = '';
}

function verificarSeleccion() {
    const seleccionada = seleccion.join('');
    const correcta = document.getElementById('respuesta-correcta').value;
    if (seleccionada === correcta) {
        alert("¡Correcto! Encontraste la palabra.");
    } else {
        alert("Incorrecto. Intenta de nuevo.");
    }
}
