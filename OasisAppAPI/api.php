<?php

header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Origin: 'ionic://localhost', 'http://localhost', 'http://localhost:8080'");
header("Access-Control-Allow-Headers: *");
header("content-type: application/json");

  $request=$_SERVER['REQUEST_METHOD'];

   switch ( $request) {
   	case 'GET':
   		getQuestionsMethod();
   	break;
   	case 'POST':
   		$data=json_decode(file_get_contents('php://input'),true);
      if (count($data) == 1 && !empty($data['user'])) {
        getCompletedSurveysMethod($data);
      } else if (count($data) == 2 && !empty($data['name']) && !empty($data['id'])) {
        getLoginsMethod($data);
      } else {
        postmethod($data);
      }
   	break;
   	default:
   		echo '{"name": "data not found"}';
   		break;
   }

//data read part are here
function getQuestionsMethod(){
  include "db.php";
  $sql = "CALL GetQuestions();";
  $result = mysqli_query($conn, $sql);

  if (mysqli_num_rows($result) > 0) {
       $rows=array();
       while ($r = mysqli_fetch_assoc($result)) {
          $rows["result"][] = $r;
       }

       echo json_encode($rows);
  } else {
      echo '{"result": "no data found"}';
  }
}

function getCompletedSurveysMethod($data){
  include "db.php";
  $sql = "CALL GetCompletedSurvey('".$data['user']."');";
  $result = mysqli_query($conn, $sql);

  if (mysqli_num_rows($result) > 0) {
       $rows=array();
       while ($r = mysqli_fetch_assoc($result)) {

          $rows["result"][] = $r;
       }
       echo json_encode($rows);
  } else {
      echo '{"result": "no data found"}';
  }
}

function getLoginsMethod($data) {
  include "db.php";

  $sql = "CALL CheckLogins('".$data['id']."','".$data['name']."');";
  $result = mysqli_query($conn, $sql);

  if (mysqli_num_rows($result) > 0) {
       $rows=array();
       while ($r = mysqli_fetch_assoc($result)) {

          $rows["result"][] = $r;
       }

       echo json_encode($rows);
  } else {
      echo 0;
  }
}
//data insert part are here
function postmethod($data){
   include "db.php";
   for ($x = 0; $x < count($data); $x++) {
     for ($i = 0; $i < count($data[$x]["surveys"]); $i++) {
       if (is_array($data[$x]['surveys'][$i])) {
         $empty = 0;
         for($j = 0; $j < count($data[$x]['surveys'][$i]); $j++) {
           if ($data[$x]['surveys'][$i][$j] == "") {
             $empty = $empty + 1;
           }
         }
         if ($empty != count($data[$x]['surveys'][$i])) {
           $tempString = "[".implode(",",$data[$x]['surveys'][$i])."]";
           $sql =  "CALL PostSurvey('" .$data[$x]['id']. "', '".$data[$x]['dateCompleted']."', '".$data[$x]['surveyVersion']."', '".($i + 1)."', '".$tempString."', '".$data[$x]['completed']."');";
           if (mysqli_query($conn , $sql)) {
             echo '{"result": "data inserted"}';
           } else{
             echo '{"result": "data not inserted"}';
           }
         }


      } else if ($data[$x]['surveys'][$i] != "") {
         $sql = "CALL PostSurvey('" .$data[$x]['id']. "', '".$data[$x]['dateCompleted']."', '".$data[$x]['surveyVersion']."', '".($i + 1)."', '".$data[$x]['surveys'][$i]."', '".$data[$x]['completed']."');";
         if (mysqli_query($conn , $sql)) {
           echo '{"result": "data inserted"}';
         } else{
           echo '{"result": "data not inserted"}';
         }
       }
     }
   }
}

?>
