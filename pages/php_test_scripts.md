author: jack
topic: php
title: php test scripts

PHP Test Scripts
================

The following PHP scripts can easily be used to test certain functionality on servers.

For each script, put it in a file on the server, check permissions, then test it in a browser.

## phpinfo ##

A generic `phpinfo()` page.

```php
<?php
echo "PHP VERSION: " . phpversion() . "<br/>";
echo "SAPI: " . php_sapi_name() . "<br/>";
phpinfo();
?>
```

## GET Vars ##

Prints out all of the `$_GET` variables.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();
echo "PHP VERSION: " . phpversion() . "<br/>";
echo "SAPI: " . php_sapi_name() . "<br/>";
echo "GET VARS available:<br>\n";
foreach( $_GET as $name => $value ){
		echo $name.'    '.$value."<br />\n";
}
?>
```

## SERVER Vars ##

Prints out all of the `$_SERVER` vars as PHP sees them.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();
echo "PHP VERSION: " . phpversion() . "<br/>";
echo "SAPI: " . php_sapi_name() . "<br/>";
echo "SERVER VARS available:<br>\n";
foreach($_SERVER as $k=>$v){ echo "$k: ", (isset($v) ? $v : "NOT SET"), "<br/>\n"; }
?>
```

## Cookie Test ##

Tests PHP cookies. Expected behavior is for the number to increase.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();
if ($_COOKIE['test_cookie']!='') {
	$test_cookie = $_COOKIE['test_cookie'] + 1;
} else {
	$test_cookie = 1;
}

setcookie('test_cookie',$test_cookie,time() + (86400)); // 86400 = 1 day
echo "PHP VERSION: " . phpversion() . "<br/>";
echo "SAPI: " . php_sapi_name() . "<br/>";
echo "You have been to this page $test_cookie times.\n"
?>
```

## Session Test ##

Tests PHP sessions. Expected behavior is for the number to increase.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

session_start();
// Use $HTTP_SESSION_VARS with PHP 4.0.6 or less
if (!isset($_SESSION['count'])) {
  $_SESSION['count'] = 1;
} else {
  $_SESSION['count']++;
}

echo "PHP VERSION: " . phpversion() . "<br/>";
echo "SAPI: " . php_sapi_name() . "<br/>";
// show how many times visited
echo 'you have been to this page '.$_SESSION['count'].' times';
?>
```

## Error Reporting ##

Prints out the current `error_reporting` setting of PHP:

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

echo "PHP VERSION: " . phpversion() . "<br/>";
echo "SAPI: " . php_sapi_name() . "<br/>";

//set up my array for later
$error_codes = array(
	E_ERROR              => "E_ERROR",
	E_WARNING            => "E_WARNING",
	E_PARSE              => "E_PARSE",
	E_NOTICE             => "E_NOTICE",
	E_CORE_ERROR         => "E_CORE_ERROR",
	E_CORE_WARNING       => "E_CORE_WARNING",
	E_COMPILE_ERROR      => "E_COMPILE_ERROR",
	E_COMPILE_WARNING    => "E_COMPILE_WARNING",
	E_USER_ERROR         => "E_USER_ERROR",
	E_USER_WARNING       => "E_USER_WARNING",
	E_USER_NOTICE        => "E_USER_NOTICE",
	E_STRICT             => "E_STRICT",
	E_RECOVERABLE_ERROR  => "E_RECOVERABLE_ERROR",
	E_DEPRECATED         => "E_DEPRECATED",
	E_USER_DEPRECATED    => "E_USER_DEPRECATED",
	E_ALL                => "E_ALL"
	);

// if you want to manually set the error_reporting
//error_reporting(22517);

