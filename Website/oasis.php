<?php
   session_start();
?>
<!DOCTYPE html>
<html lang="en">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

      <!-- Uncomment below when done with site & re-hash js files. -->

      <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'sha256-JWNZK5VIyp3Oj5EYKZe/tTNlpM1+CWJtUDFAZbcMxro=' 'sha256-55M4oMwoPlRY/1qMLqXukjpF/YTYU3AyKf/teJYQ1yM=' https://maps.googleapis.com ; style-src 'self'; form-action 'self'; child-src https://maryland.maps.arcgis.com/apps/instant/nearby/index.html?appid=0a52c4f1510445218fcc06a4ae9a4163&sliderDistance=5&find=6001-6013%2520Greenvale%2520Pkwy%252C%2520Riverdale%252C%2520Maryland%252C%252020737 https://gisanddata.maps.arcgis.com/apps/instant/nearby/index.html?appid=4ba424c955dc49658d309639a6152d66 ; connect-src 'self'; font-src 'self'; img-src 'self' data: maps.gstatic.com *.googleapis.com *.ggpht.com"> -->

      <title>Oasis App</title>
      <link rel="stylesheet" href="./Lighthouse CSS/_master.min.css">
      <link rel="stylesheet" href="./Lighthouse CSS/_objects.min.css">
      <link rel="stylesheet" href="./Lighthouse CSS/centers-shim.css">
      <link rel="stylesheet" href="./Lighthouse CSS/_centers.min.css">
      <link rel="stylesheet" href="./Lighthouse CSS/survey.css">
      <link rel="stylesheet" href="./Lighthouse CSS/styles.css">
      <script src="js/jquery.js"></script>
      <script src="js/survey.js"></script>
   </head>
   <body>
      <div class="bodyDiv1"><a href="https://www.jhsph.edu/research/centers-and-institutes/self-help-through-intervention-and-prevention/LH_Projects/#Skip" title="Skip Navigation, Go To Main Body Content">Skip Navigation</a></div>
      <!-- NCGTM body -->
      <noscript>Please allow javascript to access webpage.</noscript>
      <div id="paint_bucket">
         <div class="header-watermark">
            <div class="container">
               <div id="header"><a class="branding" title="Johns Hopkins Bloomberg School of Public Health" href="https://www.jhsph.edu/">Johns Hopkins Bloomberg School of Public Health</a></div>
            </div>
         </div>
      </div>
      <div class="container" id="page">
         <div class="siteTitle">
            <!-- skip navigation removed from included pages -->
            <h4><a href="https://www.jhsph.edu/research/centers-and-institutes/self-help-through-intervention-and-prevention/">Lighthouse Studies at Peer Point</a></h4>
         </div>
         <div id="sidebar">
            <div class="subnav1">
               <ul>
                  <li id="lhome">
                     <a id="ahome" href="#">Home</a>
                  </li>
                  <li id="lprev">
                     <a id="aprev" href="#">Previous Entries</a>
                  </li>
                  <li id="lcovid">
                     <a id="acovid" href="#">COVID-19</a>
                  </li>
                  <li id="lnarcan">
                     <a id="anarcan" href="#">NARCAN</a>
                  </li>
                  <li id="lsignout">
                     <a id="asignout" href="#">Sign Out</a>
                  </li>
               </ul>
            </div>
            <hr>
            <p><br>
               <span id="Footer" class="Footer">2213 McElderry St, 2<sup>nd</sup> Floor<br> Baltimore, MD 21205<br> 410-502-5368<br> 1-800-967-5710<br> Fax: 410-502-5385</span><br> &nbsp;
            </p>
         </div>
         <div class="content">
            <div id="home">
               <div id="instructions">
                  <button id="injection">Click to Begin Survey</button>
                  <p id="submitted">Thank you for submitting a survey!</p>
                  <img id="endgif" src="./img/endgif.gif">
               </div>
               <div id="survey"></div>
               <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC9_U8ZlPULJLIH9-G-ogbfWPe5nnL2YT4&callback=initMapSurvey&libraries=places&v=weekly" async></script>
               <script type="text/javascript">
                  // below shows submitted text after survey has been completed
                  let subElement = document.getElementById("submitted");
                  let subElement2 = document.getElementById("endgif");
                  if(<?php echo json_encode($_SESSION['submitted']);?> == "true") {
                    subElement.style.display = "block";
                    subElement2.style.display = "block";
                    setTimeout(function(){ subElement.style.display = "none"; subElement2.style.display = "none";  }, 5000);
                    <?php unset($_SESSION['submitted']);?>;
                  } else {
                     subElement.style.display = "none";
                     subElement2.style.display = "none";
                  }
                 

                  var d = <?php
                     $dbhost = "esgwebmariadb.jh.edu"; // database server name
                     $dbuser = "oasis_dev"; // dbase username
                     $dbpass = "b5)frYrH2d7<?&fZ"; // dbase password
                        $dbname = "oasis_dev"; // db in account
                        $mysqli = new mysqli($dbhost,$dbuser,$dbpass,$dbname);

                        $sql = "CALL GetQuestions();";
                        $result = mysqli_query($mysqli, $sql);
                        $d = array();
                        if (mysqli_num_rows($result) > 0) {
                          $count=0;
                          while($row = mysqli_fetch_assoc($result)) {
                            $d[$count] = $row;
                            $count++;
                          }
                          echo json_encode($d);
                        } else {
                          echo json_encode("No Questions Today!");
                        }
                        #check no questions
                        mysqli_close($conn);

                        ?>;
                  var questions = document.getElementById("survey");
                  var text = "<form id='regform' name='surveyForm' method='POST' enctype='multipart/form-data' action='PHP/submit.php'>";
                  var x = 0;
                  var count = <?php echo json_encode($count); ?>;
                  var showMap = false;
                  var locationChange = {};
                  var surveyVersion = d[0]["surveyVersion"];
                  var map, marker, autocomplete;
                  var mapID = "";
                  var mapInputID = "";
                  while (x <= count - 1) {
                  text += "<div class='tab'><br><h3>" + d[x]["id"] +  ". "  + d[x]["question"] +  "</h3><br>";
                  if (d[x]["answerForm"] == "Text") {
                    if (d[x]["answers"] == "Map") {
                      text += "<input type='text' id='" + d[x]["id"] +  "' placeholder='Enter Address' name='"  + d[x]["id"] +  "' size='80%'><br><br>";
                      text += "<br><br><p id='example_cross'>i.e. South Carey Street & West Baltimore Street, Baltimore, MD 21223, USA</p>";
                      text += "<br><div class='map' id='map" + d[x]["id"] + "'></div>";
                      mapID = "map" + d[x]["id"];
                      mapInputID = "#" + d[x]["id"];

                    } else {
                      text += "<input type='text' id='" + d[x]["id"] +  "' placeholder='Enter Text' name='"  + d[x]["id"] +  "'><br><br>";
                    }

                  } else if (d[x]["answerForm"] == "Number") {
                      text += "<input class='surveyInput' type='number' min='0' id='" + d[x]["id"] +  "' placeholder='Enter Number' name='"  + d[x]["id"] +  "' ><br><br>";
                  } else if (d[x]["answerForm"] == "Multiple Choice") {
                      let stringsA =  d[x]["answers"];
                      let str_arr = stringsA.split(',');
                      let temp = 0;
                      for (let value of str_arr) {
                          text += '<input type="radio" id="' + d[x]["id"] + "," + temp + '" name="' + d[x]["id"] + '" value="' + value + '"> <label for="' + d[x]["id"] + "," + temp + '">'+ value + '</label>';
                          temp++;
                      }

                  } else if (d[x]["answerForm"] == "Multi-Select") {
                      let temp = 0;
                      let str_arr = d[x]["answers"].split(',');
                      for (let value of str_arr) {
                          text += '<input type="checkbox" id="' + d[x]["id"] + "," + temp + '" name="' + d[x]["id"] + '" value="' + value + '"> <label for="' + d[x]["id"] + "," + temp + '">' + value + '</label>';
                          temp++;
                      }
                      text += "<br>";

                  } else if (d[x]["answerForm"] == "Yes/No Explain") {
                    text += '<input type="radio" id="' + d[x]["id"] + '" name="' + d[x]["id"] + '" value="Yes"><label for="' + d[x]["id"]
                                      + '">Yes</label><br><input type="radio" id="' + d[x]["id"] + '" name="' + d[x]["id"]
                                      + '" value="No"><label for="' + d[x]["id"] + '">No</label><br>';
                    text += "<input type='text' id='" + d[x]["id"] + "' placeholder='Explain' name='"  + d[x]["id"] +  "' size='80%'><br><br>";

                  } else if (d[x]["answerForm"] == "Matrix") {
                    let str_arr = d[x]["answers"].split('|');
                    let str_arr_cols = str_arr[0].split(',');
                    let str_arr_rows = str_arr[1].split(",");
                    text += '<table>';
                    for (let i = 0; i < str_arr_cols.length + 1; i++) {
                      text += '<tr>';
                      for (let j = 0; j < str_arr_rows.length + 1; j++) {

                        if (i == 0) {
                          text += '<th>';
                          if (j != 0) {
                            text += str_arr_rows[j - 1];
                          }
                          text += '</th>';
                        } else {
                          text += '<td>';
                          if (j == 0) {
                            text += str_arr_cols[i - 1];
                          } else {

                            text += '<input type="radio" id="' + d[x]["id"] + "," + i + '" name="' + d[x]["id"] + "," + i + '" value="' + j + '"> <br>';
                          }
                          text += '</td>';
                        }

                      }
                      text += '</tr>';
                    }
                    text += '</table>';
                  } else if (d[x]["answerForm"] == "Emoji"){
                     let stringsA =  d[x]["answers"];
                      let str_arr = stringsA.split(',');
                      let temp = 0;
                      text +='<ul id = "emojis">';
                      for (let value of str_arr) {
                         text+='<li id = "emoji'+temp+'">';
                          text += '<input type="radio" id="' + d[x]["id"] + "," + temp + '" name="' + d[x]["id"] + '" value="' + value + '"> <label for="' + d[x]["id"] + "," + temp + '">'+ '<img src="./img/emoji'+temp+'.png">' + '</label>';
                          text+='</li>';
                          temp++;
                      }
                      text +='</ul><br><br>';
                      
                  }
                  text += "<p class='error'>Please select an answer.</p></div>";


                  x=x+1;

                  }
                  text += '<div><div class="rightFloat"><button type="button" id="prevBtn" onclick="nextPrev(-1)">Previous</button><button type="button" id="nextBtn" onclick="nextPrev(1)">Next</button></div></div><div class="stepDiv">';

                  let y = 0;
                  while (y < count) {
                    text += '<span class="step"></span>';
                    y = y + 1;
                  }

                  text += "</div></form>";
                  questions.innerHTML += text;

                  function initMapSurvey() {

                  // The location of jhusph
                  const uluru = { lat: 39.298017, lng: -76.590196 };
                  // The map, centered at Uluru

                  if (mapID != "") {
                     // Added to each to exapnd slightly beyond maryland
                     const BALTI_BOUNDS = {
                        north: 44,
                        south: 36,
                        west: -80,
                        east: -75,
                     };
                    map = new google.maps.Map(document.getElementById(mapID), {
                       zoom: 12,
                       center: uluru,
                       restriction: {
                        latLngBounds: BALTI_BOUNDS,
                        strictBounds: true,
                       },

                    });

                    marker = new google.maps.Marker({
                       position: uluru,
                       map: map,
                       draggable:true,
                       animation: google.maps.Animation.DROP
                    });


                    google.maps.event.addListener(marker, 'dragend', function()
                    {
                        geocodePosition(marker.getPosition(), i);
                    });

                    let options = {
                      componentRestrictions: { country: "us" },
                      fields: ["formatted_address", "geometry", "name"],
                      origin: map.getCenter(),
                      bounds: BALTI_BOUNDS,
                      strictBounds: true
                    };
                    autocomplete = new google.maps.places.Autocomplete(document.getElementById(mapInputID.substring(1)), options);
                    autocomplete.bindTo("bounds", map);

                    autocomplete.addListener("place_changed", () => {
                      marker.setVisible(false);
                      let place = autocomplete.getPlace();

                      if (!place.geometry || !place.geometry.location) {
                        // User entered the name of a Place that was not suggested and
                        // pressed the Enter key, or the Place Details request failed.

                        // TODO: don't let user continue
                        window.alert("Address details not available for input: '" + place.name + "'");
                        return;
                      }

                      // If the place has a geometry, then present it on a map.
                      if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                      } else {
                        map.setCenter(place.geometry.location);
                        map.setZoom(17);
                      }
                      marker.setPosition(place.geometry.location);
                      marker.setVisible(true);
                    });

                  }

                  }


                  function geocodePosition(pos, i) {
                   geocoder = new google.maps.Geocoder();
                   geocoder.geocode
                    ({
                        latLng: pos
                    },
                        function(results, status)
                        {
                            if (status == google.maps.GeocoderStatus.OK)
                            { //ajax
                                $(mapInputID).val(results[0].formatted_address);
                                let round = {"lat": Math.round(pos.toJSON().lat * 1000)/1000, "lng": Math.round(pos.toJSON().lng * 1000)/1000}
                                locationChange[mapInputID] = round;
                                $("#mapErrorMsg").hide(100);
                            }
                            else
                            {
                                $("#mapErrorMsg").html('Cannot determine address at this location.'+status).show(100);
                            }
                        }
                    );
                  }


               </script>
            </div>
            <div id="prev">
               <div id="pe">
                  <div>
                     <h3>Previous Entries</h3>
                     <button id="newEntry">+ New Entry</button>
                  </div>
                  <div>
                     <form id="searchForm" name="searchPrev">
                        <input type="text" id="search" placeholder="Search" name="Search">
                        <input type="submit">
                        <button id="clear">Clear</button>
                     </form>
                  </div>
               </div>
               <div id="reverse_entry">
                  <img id="updown" src='./img/updown.png' alt="^">
                  <p id="reversal_words">Reverse Entry Order </p>
               </div>
               <table id="prevEntry" >
                  <tr>
                     <th id="entry">Entry #</th>
                     <th id="date">Date</th>
                     <th id="time">Time</th>
                  </tr>
                  <script type="text/javascript">
                     let updownReverse = true;
                     function reversal(){
                        var trContent = [];
                           for (var i = 1, row; row = entry_table.rows[i]; i++) {
                              trContent.push(row.innerHTML);
                            }
                           trContent.reverse();
                           for (var i = 1, row; row = entry_table.rows[i]; i++) {
                               row.innerHTML = trContent[i - 1];
                           }
                           if (updownReverse) {
                             document.getElementById('updown').style.transform = 'rotate(180deg)';
                           } else {
                             document.getElementById('updown').style.transform = 'rotate(0deg)';
                           }
                           updownReverse = !updownReverse;
                     }
                     var entry_php = <?php
                        $dbhost = "esgwebmariadb.jh.edu"; // database server name
                        $dbuser = "oasis_dev"; // dbase username
                        $dbpass = "b5)frYrH2d7<?&fZ"; // dbase password
                           $dbname = "oasis_dev"; // db in account
                           $mysqli = new mysqli($dbhost,$dbuser,$dbpass,$dbname);
                           $sql = "CALL GetCompletedSurvey('".$_SESSION['username']."');";
                              $result = mysqli_query($mysqli, $sql);
                              if (mysqli_num_rows($result) > 0) {
                                $rowCount = 0;
                                $entries = array();
                                while($row = mysqli_fetch_assoc($result)) {
                                   $currentEntry = array(date("m/d/Y", strtotime($row["dateCompleted"])), date("g:i A", strtotime($row["dateCompleted"])));
                                  $entries[$rowCount] = $currentEntry;
                                  $rowCount++;
                                }
                                 echo json_encode($entries);
                              } else {
                                echo json_encode("No current entries");
                              }
                              mysqli_close($conn);
                              ?>;
                           var entry_table = document.getElementById("prevEntry");
                           var entry_count = <?php echo json_encode($rowCount); ?>;
                           if(entry_php == "No current entries"){
                              var no_entries = entry_table.insertRow(1);
                              no_entries.innerHTML = "<td colspan='3' class='table'>No current entries.</td>";
                           }
                           for(let i = 0; i < entry_count; i++){
                              var row = entry_table.insertRow(i + 1);
                              var entry = row.insertCell(0);
                              var date = row.insertCell(1);
                              var time = row.insertCell(2);
                              //entry.innerHTML = entry_count - i;
                              entry.innerHTML = i + 1;
                              date.innerHTML = entry_php[i][0];
                              time.innerHTML = entry_php[i][1];
                           }
                           // Below is to reverse order so latest entries are shown first
                           var trContent = [];
                           for (var i = 1, row; row = entry_table.rows[i]; i++) {
                              trContent.push(row.innerHTML);
                            }
                           trContent.reverse();
                           for (var i = 1, row; row = entry_table.rows[i]; i++) {
                               row.innerHTML = trContent[i - 1];
                           }
                  </script>
               </table>
            </div>
            <div id="covid">
               <iframe width="100%" height="800px" allowfullscreen="true" src="https://maryland.maps.arcgis.com/apps/instant/nearby/index.html?appid=0a52c4f1510445218fcc06a4ae9a4163&sliderDistance=5&find=6001-6013%2520Greenvale%2520Pkwy%252C%2520Riverdale%252C%2520Maryland%252C%252020737" ></iframe>
            </div>
            <div id="narcan">
               <iframe width="100%" height="800px" allowfullscreen="true" src="https://gisanddata.maps.arcgis.com/apps/instant/nearby/index.html?appid=4ba424c955dc49658d309639a6152d66" ></iframe>
            </div>
            <hr class="Body_Text">
         </div>
      </div>
      <div id="footer">
         <div class="container">
            <p class="address"><strong>Johns Hopkins Bloomberg School of Public Health</strong><br>615 N. Wolfe Street, Baltimore, MD 21205</p>
            <div class="linkset quicklinks"><a href="https://www.jhsph.edu/about/contact-us/">Contact Us</a> <a href="https://www.jhsph.edu/about/directions-and-maps/directions.html">Directions &amp; Maps</a> <a href="https://www.jhsph.edu/calendars/">Calendars</a>
            </div>
         </div>
      </div>
      <script src="js/main.js"></script>
      <script src="js/survey.js"></script>
   </body>
</html>
