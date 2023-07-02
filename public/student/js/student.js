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
    console.log(data);

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
