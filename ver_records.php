<?php
$conn = new mysqli("localhost", "root", "", "sopadeletras");

$cuadricula = $_GET['cuadricula'] ?? null;

if ($cuadricula) {
    $sql = "SELECT fecha, palabra, cuadricula, demora FROM records WHERE cuadricula = ? ORDER BY demora ASC LIMIT 3";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $cuadricula);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query("SELECT fecha, palabra, cuadricula, demora FROM records ORDER BY demora ASC LIMIT 30");
}

echo "<h2>🏁 Top Records</h2>";

if ($result->num_rows > 0) {
    echo "<table border='1' cellpadding='8'>";
    echo "<tr><th>#</th><th>Fecha</th><th>Palabra</th><th>Cuadrícula</th><th>Tiempo</th></tr>";
    $i = 1;
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>{$i}</td>";
        echo "<td>{$row['fecha']}</td>";
        echo "<td>{$row['palabra']}</td>";
        echo "<td>{$row['cuadricula']}x{$row['cuadricula']}</td>";
        echo "<td>{$row['demora']}</td>";
        echo "</tr>";
        $i++;
    }
    echo "</table>";
} else {
    echo "No hay récords registrados todavía.";
}
?>
