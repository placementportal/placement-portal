window.onload = async function () {
  checkAlreadyLogged();
  await fetchExperience();
  await fetchPlacement();
};

function checkAlreadyLogged() {
  fetch("/api/v1/user/whoami/")
    .then((response) => response.json())
    .then((data) => {
      if (data?.user?.role === "admin") {
        window.location.href = "/admin/index.html";
      } else if (data?.user?.role !== "student") {
        window.location.href = "/";
      }
      // console.log(JSON.stringify(data))
    })
    .catch((error) => {
      // console.log('error', error)
    });
}



 //Create Experience 
 document.getElementById('create-exp-form').addEventListener('submit',createExperience);
 async function createExperience(e) {
     e.preventDefault();
     const company_name=document.getElementById('company_name').value;
     const job_profile=document.getElementById('job_profile').value;
     const start_date=document.getElementById('start_date').value;
 
     console.log(start_date)
     // const end_date=document.getElementById('end_date').value;
     try {
     let myHeaders = new Headers();
     myHeaders.append("Content-Type", "application/json");
     const raw = JSON.stringify({
       "jobProfile": job_profile,
       "company": company_name,
       "startDate": start_date
     });
   
     const requestOptions = {
       method: 'POST',
       body: raw,
       headers: myHeaders,
       redirect: 'follow'
     };
 
 
     Loader.open()
     const response = await fetch("/api/v1/student/experience",requestOptions);
     const data = await response.json();
     Loader.close()
 
     if(data.success){
       window.location.reload();
     }else{
       document.getElementById('exp-error-msg').innerHTML=`${data.message}`
     }
     
   } catch (error) {
     // console.log("failed to fetch error", error);
   }
 }
 
 
// STUDENT EXPERIENCE FETCH
async function fetchExperience() {
  try {
    const response = await fetch("/api/v1/student/experience");
    const data = await response.json();
    // console.log(data);

    const { experiences } = data;

    const experienceParent = document.getElementById("experience-container");
    for (let experience of experiences) {
      let { jobProfile, company, startDate, endDate, _id } = experience;

      startDate = startDate.split("T")[0];

      let html = `
      <div class="exp-info-text">
        <div class="prof-exp-item" id=${_id}>
          <h2>${company}</h2>
          <div class="exp-inner-wrap">
            <div><h3>Job Role:</h3><span>${jobProfile}</span></div>  
          </div>    
          <div class="exp-inner-wrap">
            <div><h3>Start Date:</h3><span>${startDate}</span></div>`;

      if (endDate) {
        endDate = endDate.split("T")[0];
        html += ` <div><h3>End Date:</h3><span>${endDate}</span></div>`;
      }

      html += `</div></div></div>`;
      experienceParent.innerHTML += html;
    }
  } catch (error) {
    console.log("failed to fetch error", error);
  }
}




 //Create Placement

 document.getElementById('placed-detail-form').addEventListener('submit',createPlacement);
 async function createPlacement(e) {
  e.preventDefault();
  const placed_job_profile=document.getElementById('placed-job-profile').value;
  const placed_company=document.getElementById('placed-company').value;
  const placed_company_loc=document.getElementById('placed-company-loc').value;
  const placed_package=document.getElementById('placed-package').value;
  const placed_offer_letter=document.getElementById('placed-offer-letter').files;
  const placed_joining_letter=document.getElementById('placed-joining-letter').files;
  const placed_doj=document.getElementById('placed-doj').value;

  // const end_date=document.getElementById('end_date').value;
  try {

    var formdata = new FormData();
    formdata.append("jobProfile", placed_job_profile);
    formdata.append("company", placed_company);
    formdata.append("location", placed_company_loc);
    formdata.append("package", placed_package);
    formdata.append("offerLetter", placed_offer_letter[0]);
    formdata.append("joiningLetter", placed_joining_letter[0]);
    formdata.append("joiningDate", placed_doj);
  
    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

  const response = await fetch("/api/v1/student/placement",requestOptions);
  const data = await response.json();
 
  if(data.success){
    window.location.reload();
  }else{
    document.getElementById('plac-error-msg').innerHTML=`${data.message}`
  }

  
  } catch (error) {
  console.log("failed to fetch error", error);
  }
}


