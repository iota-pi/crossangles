<?php
/* Proxy request to get timetable data */

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header('Content-Type: application/json');
$url = json_decode(file_get_contents('./config/dataURI.json'));
echo file_get_contents($url);

?>
