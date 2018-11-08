<?php
/* Proxy request to get timetable data */

$url = json_decode(file_get_contents('./config/dataURI.json'));
echo file_get_contents($url);

?>