$error_number = error_reporting();
echo "error reporting is currently set to: ".$error_number." which cooresponds to<br \>\n";
foreach( $error_codes as $number => $description ){
	if ( ( $number & $error_number ) == $number ){
		echo $number & $error_number;
		echo '    ';
		echo $description;
		echo "<br />\n";
	}else{
		echo "NOT SET";
		echo '    ';
		echo $description;
		echo "<br />\n";
	}
}
?>
```

## DNS Test ##

Checks the functionality of DNS requests within PHP by opening a connection to a URL. Requires `safe_mode` for the socket connection.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

echo "PHP VERSION: " . phpversion() . "<br/>";
echo "SAPI: " . php_sapi_name() . "<br/>";

//this file tests a dns lookup to google (can be changed)
//and also verifies the validity of this test by doing a connection to that location
//in this case a fsockopen

$domain = 'google.com';

if(! checkdnsrr($domain,"A"))
{
  echo 'DNS records do not exist for the domain '.$domain;
}
else
{
  echo "I got you DNS records for that domain - '.$domain.' - they are:";
  echo"<br>\r\n";
  echo gethostbyname($domain);
  echo"<br>\r\n";
  echo "opening socket now";
  echo"<br>\r\n";

  //open the socket
  $fp = fsockopen("www.google.com", 80, $errno, $errstr, 5);

  //does the socket connection exist?
  if(!$fp)
  {
    echo 'sorry, I could not create a socket connection to the domain '.$domain;
    echo"<br>\r\n";
  }
  else
  {
    $out = "GET / HTTP/1.1\r\n";
    $out .= "Host: ".$domain."\r\n";
    $out .= "Connection: Close\r\n\r\n";
    fwrite($fp, $out);
    while (!feof($fp))
    {
      echo fgets($fp, 128);
    }
    fclose($fp);
  }
}
?>
```

## Curl Test ##

The following tests Curl functionality within PHP by hitting a bunch of different locations.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

function cURLTest($url, $msg, $testText){
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_TIMEOUT, 10);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
	$response = curl_exec($ch);
	$errmsg = curl_error($ch);
	$cInfo = curl_getinfo($ch);
	curl_close($ch);
	echo "Testing ... ".$url." - ".$cInfo['url']."<br />";
	if (stripos($response, $testText)!==false)
		echo "....".$msg." - OK<br />";
	else
	{
		echo "....<b style='color:red;'>".$msg." - Problem</b><br /><pre>";
		print_r($errmsg);
		print_r($cInfo);
		print_r(htmlentities($response));
		echo "</pre>There is a problem with cURL. You need to contact your server admin or hosting provider.";
	}
}

cURLTest("http://www.google.com/intl/en/contact/", "HTTP to Google", "Mountain View, CA");
cURLTest("http://www.liquidweb.com/", "HTTP to LW","LW.vars.sslRoot");
cURLTest("https://www.google.com/intl/en/contact/", "HTTPS to Google", "Mountain View, CA");
cURLTest("https://www.facebook.com/", "HTTPS to Facebook", 'id="facebook"');
cURLTest("https://www.linkedin.com/", "HTTPS to LinkedIn", 'link rel="canonical" href="https://www.linkedin.com/"');
cURLTest("https://twitter.com/", "HTTPS to Twitter", 'link rel="canonical" href="https://twitter.com/"');
cURLTest("https://twitter.com/", "HTTPS to WordPress", 'link rel="canonical" href="https://wordpress.org/"');
?>
```

## Timezone Test ##

The following script tests setting timezones for PHP.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

echo "The current timezone is ".date_default_timezone_get()."<br />";
echo "The timezone configured in the currently used php.ini is".ini_get('date.timezone')."<br />";
echo "The php.ini used is ".php_ini_loaded_file()."<br />";
@date_default_timezone_set('America/Los_Angeles');
echo "After changing to Los Angeles, the current timezone is ".date_default_timezone_get()."<br />";
@ini_set('date.timezone', 'America/New_York');
echo "After changing to new york, the current timezone is ".date_default_timezone_get()."<br />";
?>
```

## memory_limit Max Value ##

Checks to see how high `memory_limit` can be set - not where it is currently set.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

$current_limit = 1;
$current_limit_string = ((string)$current_limit).'G';

while (ini_set('memory_limit', $current_limit_string) && $current_limit_string != 'INFG') {
  echo "\n<br />set memory_limit to $current_limit_string and it took which makes it " .ini_get('memory_limit');
  $current_limit = $current_limit * 2;
  $current_limit_string = ((string)$current_limit).'G';
}

echo "\n<br />\n<br />OH BTW if I were to set it again, I would be setting it to $current_limit_string \n<br />\n<br />And if I went and got it with ini_get I get ".ini_get('memory_limit');

