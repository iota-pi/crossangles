<?php
/* Simple script to send email from contact form
 */

$result = array();
$data = json_decode(file_get_contents('php://input'), true);
$name = substr(filter_var($data['name'], FILTER_SANITIZE_FULL_SPECIAL_CHARS), 0, 100);
$email = substr(filter_var($data['email'], FILTER_SANITIZE_EMAIL), 0, 255);
$body = substr(filter_var($data['body'], FILTER_SANITIZE_FULL_SPECIAL_CHARS), 0, 5000) .
        "\r\n\r\n------\r\nThis is an automated email sent from CrossAngles.\r\n" .
        "Sender name: $name\r\n";
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  $result['success'] = false;
  $result['error'] = 'Invalid email address!';
} else if (!$body) {
  http_response_code(400);
  $result['success'] = false;
  $result['error'] = 'Message should not be empty';
} else {
  $success = mail('crossangles@my.campusbiblestudy.org', 'CrossAngles Contact Form', $body, 'From: no-reply@my.campusbiblestudy.com' . "\r\n" . 'Reply-To: ' . $email);
  if ($success) {
    $result['success'] = true;
  } else {
    http_response_code(400);
    $result['success'] = false;
    $result['error'] = 'An error occured';
  }
}
echo json_encode($result);

?>
