<?php
/* scraper.php
 *
 * This script is to scrape data from the UNSW timetable
 * Course codes and names go to courses.json
 * Timetable data goes to timetable.json
 *
 * Authors: David Adams
 */

function get_page_data($url) {
    return file_get_contents($url);
}

function scrape() {
    /* TODO */
}

scrape();

?>