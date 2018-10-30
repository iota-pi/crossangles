<?php
/* Simple script to send email from contact form
 */

$DOMAIN = 'dev.my.campusbiblestudy.org';

$data = json_decode(file_get_contents('php://input'), true);
$width = min($data['width'], 900);
$height = min($data['height'], 1200);

$html = '<html><head><title>Unit Schedule</title>' .
        '<link href="https://' . $DOMAIN . '/static/css/timetable.css" rel="stylesheet">' .
        '<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet">' .
        '</head><body>' .
        substr($data['timetable'], 0, 20000) .
        '</body></html>';

$url = 'https://phantomjscloud.com/api/browser/v2/ak-9tcg0-2mz50-jn8n9-d2y7z-p4jd7/';
$payload = array(
  'url' => 'about:blank',
  'content' => $html,
  'renderType' => 'png',
  'requestSettings' => array(
    // No JS/images/extra files should be loaded in normal operation
    'disableJavascript' => true,  // no need to run JS
    'ignoreImages' => true,       // no need to load any images
    'waitInterval' => 0,
    'webSecurityEnabled' => true,
    'resourceTimeout' => 5000,    // maximum wait for a resource
    'maxWait' => 7000,            // maximum wait for the whole page
    'resourceModifier' => array(
      // Blacklist all resources, except for what we explicitly allow later
      array(
        'regex' => '.*',
        'isBlacklisted' => true
      ),
      // Allow CSS links from my.campusbiblestudy.org and Google fonts
      array(
        'regex' => 'https://((dev\.)?my\.campusbiblestudy\.org|fonts\.googleapis\.com)/.*\.css.*',
        'isBlacklisted' => false
      ),
      // Allow all navigation requests
      array(
        'category' => 'navigationRequest',
        'isBlacklisted' => false
      )
    )
  ),
  'renderSettings' => array(
    'viewport' => array(
      'width' => $width,
      'height' => $height
    ),
    'clipRectangle' => array(
      'width' => $width,
      'height' => $height
    )
  ),
  'backend' => 'chrome'
);
$options = array(
  'http' => array(
    'header' => "Content-Type: application/json\r\nContent-Length: " . strlen(json_encode($payload)) . "\r\n",
    'method' => 'POST',
    'content' => json_encode($payload)
  )
);

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$basename = 'timetable.png';

if ($result === false) {
  http_response_code(400);
} else {
  echo base64_encode($result);
}

?>
