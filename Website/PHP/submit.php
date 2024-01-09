<!DOCTYPE html>
<html lang="en">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Oasis App</title>
   </head>
   <body>

<script type="text/JavaScript">
  function disableBack() {
    window.history.forward();
  }
  setTimeout("disableBack()", 0);
  window.onunload = function () { null };
</script>

<?php
session_start();


$dbhost = "esgwebmariadb.jh.edu";
$dbuser = "oasis_dev";
$dbpass = "b5)frYrH2d7<?&fZ";
$dbname = "oasis_dev";
$mysqli = new mysqli($dbhost,$dbuser,$dbpass,$dbname);

// $sql = "SELECT MAX(id) AS max_page FROM Questions";
// $result = mysqli_query($mysqli, $sql);
// $max = 0;
// if (mysqli_num_rows($result) > 0) {
//     while($row = mysqli_fetch_assoc($result)) {
//       $max = $row["max_page"];
//   }
// }

date_default_timezone_set("America/New_York");
$dateTime = date("Y-m-d H:i:s");
//// TODO: Username checks before submitting
$arr_arr = array();
$str_arr = array();
if (isset($_POST["username"])) {
  $tempUserAndSurvey = explode(",", $_POST["username"]);
  $username = $tempUserAndSurvey[0];
  $surveyVersion = (int)$tempUserAndSurvey[1];
  foreach ($_POST as $key => $value) {
      $tempKey = htmlspecialchars($key);
      $tempVal = htmlspecialchars($value);
      if(strpos($tempKey, ",") !== false && strcmp($tempKey, "username") !== 0 && $tempVal != "") {
        $str_arr = explode(",", $tempKey);
        $arr_arr[$str_arr[0]][$str_arr[1]] = $tempVal - 1;
      } elseif (strcmp($tempKey, "username") !== 0 && $tempVal != "") {
        $sql =  "CALL PostSurvey('" .$username. "', '".$dateTime."', '".$surveyVersion."', '".$tempKey."', '".$tempVal."', 'Y');";
        $result = mysqli_query($mysqli, $sql);
      }
  }
  ksort($arr_arr);

  foreach ($arr_arr as $x => $x_value) {
   ksort($x_value);
   $tempString = "[".implode(",",$x_value)."]";
   $sql =  "CALL PostSurvey('" .$username. "', '".$dateTime."', '".$surveyVersion."', '".$x."', '".$tempString."', 'Y');";
   $result = mysqli_query($mysqli, $sql);
  }

}
mysqli_close($conn);

//TODO:if error in submitting, display error messsage on next page.
$_SESSION['submitted'] = "true";
header("Location: ../oasis.php", true);
exit();

?>
</body>
</html>