// STUDENT Placement FETCH
async function fetchPlacement() {
  try {
    const response = await fetch("/api/v1/student/placement");
    const data = await response.json();
    
    const { placements } = data;

    const placementParent = document.getElementById("placement-container");
    console.log(placements)

    for (let placement of placements) {
      let { company, jobProfile, joiningDate, joiningLetter, location, offerLetter,package,student_id,_id } = placement;

      joiningDate = joiningDate.split("T")[0];

      let html = `
      <div class="exp-info-text">
        <div class="prof-exp-item" id=${_id}>
          <h2>${company}</h2>
          <div class="exp-inner-wrap">
            <div><h3>Job Role:</h3><span>${jobProfile}</span></div>  
          </div>    
          <div class="exp-inner-wrap">
            <div><h3>Start Date:</h3><span>${joiningDate}</span></div>
          </div>
          <div class="exp-inner-wrap">
            <div><h3>Joining Letter Date:</h3><a href=${joiningLetter}>Click To View</a></div>
          </div>
          <div class="exp-inner-wrap">
            <div><h3>Package:</h3><span>${package}</span></div>
          </div>
          <div class="exp-inner-wrap">
            <div><h3>Location:</h3><span>${location}</span></div>
          </div>
          <div class="exp-inner-wrap">
            <div><h3>offer Letter</h3><a href=${offerLetter}>Click to view</a></div>
          </div>
          
        </div>
      </div>`;

      // if (endDate) {
      //   endDate = endDate.split("T")[0];
      //   html += ` <div><h3>End Date:</h3><span>${endDate}</span></div>`;
      // }

      placementParent.innerHTML += html;
    }


  } catch (error) {
    console.log("failed to fetch error", error);
  }
}



// LOGOUT 
document.getElementById('logout').addEventListener('click',logoutFunc);
async function logoutFunc(e){
  e.preventDefault();
  try {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    const response = await fetch("/api/v1/auth/logout",requestOptions);
    const data = await response.json();
    window.location.reload();

    
  } catch (error) {
    // console.log("failed to fetch error", error);
  }
}








// JAVASCRIPT CODE FOR OTHER THAN API CALLS

//main menu in mobile
document.getElementById('hamburger').addEventListener('click',mobMenuToggle);
function mobMenuToggle(){
  const main_menu=document.querySelector('.main-menu');
  if(main_menu.classList.contains('showHamburger')){
    main_menu.classList.remove('showHamburger')
  }else{
    main_menu.classList.add('showHamburger')
  }
}



document.getElementById('placed-offer-letter').addEventListener('change', function(e) {
  if (e.target.files[0]) {
    document.getElementById('placed-offer-letter').nextElementSibling.innerHTML=`${e.target.files[0].name}`
  }
});

document.getElementById('placed-joining-letter').addEventListener('change', function(e) {
  if (e.target.files[0]) {
    document.getElementById('placed-joining-letter').nextElementSibling.innerHTML=`${e.target.files[0].name}`
  }
});


 //Create Experience poppup
 const createExpBtn = document.getElementById('create-exp-btn'); 
 const closeExpBtn = document.getElementById('close-exp-modal'); 

 createExpBtn.addEventListener('click',showExpModal);
 closeExpBtn.addEventListener('click',hideExpModal);
 function showExpModal(event){
   event.preventDefault();
   document.getElementById('create-exp-modal').style.display="block";
 }
 function hideExpModal(event){
   event.preventDefault();
   document.getElementById('create-exp-modal').style.display="none";
 }

  //Create Placement poppup
  const createPlacBtn = document.getElementById('create-plac-btn'); 
  const closePlacBtn = document.getElementById('close-plac-modal'); 
 
  createPlacBtn.addEventListener('click',showPlacModal);
  closePlacBtn.addEventListener('click',hidePlacModal);
  function showPlacModal(event){
    event.preventDefault();
    document.getElementById('create-plac-modal').style.display="block";
  }
  function hidePlacModal(event){
    event.preventDefault();
    document.getElementById('create-plac-modal').style.display="none";
  }

// Profile Tabs Switching
const tabButtons = document.querySelectorAll(".prof-tab-links");
for (let i = 0; i < tabButtons.length; i++) {
  tabButtons[i].addEventListener("click", function (e) {
    e.preventDefault();
    let tabName = this.dataset.tab;
    let tabContent = document.getElementById(tabName);

    let allTabContent = document.querySelectorAll(".prof-tab-content");
    let allTabButtons = document.querySelectorAll(".prof-tab-links");

    for (let j = 0; j < allTabContent.length; j++) {
      allTabContent[j].style.display = "none";
    }
    for (let k = 0; k < allTabButtons.length; k++) {
      allTabButtons[k].classList.remove("active");
    }
    tabContent.style.display = "block";
    this.classList.add("active");
  });
}

document.querySelector(".prof-tab-links").click();
