<?php
// Conexión
$conn = new mysqli("localhost", "root", "", "sopadeletras");

// Procesamiento de acciones
$accion = $_POST['accion'] ?? '';
$cuadricula = $_POST['cuadricula'] ?? '';

if ($accion === 'jugar') {
    // Obtener palabra aleatoria
    $res = $conn->query("SELECT palabra FROM palabras WHERE cuadricula = $cuadricula ORDER BY RAND() LIMIT 1");
    $row = $res->fetch_assoc();
    $palabraOriginal = strtoupper($row['palabra']);
    $palabra = $palabraOriginal;

    $matriz = [];
    $letras = range('A', 'Z');

    for ($i = 0; $i < $cuadricula; $i++) {
        for ($j = 0; $j < $cuadricula; $j++) {
            $matriz[$i][$j] = $letras[array_rand($letras)];
        }
    }

    // Dirección aleatoria
    $direcciones = ['horizontal', 'vertical', 'diagonal'];
    $direccion = $direcciones[array_rand($direcciones)];
    $reversa = rand(0, 1) === 1;

    if ($reversa) $palabra = strrev($palabra);
    $long = strlen($palabra);

    // Insertar palabra en matriz
    $coloca = false;
    while (!$coloca) {
        $x = rand(0, $cuadricula - 1);
        $y = rand(0, $cuadricula - 1);
        $dx = $dy = 0;

        if ($direccion === 'horizontal') $dx = 1;
        if ($direccion === 'vertical') $dy = 1;
        if ($direccion === 'diagonal') $dx = $dy = 1;

        $fin_x = $x + $dx * ($long - 1);
        $fin_y = $y + $dy * ($long - 1);

        if ($fin_x < $cuadricula && $fin_y < $cuadricula) {
            for ($k = 0; $k < $long; $k++) {
                $matriz[$y + $k * $dy][$x + $k * $dx] = $palabra[$k];
            }
            $coloca = true;
        }
    }

    // Mostrar palabra oculta 
    echo "<h3>Busca la palabra: <strong>$palabraOriginal</strong></h3>";
    echo "<input type='hidden' id='respuesta-correcta' value='$palabraOriginal'>";


    echo "<table id='sopa'>";
    for ($i = 0; $i < $cuadricula; $i++) {
        echo "<tr>";
        for ($j = 0; $j < $cuadricula; $j++) {
            $letra = $matriz[$i][$j];
            echo "<td>
                    <button class='letra-btn' 
                            data-x='$j' data-y='$i'
                            onmousedown='empezarSeleccion(event)'
                            onmouseover='continuarSeleccion(event)'
                            onmouseup='terminarSeleccion(event)'>
                        $letra
                    </button>
                </td>";
        }
        echo "</tr>";
    }
    echo "</table>";

    echo "<div>Seleccionado: <span id='seleccion'></span></div>";
    echo "<button onclick='reiniciarSeleccion()'>Reiniciar</button> ";
    echo "<button onclick='verificarSeleccion()'>Verificar</button>";

    exit;
}

if ($accion === 'ver_palabras') {
    // Mostrar lista con CRUD
    $res = $conn->query("SELECT * FROM palabras WHERE cuadricula = $cuadricula");
    echo "<div class='contenedorpalabras'>";
    echo "<h3>Palabras $cuadricula x $cuadricula</h3><table class='verpalabrastable' border='1'>";
    echo "<tr><th>ID</th><th>Palabra</th><th>Acciones</th></tr>";
    while ($row = $res->fetch_assoc()) {
        echo "<tr>
            <td>{$row['id']}</td>
            <td>{$row['palabra']}</td>
            <td>
                <button onclick=\"editarPalabra({$row['id']}, '{$row['palabra']}')\">
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-pencil-square' viewBox='0 0 16 16'>
                        <path d='M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z'/>
                        <path fill-rule='evenodd' d='M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z'/>
                    </svg>
                </button>
                <button onclick=\"eliminarPalabra({$row['id']}, $cuadricula)\">
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='currentColor' class='bi bi-trash' viewBox='0 0 16 16'>
                        <path d='M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z'/>
                        <path d='M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z'/>
                    </svg>
                </button>
            </td>
        </tr>";
    }
    echo "</table>
    <form class='newword' onsubmit=\"agregarPalabra(event, $cuadricula)\">
        <input type='text' name='nueva' placeholder='Nueva palabra' pattern='[A-Za-zÁÉÍÓÚáéíóúÑñ]+' title='Solo letras, sin números ni caracteres especiales' required>
        <button type='submit'>Agregar</button>
    </form>";
    echo "</div>";
    exit;
}

// Para eliminar palabra
if ($accion === 'eliminar' && isset($_POST['id'])) {
    $conn->query("DELETE FROM palabras WHERE id = " . $_POST['id']);
    exit("OK");
}

// Para agregar palabra
if ($accion === 'agregar' && isset($_POST['palabra'])) {
    $palabra = strtoupper($_POST['palabra']);
    $conn->query("INSERT INTO palabras (palabra, cuadricula) VALUES ('$palabra', $cuadricula)");
    exit("OK");
}

// Para editar palabra
if ($accion === 'editar' && isset($_POST['id']) && isset($_POST['palabra'])) {
    $id = (int) $_POST['id'];
    $palabra = strtoupper($_POST['palabra']);
    $stmt = $conn->prepare("UPDATE palabras SET palabra = ? WHERE id = ?");
    $stmt->bind_param("si", $palabra, $id);
    $stmt->execute();
    exit("OK");
}
?>

