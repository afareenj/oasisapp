id = localStorage.getItem("ID");
var username = localStorage.getItem("Username");

if (id == null || username == null) {
  location.href = "index.html";
}

document.getElementById("home").style.display = "block";
document.getElementById("survey").style.display = "none";
document.getElementById("prev").style.display = "none";
document.getElementById("covid").style.display = "none";
document.getElementById("narcan").style.display = "none";
document.getElementById("lhome").className = "activenavpath";
document.getElementById("lprev").className = "";
document.getElementById("lcovid").className = "";
document.getElementById("lnarcan").className = "";
document.getElementById("lsignout").className = "";


window.onload = function() {
  var a = document.getElementById("ahome");

  a.onclick = function() {
    showDiv("home");
    return false;
  }

  var b = document.getElementById("aprev");

  b.onclick = function() {
    showDiv("prev");
    return false;
  }


  var c = document.getElementById("acovid");

  c.onclick = function() {
    showDiv("covid");
    return false;
  }


  var d = document.getElementById("anarcan");

  d.onclick = function() {
    showDiv("narcan");
    return false;
  }

  var e = document.getElementById("asignout");

  e.onclick = function() {
    showDiv("signout");
    localStorage.removeItem("ID");
    localStorage.removeItem("Username");
    location.href = "index.html";
    return false;
  }

  var reverse = document.getElementById("reverse_entry");

  reverse.onclick = function() {
    reversal();
  }

  var injectionBtn = document.getElementById("injection");
  if (typeof(injectionBtn) != 'undefined' && injectionBtn != null) {
    injectionBtn.onclick = showMap;
  }

  function showMap() {
    document.getElementById("instructions").style.display = "none";
    document.getElementById("survey").style.display = "block";
    return false;
  }

  var sortCHEntry = document.getElementById("entry");
  var sortCHDate = document.getElementById("date");
  var sortCHTime = document.getElementById("time");
  sortCHEntry.onclick = function() {
    sortTable(0);
    return false;
  }
  sortCHDate.onclick = function() {
    sortTable(1);
    return false;
  }
  sortCHTime.onclick = function() {
    sortTable(2);
    return false;
  }

  //forms
  var x = document.forms["searchPrev"]["Search"].value;


  var newEntry = document.getElementById("newEntry");
  newEntry.onclick = function() {
    showDiv("home");
    return false;
  }
}


function showDiv(page) {
  document.getElementById("home").style.display = "none";
  document.getElementById("survey").style.display = "none";
  document.getElementById("prev").style.display = "none";
  document.getElementById("covid").style.display = "none";
  document.getElementById("narcan").style.display = "none";
  document.getElementById("lhome").className = "";
  document.getElementById("lprev").className = "";
  document.getElementById("lcovid").className = "";
  document.getElementById("lnarcan").className = "";
  document.getElementById("lsignout").className = "";

  if (page == "home") {
      document.getElementById("lhome").className = "activenavpath";
      document.getElementById("home").style.display = "block";
      document.getElementById("survey").style.display = "none";
      document.getElementById("instructions").style.display = "block";
    } else if (page == "prev") {
      document.getElementById("lprev").className = "activenavpath";
      document.getElementById("prev").style.display = "block";
    } else if (page == "covid") {
      document.getElementById("lcovid").className = "activenavpath";
      document.getElementById("covid").style.display = "block";
    } else if (page == "narcan") {
      document.getElementById("lnarcan").className = "activenavpath";
      document.getElementById("narcan").style.display = "block";
    } else if (page == "signout") {
      document.getElementById("lsignout").className = "activenavpath";
    }

}


function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("prevEntry");
  switching = true;
  dir = "asc";
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount ++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

document.getElementById("clear").style.display = "none";

document.querySelector('#searchForm').addEventListener('submit', (e) => {
  let val = e.srcElement[0].value.toUpperCase();
  e.preventDefault();
  table = document.getElementById("prevEntry");
  tr = table.getElementsByTagName("tr");
  clear_search = document.getElementById("clear");
  if(val !="") {
    clear_search.style.display = "block";
  } else {
    clear_search.style.display = "none";
  }


  for (i = 0; i < tr.length; i++) {
    for(j = 0; j < 4; j++) {
    td = tr[i].getElementsByTagName("td")[j];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(val) > -1) {
        tr[i].style.display = "";
        j = 5;
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

});

clear_search = document.getElementById("clear");
clear_search.addEventListener("click",() => {
  table = document.getElementById("prevEntry");
  tr = table.getElementsByTagName("tr");

  let val = "";

  for (i = 0; i < tr.length; i++) {
    for(j = 0; j < 4; j++) {
    td = tr[i].getElementsByTagName("td")[j];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(val) > -1) {
        tr[i].style.display = "";
        j = 5;
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

clear_search.style.display = "none";
document.getElementById("search").value='';
});
