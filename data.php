<?php

header('Content-type: text/json');

$courses = json_decode($_GET['courses']);

$data = json_decode(file_get_contents('data/timetable.json'), true);

$output = [];
foreach ($courses as $course) {
    $output[$course] = $data[$course];
}

echo json_encode($output);

?>
