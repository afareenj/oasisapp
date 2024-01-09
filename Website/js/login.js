var id = localStorage.getItem("ID");
var username = localStorage.getItem("Username");

if (id != null && username != null) {
  //TODO: connect to db and check if this login and username is a real combination here
  location.href = "oasis.php";
}


window.onload = function() {

  document.getElementById("loginform").onsubmit = function(e) {
    e.preventDefault();
    if (validateForm()) {
      form = document.getElementById("loginform");
      form.submit();
    }

  };


  function validateForm() {
    var name = document.forms["loginInfo"]["Name"].value;
    var id = document.forms["loginInfo"]["ID"].value;


    //TODO:
    //check that name & id is not blank, and that it's not a script/cheap hacks

  $.ajax({
      method: "POST",
      url: "PHP/login.php",
      data: { name: name, id: id },
      async:false, // Is this okay? needed to harness AJAX
      success: function(is_valid) {
        valid = is_valid.toString();
    },
    error: function(response) {
        console.log('Query failed for login validation, php script returned this response: ');
        console.log(response);
    }
    });

    console.log(valid);

      if(valid.replace(/(\r\n|\n|\r)/gm, "") === "VALID"){
        window.localStorage.setItem("ID", id);
        window.localStorage.setItem("Username", name);
        return true;
      } else {
        document.getElementById("error").style.display = "block";
        return false;
      }
    }

    document.getElementById("passwordshow").onclick = function() {
      return showPassword();
    };

    function showPassword() {
    var x = document.getElementById("ID");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  }
