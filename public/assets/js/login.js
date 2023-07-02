window.onload = function() {
  checkAlreadyLogged();
};


function checkAlreadyLogged(){
  fetch("http://localhost:5000/api/v1/user/whoami/")
  .then(response => response.json())    
  .then((data) => {
    
    if(data?.user?.role==='student'){
        window.location.href="http://localhost:5000/student/index.html"
    }else if(data?.user?.role==='admin'){
       window.location.href="http://localhost:5000/admin/index.html"
    }
    // console.log(JSON.stringify(data))
  })  
    .catch((error) => {
      // console.log('error', error)
    });
}

const stuForm = document.getElementById('studentFormValidate');
stuForm.addEventListener('submit', studentLogin);

const adminForm = document.getElementById('adminFormValidate');
adminForm.addEventListener('submit', adminLogin);

function studentLogin(event)  { 
  event.preventDefault();
  
  let roll_no=document.getElementById('rollNo').value;
  let dob=document.getElementById('dob').value;

  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    "roll_no": roll_no,
    "password": dob
  });

  let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://localhost:5000/api/v1/auth/login/student", requestOptions)
    .then((response) => {
      response.text()
      console.log(response.status)
      if(response.status===200){
        let host = window.location.host; 
        window.location.href=`http://${host}/student/index.html`
      }
    })
    .catch((error) => {
      // console.log('error', error)
    });


}

function adminLogin(event)  { 
  event.preventDefault();
  
  let email=document.getElementById('email').value;
  let adminPassword=document.getElementById('adminPassword').value;

  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    "email": email,
    "password": adminPassword
  });

  let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  fetch("http://localhost:5000/api/v1/auth/login/admin", requestOptions)
    .then((response) => {
      response.text()
      console.log(response.status)
      if(response.status===200){
        let host = window.location.host; 
        console.log(host)
        window.location.href=`http://${host}/admin/index.html`
      }
    })
    .catch((error) => {
      // console.log('error', error)
    });


}




+ function($) {
  $('.palceholder').click(function() {
    $(this).siblings('input').focus();
  });

  $('.form-control').focus(function() {
    $(this).parent().addClass("focused");
  });

  $('.form-control').blur(function() {
    let $this = $(this);
    if ($this.val().length == 0)
      $(this).parent().removeClass("focused");
  });
  $('.form-control').blur();

  // validetion
  $.validator.setDefaults({
    errorElement: 'span',
    errorClass: 'validate-tooltip'
  });

  $("#studentFormValidate").validate({
    rules: {
      rollNo: {
        required: true,
        minlength: 6
      },
      dob: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      rollNo: {
        required: "Please enter your Roll No.",
        minlength: "Please provide valid Roll No."
      },
      dob: {
        required: "Enter your password to Login.",
        minlength: "Incorrect login or password."
      }
    }
  });

}(jQuery);

