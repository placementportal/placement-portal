window.onload = function() {
    checkAlreadyLogged();
  };
  
  function checkAlreadyLogged(){
    fetch("/api/v1/user/whoami/")
    .then(response => response.json())    
    .then((data) => {
      
      if(data?.user?.role==='admin'){
          window.location.href="/admin/index.html"
      }else if(data?.user?.role!=='student'){
         window.location.href="/"
      }
      // console.log(JSON.stringify(data))
    })  
      .catch((error) => {
        // console.log('error', error)
      });
  }



  // STUDENT EXPERIENCE FETCH
  function fetchExperience(){
    var myHeaders = new Headers();
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch("http://localhost:5000/api/v1/student/experience", requestOptions)
      .then(response => response.json())
      .then((result) => {
      // ADD HERE CODE FOR HTML
  
        console.log(result)
      })
      .catch(error => console.log('error', error));
  }fetchExperience();




  




const tabButtons = document.querySelectorAll('.prof-tab-links');
for(let i=0;i<tabButtons.length;i++){
  tabButtons[i].addEventListener('click',function(e){
    e.preventDefault();
    let tabName = this.dataset.tab;
    let tabContent=document.getElementById(tabName);

    let allTabContent = document.querySelectorAll(".prof-tab-content");
    let allTabButtons = document.querySelectorAll(".prof-tab-links");

    for(let j=0;j<allTabContent.length;j++){
      allTabContent[j].style.display="none";
    }
    for(let k=0;k<allTabButtons.length;k++){
      allTabButtons[k].classList.remove('active');
    }
    tabContent.style.display="block";
    this.classList.add("active");
  });
}

document.querySelector('.prof-tab-links').click();