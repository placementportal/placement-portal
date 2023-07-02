window.onload = function() {
  checkAlreadyLogged();
};

function checkAlreadyLogged(){
  fetch("http://localhost:5000/api/v1/user/whoami/")
  .then(response => response.json())    
  .then((data) => {
    
    if(data?.user?.role==='student'){
        window.location.href="http://localhost:5000/student/index.html"
    }else if(data?.user?.role!=='admin'){
       window.location.href="http://localhost:5000/"
    }
    // console.log(JSON.stringify(data))
  })  
    .catch((error) => {
      // console.log('error', error)
    });
}




// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};
