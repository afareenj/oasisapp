<?php
    session_start();
    $enteredUser = $_POST['name'];
    $_SESSION['username'] = $enteredUser;
    $enteredPass = $_POST['id'];
    $dbhost = "esgwebmariadb.jh.edu"; // database server name
     $dbuser = "oasis_dev"; // dbase username
     $dbpass = "b5)frYrH2d7<?&fZ"; // dbase password
     $dbname = "oasis_dev"; // db in account
     $mysqli = new mysqli($dbhost,$dbuser,$dbpass,$dbname);

     if ($mysqli->connect_error) {
        die("Connection failed: " . $conn->connect_error);
      }
      $sql = "SELECT *  FROM Logins WHERE name = '". $enteredUser ."'";
      $result = mysqli_query($mysqli, $sql);
     // Usrname exists if > 0
     if (mysqli_num_rows($result) > 0) {
         $users = mysqli_fetch_assoc($result);
            if($enteredPass == $users['id']){
                echo "VALID";
            } else {
                echo json_encode("Incorrect password");
            }
    } else {
        echo json_encode("Username does not exist");
    }

    $mysqli->close();

?>
