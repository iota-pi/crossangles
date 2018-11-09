<?php
/* Proxy request to get timetable data */

$url = json_decode(file_get_contents('./config/dataURI.json'));
header('Content-Type: application/json');
echo file_get_contents($url);

?>
