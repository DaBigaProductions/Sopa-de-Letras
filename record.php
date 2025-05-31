<?php
$conn = new mysqli("localhost", "root", "", "sopadeletras");

$palabra = $_POST['palabra'] ?? '';
$cuadricula = (int) ($_POST['cuadricula'] ?? 0);
$demora = $_POST['demora'] ?? ''; // Formato mm:ss

function tiempoASegundos($tiempo) {
    list($min, $seg) = explode(':', $tiempo);
    return (int)$min * 60 + (int)$seg;
}

if ($palabra && $cuadricula && preg_match('/^\d{2}:\d{2}$/', $demora)) {
    $demoraSegundos = tiempoASegundos($demora);

    // Obtener hasta 3 mejores tiempos existentes para esa palabra y cuadricula
    $stmt = $conn->prepare("SELECT * FROM records WHERE palabra = ? AND cuadricula = ? ORDER BY STR_TO_DATE(demora, '%i:%s') ASC");
    $stmt->bind_param("si", $palabra, $cuadricula);
    $stmt->execute();
    $resultados = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    if (count($resultados) < 3) {
        // Menos de 3 tiempos, guardar directamente
        $stmtInsert = $conn->prepare("INSERT INTO records (fecha, palabra, cuadricula, demora) VALUES (NOW(), ?, ?, ?)");
        $stmtInsert->bind_param("sis", $palabra, $cuadricula, $demora);
        $stmtInsert->execute();
        echo "nuevo_record";
    } else {
        // Ya hay 3 récords, verificar si este nuevo es mejor que el peor
        $peor = $resultados[2]; // tercer peor (porque están ordenados ascendente)
        $peorSegundos = tiempoASegundos($peor['demora']);

        if ($demoraSegundos < $peorSegundos) {
            // El nuevo es mejor que el peor, reemplazar
            $stmtDelete = $conn->prepare("DELETE FROM records WHERE palabra = ? AND cuadricula = ? AND demora = ?");
            $stmtDelete->bind_param("sis", $palabra, $cuadricula, $peor['demora']);
            $stmtDelete->execute();

            $stmtInsert = $conn->prepare("INSERT INTO records (fecha, palabra, cuadricula, demora) VALUES (NOW(), ?, ?, ?)");
            $stmtInsert->bind_param("sis", $palabra, $cuadricula, $demora);
            $stmtInsert->execute();

            echo "nuevo_record";
        } else {
            echo "sin_cambios";
        }
    }
} else {
    echo "datos_invalidos";
}
?>
