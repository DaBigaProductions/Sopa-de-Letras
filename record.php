<?php
$conn = new mysqli("localhost", "root", "", "sopadeletras");

$palabra = $_POST['palabra'] ?? '';
$cuadricula = (int) ($_POST['cuadricula'] ?? 0);
$demora = $_POST['demora'] ?? ''; // Formato mm:ss

function generarTop3HTML($conn, $cuadricula) {
    $top = $conn->prepare("SELECT palabra, demora FROM records WHERE cuadricula = ? ORDER BY demora ASC LIMIT 3");
    $top->bind_param("i", $cuadricula);
    $top->execute();
    $resultTop = $top->get_result();

    $html = "<h3>Top 3 para cuadrícula $cuadricula:</h3><ol>";
    while ($row = $resultTop->fetch_assoc()) {
        $html .= "<li>" . htmlspecialchars($row['palabra']) . " - " . $row['demora'] . "</li>";
    }
    $html .= "</ol>";
    return $html;
}

if ($palabra && $cuadricula && preg_match('/^\d{1,2}:\d{2}$/', $demora)) {
    list($min, $seg) = explode(':', $demora);
    $tiempoSQL = sprintf('00:%02d:%02d', $min, $seg); // HH:MM:SS

    $check = $conn->prepare("SELECT id, demora FROM records WHERE cuadricula = ? ORDER BY demora ASC");
    $check->bind_param("i", $cuadricula);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows < 3) {
        $stmt = $conn->prepare("INSERT INTO records (fecha, palabra, cuadricula, demora) VALUES (NOW(), ?, ?, ?)");
        $stmt->bind_param("sis", $palabra, $cuadricula, $tiempoSQL);
        $stmt->execute();
        echo "registro_guardado\n" . generarTop3HTML($conn, $cuadricula);
    } else {
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        $peor = $rows[2]; // tercer peor
        if ($tiempoSQL < $peor['demora']) {
            // Invertir palabra para guardarla al derecho
            $palabra = strrev($palabra);
            $stmt = $conn->prepare("UPDATE records SET fecha = NOW(), palabra = ?, demora = ? WHERE id = ?");
            $stmt->bind_param("ssi", $palabra, $tiempoSQL, $peor['id']);
            $stmt->execute();
            echo "registro_actualizado\n" . generarTop3HTML($conn, $cuadricula);
        } else {
            echo "no_mejora\n" . generarTop3HTML($conn, $cuadricula);
        }
    }
} else {
    echo "datos_invalidos";
}
?>