?>
```

## mail() Test ##

The script below interactively tests the `mail()` function within PHP.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

ini_set('display_errors', '1');
error_reporting(22517);

function readInputs($vars = $_POST) {
	if !$vars['submit']{
		return false;
	}
	$config = array(
		'dest_host' => 'gmail.com',
		'from_host' => 'domain.com',
		'body' => 'This is a test message.\n\n'.$vars['body'],
		'subject' => $vars['subject'],
		'from' => $vars['from'],
		'to' => $vars['to'],
	)
	if checkConfig($config) return FALSE;
	return $config;
}

function checkConfig($config) {
	foreach($config as $key => $value) {
		if empty($value) {
			trigger_error("$key did not have anything set - not sending email");
			return FALSE;
		}
	}

	$config['mailTo'] = $config['to']."@".$config['dest_host'];
	if !isValidEmail($config['mailTo'])
		trigger_error("invalid dest email $config['mailTo']");
		return FALSE;
	}
	$config['mailFrom'] = $config['from']."@".$config['from_host'];
	if !isValidEmail($config['mailFrom'])
		trigger_error("invalid source email $config['mailFrom']");
		return FALSE;
	}

	return $config;
}

function isValidEmail($email) {
	if(eregi("^[a-z0-9\._-]+@+[a-z0-9\._-]+\.+[a-z]{2,3}$", $email)) return TRUE;
	else return FALSE;
}

$config = readInputs($_POST)
if !$config {
	$success = mail("$mailTo", "$subject", "$message", "From: $config['from']@$config['from_host']\n");

	if(isset($success)) {
		trigger_error("Message sent", E_NOTICE);
	}	else {
		trigger_error("Your message was not sent", E_WARNING);
	}
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>Email test</title>
</head>
<body>
	<h1>mail() Test</h1>
	<p><font color="red"><b>$status_msg</b></font></p>
	<form method="post" action="<?php echo $PHP_SELF; ?>">
	   <table width="450" border="0" align="center">
	      <tr> 
	         <td width="75"> 
	            <div align="right"><b>To:</b></div>
	         </td>
	         <td width="365">
	            <input type="text" name="to" size="15" value="<?php echo $config['to']; ?>"><b>@<?php echo $config['dest_host']; ?></b>
	         </td>
	      </tr>
	      <tr> 
	         <td width="75"> 
	            <div align="right"><b>From:</b></div>
	         </td>
	         <td width="365">
	            <input type="text" name="to" size="15" value="<?php echo $config['from']; ?>"><b>@<?php echo $config['from_host']; ?></b>
	         </td>
	      </tr>
	      <tr>
	         <td width="75">
	            <div align="right"><b>Subject:</b></div>
	         </td>
	         <td width="365">
	            <input type="text" name="subject" size="35" value="<?php echo $config['subject']; ?>">
	         </td>
	      </tr>
	      <tr>
	         <td width="75">
	            <div align="right"><b>Message:</b></div>
	         </td>
	         <td width="365">
	            <textarea name="message" cols="50" rows="4"><?php echo $config['body']; ?></textarea>
	         </td>
	      </tr>
	      <tr>
	         <td width="75">
	            <div align="right"><b></b></div>
	         </td>
	         <td width="365">
	            <input type="submit" name="Submit" value="Submit">
	         </td>
	      </tr>
	   </table>
	</form>
	<p>&nbsp;</p>
</body>
</html>
```

## SMTP Test ##

This script tests the functionality of the Pear Mail package on the server. Make sure you change the FROM and TO headers.

```php
<?php
if($_GET['OHOK']) show_source(__FILE__) && die();

/* notes:
INSTALL Mail through PEAR
Make sure that /usr/local/lib/php/ is in the include path
change the username, password, and host - and uncomment those lines
*/

require_once "Mail.php";
 
$from = "LW TEST <lwtest@from_address_.com>";
$to = "LW TECH<support@liquidweb.com>";
$subject = "PHP TEST EMAIL!";
$body = "Hi,\n\nHow are you?\n\nGet FREE VIAGRA TODAY!";
 
//$host = "ssl://hostname";
$port = "465";
//$username = "smtp_username";
//$password = "smtp_password";

$headers = array ('From' => $from,
   'To' => $to,
   'Subject' => $subject);
 $smtp = Mail::factory('smtp',
   array ('host' => $host,
     'port' => $port,
     'auth' => true,
     'username' => $username,
     'password' => $password));
 
 $mail = $smtp->send($to, $headers, $body);
 
 if (PEAR::isError($mail)) {
   echo("<p>" . $mail->getMessage() . "</p>");
  } else {
   echo("<p>Message successfully sent!</p>");
  }
?>
```
