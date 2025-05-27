<?php
// Conexión
$conn = new mysqli("localhost", "root", "", "sopadeletras");

// Procesamiento de acciones (vía POST o GET)
$accion = $_POST['accion'] ?? '';
$cuadricula = $_POST['cuadricula'] ?? '';

if ($accion === 'jugar') {
    // Seleccionar palabra aleatoria
    $res = $conn->query("SELECT palabra FROM palabras WHERE cuadricula = $cuadricula ORDER BY RAND() LIMIT 1");
    $row = $res->fetch_assoc();
    $palabra = strtoupper($row['palabra']);

    // Crear matriz vacía de letras aleatorias
    $matriz = [];
    $letras = range('A', 'Z');

    for ($i = 0; $i < $cuadricula; $i++) {
        for ($j = 0; $j < $cuadricula; $j++) {
            $matriz[$i][$j] = $letras[array_rand($letras)];
        }
    }

    // Insertar la palabra en dirección aleatoria
    $long = strlen($palabra);
    $direcciones = ['horizontal', 'vertical', 'diagonal'];
    $direccion = $direcciones[array_rand($direcciones)];
    $reversa = rand(0, 1) === 1;

    if ($reversa) $palabra = strrev($palabra);

    $coloca = false;
    while (!$coloca) {
        $x = rand(0, $cuadricula - 1);
        $y = rand(0, $cuadricula - 1);
        $dx = $dy = 0;

        if ($direccion === 'horizontal') { $dx = 1; }
        if ($direccion === 'vertical') { $dy = 1; }
        if ($direccion === 'diagonal') { $dx = $dy = 1; }

        $fin_x = $x + $dx * ($long - 1);
        $fin_y = $y + $dy * ($long - 1);

        if ($fin_x < $cuadricula && $fin_y < $cuadricula) {
            for ($k = 0; $k < $long; $k++) {
                $matriz[$y + $k * $dy][$x + $k * $dx] = $palabra[$k];
            }
            $coloca = true;
        }
    }

    // Mostrar la palabra a buscar y la matriz en HTML
    echo "<h3>Busca la palabra: <span id='palabra-meta'>$palabra</span></h3>";
    echo "<table id='sopa'>";
    for ($i = 0; $i < $cuadricula; $i++) {
        echo "<tr>";
        for ($j = 0; $j < $cuadricula; $j++) {
            echo "<td data-x='$j' data-y='$i'>{$matriz[$i][$j]}</td>";
        }
        echo "</tr>";
    }
    echo "</table>";
    echo "<div>Seleccionado: <span id='seleccion'></span></div>";
    echo "<button onclick='reiniciarSeleccion()'>Reiniciar</button> ";
    echo "<button onclick='verificarSeleccion()'>Verificar</button>";
    echo "<input type='hidden' id='respuesta-correcta' value='$palabra'>";
    exit;
}

if ($accion === 'ver_palabras') {
    // Mostrar lista con CRUD
    $res = $conn->query("SELECT * FROM palabras WHERE cuadricula = $cuadricula");
    echo "<h3>Palabras $cuadricula x $cuadricula</h3><table class='verpalabrastable' border='1'>";
    echo "<tr><th>ID</th><th>Palabra</th><th>Acciones</th></tr>";
    while ($row = $res->fetch_assoc()) {
        echo "<tr>
            <td>{$row['id']}</td>
            <td>{$row['palabra']}</td>
            <td>
                <button onclick=\"editarPalabra({$row['id']}, '{$row['palabra']}')\">Editar</button>
                <button onclick=\"eliminarPalabra({$row['id']}, $cuadricula)\">Eliminar</button>
            </td>
        </tr>";
    }
    echo "</table>
    <form onsubmit=\"agregarPalabra(event, $cuadricula)\">
        <input type='text' name='nueva' placeholder='Nueva palabra'>
        <button type='submit'>Agregar</button>
    </form>";
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
