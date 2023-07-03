window.onload = async function () {
  checkAlreadyLogged();
  await fetchExperience();
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


 //Create Experience Fetch
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
    console.log(raw)
    const requestOptions = {
      method: 'POST',
      body: raw,
      headers: myHeaders,
      redirect: 'follow'
    };
  
    const response = await fetch("/api/v1/student/experience",requestOptions);
    const data = await response.json();
    console.log(data);

    
  } catch (error) {
    // console.log("failed to fetch error", error);
  }
}

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
