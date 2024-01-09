


// to fix: now that onclick is in survey file, the lack of unique id for button is causing an issue
/*


document.querySelector('.prevBtnClass').addEventListener('click', event => {
  nextPrev(-1);
})
document.querySelector('.nextBtnClass').addEventListener('click', event => {
  nextPrev(1);
})
*/

var currentTab = 0;
showTab(currentTab);
var prev = [];
var random = "first";
function showTab(n) {
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  fixStepIndicator(n);
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;

  y = x[currentTab].getElementsByTagName("input"); //every other input except matrix
  z = x[currentTab].getElementsByTagName("table"); //matrix

  // For radio buttons
  var value_check = document.querySelector('input[name = "'+(currentTab+1)+'"]:checked');

  console.log(value_check);
  let shift = 1; //next question to go to
  let chosen = false; //did user select an answer
  let min = 0;
  // Move random first or last to beginning of survey
  random = getFirstOrLast();
  for (let i = n + 1; i < x.length; i++) {
    x[i].innerHTML = x[i].innerHTML.replace("[random]", random);
  }

  if ((y.length == 1 && y[0].type == "number") || (y.length == 1 && y[0].type == "text") || (z.length != 0)) {
    let id = parseInt(y[0].id);
    if (z.length != 0) {
      let rows = z[0].getElementsByTagName("tr");
      let checked = 0;
      for (i = 0; i < y.length; i++) {
        console.log(y[i].checked);
        var checking = document.querySelector('input[name = "'+(currentTab+1)+','+(i+1)+'"]:checked');
        console.log(checking);
          //if (y[i].checked) {
            if(checking !=null){
          checked = checked + 1;
        }
    }
      if (rows.length == checked + 1) {
        chosen = true;

      }

    } else {
      //nextQ = true;
      chosen = true;
    }

    var switchs = d[id - 1]["switch"];
    var switch_arr = switchs.split(',');
    // should be switch_arr[checked] ??
    shift = parseInt(switch_arr[0]);

  } else {
    min = y.length - 1;
    console.log(y);
   // for (i = 0; i < y.length; i++) {
      // If a field is empty...
      //console.log(y[i].checked);
      if(value_check!=null)
      //if (y[i].checked) {
        chosen = true;
       // let id_arr = y[i].id.split(',');
       let id_arr = value_check.id.split(',');
        let id = parseInt(id_arr[0]);
        let val = parseInt(id_arr[1]);
        if (min >= val) {
          min = val;
        }
        var switchs = d[id - 1]["switch"];
        var switch_arr = switchs.split(',');
        shift = parseInt(switch_arr[min]);
     // }
   // }
  }

  let prevCurrent = currentTab;
  console.log(chosen);
  console.log(currentTab);
  if (n == 1 && chosen) {
    x[currentTab].getElementsByClassName("error")[0].style.display = "none";
    prev.push(currentTab);
    if (shift != -1 && x[shift].getElementsByClassName("map").length != 0) {
      mapID = "map" + (shift + 1);
      mapInputID = "#" + (shift + 1);
      initMapSurvey();
    }
    currentTab = shift;
  } else if (n == -1) {
    x[currentTab].getElementsByClassName("error")[0].style.display = "none";
    let temp = prev.pop();
    if (x[temp].getElementsByClassName("map").length != 0) {
      mapID = "map" + (temp + 1);
      mapInputID = "#" + (temp + 1);
      initMapSurvey();

    }
    currentTab = temp;
  } else {
    x[currentTab].getElementsByClassName("error")[0].style.display = "block";
  }
  // if you have reached the end of the form... :
  if (currentTab >= x.length || (shift == -1 && n != -1)) {
    //TODO: check data first
    //...the form gets submitted and username posted:
    let user = localStorage.getItem("Username");
    document.getElementById("nextBtn").type = "submit";
    Object.keys(locationChange).forEach(function (key) {
      let tempLocString = "(" + locationChange[key].lat + ", " + locationChange[key].lng + ")";
      document.getElementById(key.substring(1)).value = JSON.stringify(tempLocString);
    });
    locationChange = [];

    let formInfo = document.getElementById("regform");
    let username = document.createElement("INPUT");
    username.style.display = "none";
    username.setAttribute("type", "text");
    username.value = user + ',' + surveyVersion;
    username.name = "username";

    username.id = "delete";
    formInfo.appendChild(username);
    let formData = new FormData(formInfo);
    var request = new XMLHttpRequest();
    request.open("POST", "PHP/submit.php");
    request.send(formData);
    return false;

  } else {
    // Hide the current tab:
    x[prevCurrent].style.display = "none";
    // Otherwise, display the correct tab:
    showTab(currentTab);
  }

}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {

    if (y[i].value == "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false:
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}

function getRandomInt(max) {
  let val = Math.floor(Math.random() * max) + 1;
  let j = val % 10, k = val % 100;
  if (j == 1 && k != 11) {
    return val + "st";
  }
  if (j == 2 && k != 12) {
    return val + "nd";
  }
  if (j == 3 && k != 13) {
    return val + "rd";
  }
  return val + "th";
}

function getFirstOrLast() {
  let time = Math.floor(Math.random() * 2) + 1;
  if (time == 1) {
    return "first";
  }
  return "last";
}
