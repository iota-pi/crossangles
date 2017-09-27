<?php
/* Simple script to send email from contact form
 */

$result = array();
$data = json_decode(file_get_contents('php://input'), true);
$name = filter_var($data['name'], FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$body = filter_var($data['body'], FILTER_SANITIZE_FULL_SPECIAL_CHARS) .
    "\r\n\r\n------\r\nThis is an automated email sent from CrossAngles.\r\nSender name: $name\r\n";
if ($email && $body && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    // Important that email has been sanitised
    $success = mail('crossangles@my.campusbiblestudy.org', 'CrossAngles Contact Form', $body, 'From: no-reply@my.campusbiblestudy.com' . "\r\n" . 'Reply-To: ' . $email);
    $result['success'] = $success;
} else {
    $result['success'] = false;
    $result['error'] = 'Invalid email address';
}
echo json_encode($result);

?>
