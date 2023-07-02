window.onload = function() {
    checkAlreadyLogged();
  };
  
  function checkAlreadyLogged(){
    fetch("http://localhost:5000/api/v1/user/whoami/")
    .then(response => response.json())    
    .then((data) => {
      
      if(data?.user?.role==='admin'){
          window.location.href="http://localhost:5000/admin/index.html"
      }else if(data?.user?.role!=='student'){
         window.location.href="http://localhost:5000/"
      }
      // console.log(JSON.stringify(data))
    })  
      .catch((error) => {
        // console.log('error', error)
      });
  }
  