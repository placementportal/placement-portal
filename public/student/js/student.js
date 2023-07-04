window.onload = async function () {
    checkAlreadyLogged();
    await fetchExperience();
    await fetchPlacement();
    await fetchEducation();
    await fetchPersonalDetail();
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
            document.getElementById('student-name-top').innerText=data.user.name
        })
        .catch((error) => {
            // console.log('error', error)
        });
}

// PERSONAL DETAIL FETCH
async function fetchPersonalDetail() {
    try {
        const response = await fetch("/api/v1/student/personal");
        const data = await response.json();

        const { personalData } = data;
        // console.log(data);
        const personalDetailParent = document.getElementById("personal-info-container");

        let {
            address,
            contactNumber,
            district,
            email,
            fatherName,
            motherName,
            state,
            _id,
        } = personalData;

        let html = `
            <div class="pd-text-wrapper">
                <div class="pd-text-group">
                    <div class="pd-text-main">
                        <h3>Father's Name:</h3>
                        <span>${fatherName}</span>
                    </div>
                    <div class="pd-text-main">
                        <h3>Mother's Name:</h3>
                        <span>${motherName}</span>
                    </div>
                    <div class="pd-text-main">
                        <h3>Contact Number:</h3>
                        <span>${contactNumber}</span>
                    </div>
                    <div class="pd-text-main">
                        <h3>Email:</h3>
                        <span>${email}</span>
                    </div>
                </div>
                <div class="pd-items-group">
                    <div class="pd-text-main">
                        <h3>Address:</h3>
                        <span>${address}</span>
                    </div>
                    <div class="pd-text-main">
                        <h3>District:</h3>
                        <span>${district}</span>
                    </div>
                    <div class="pd-text-main">
                        <h3>State:</h3>
                        <span>${state}</span>
                    </div>
                </div>
            </div>
            `;

    
            personalDetailParent.innerHTML += html;
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

// EDUCATION FETCH
async function fetchEducation() {
    try {
        const response = await fetch("/api/v1/student/education");
        const data = await response.json();

        const { education_details } = data;

        const educationParent = document.getElementById("education-container");

        let {
            batchId,
            btech_scores,
            departmentId,
            diploma_board,
            diploma_score,
            diploma_year,
            highschool_board,
            highschool_score,
            highschool_year,
            is_lateral_entry,
            _id,
        } = education_details;

        let html = `
            <div class="prof-qual-item">
                <h2>Graduation</h2>
                <div class="course-det">
                    <div>
                        <h3>Course:</h3>
                        <span>${batchId.batchName}</span>
                    </div>
                    <div>
                        <h3>Branch:</h3>
                        <span>${departmentId.departmentName}</span>
                    </div>
                </div>
            </div>
            
       
            `;

            if(is_lateral_entry){
                html+=`<div class="prof-qual-item">
                <h2>Diploma</h2>
                <div class="course-det">
                    <div>
                        <h3>Board:</h3>
                        <span>${diploma_board}</span>
                    </div>
                    <div>
                        <h3>Passing year:</h3>
                        <span>${diploma_year}</span>
                    </div>
                </div>
                <div class="course-det">
                    <div>
                        <h3>Diploma Percentage:</h3>
                        <span>${diploma_score}%</span>
                    </div>
                </div>
            </div>`
            }

            html+=`<div class="prof-qual-item">
                <h2>High School</h2>
                <div class="course-det">
                    <div>
                        <h3>Board:</h3>
                        <span>${highschool_board}</span>
                    </div>
                   <div>
                        <h3>High School Percentage:</h3>
                        <span>${highschool_score} %</span>
                   </div>
                </div>
                
                <div class="course-det">
                    <div>
                        <h3>High School Year:</h3>
                        <span>${highschool_year}</span>
                    </div>
                </div>
            </div>
        </div>`


        educationParent.innerHTML += html;
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

//Create Experience
document
    .getElementById("create-exp-form")
    .addEventListener("submit", createExperience);
async function createExperience(e) {
    e.preventDefault();
    const company_name = document.getElementById("company_name").value;
    const job_profile = document.getElementById("job_profile").value;
    const start_date = document.getElementById("start_date").value;
    const end_date = document.getElementById("end_date").value;

    // const end_date=document.getElementById('end_date').value;
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const raw = {
            jobProfile: job_profile,
            company: company_name,
            startDate: start_date,
        };
        if (end_date) {
            raw["endDate"] = end_date;
        }
        const requestOptions = {
            method: "POST",
            body: JSON.stringify(raw),
            headers: myHeaders,
            redirect: "follow",
        };

        Loader.open();
        const response = await fetch(
            "/api/v1/student/experience",
            requestOptions
        );
        const data = await response.json();
        Loader.close();

        if (data.success) {
            window.location.reload();
        } else {
            document.getElementById(
                "exp-error-msg"
            ).innerHTML = `${data.message}`;
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

        const { experiences } = data;

        const experienceParent = document.getElementById(
            "experience-container"
        );
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
            } else {
                html += ` <div><h3>End Date:</h3><span>Currently Working</span></div>`;
            }

            html += `</div></div></div>`;
            experienceParent.innerHTML += html;
        }
    } catch (error) {
        console.log("failed to fetch error", error);
    }
}

//Create Placement

document
    .getElementById("placed-detail-form")
    .addEventListener("submit", createPlacement);
async function createPlacement(e) {
    e.preventDefault();
    const placed_job_profile =
        document.getElementById("placed-job-profile").value;
    const placed_company = document.getElementById("placed-company").value;
    const placed_company_loc =
        document.getElementById("placed-company-loc").value;
    const placed_package = document.getElementById("placed-package").value;
    const placed_offer_letter = document.getElementById(
        "placed-offer-letter"
    ).files;
    const placed_joining_letter = document.getElementById(
        "placed-joining-letter"
    ).files;
    const placed_doj = document.getElementById("placed-doj").value;

    // const end_date=document.getElementById('end_date').value;
    try {
        var formdata = new FormData();
        formdata.append("jobProfile", placed_job_profile);
        formdata.append("company", placed_company);
        formdata.append("location", placed_company_loc);
        formdata.append("package", placed_package);

        var requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
        };

        if (placed_offer_letter[0]) {
            formdata.append("offerLetter", placed_offer_letter[0]);
        }
        if (placed_joining_letter[0]) {
            formdata.append("joiningLetter", placed_joining_letter[0]);
        }
        if (placed_doj) {
            formdata.append("joiningDate", placed_doj);
        }
        Loader.open();
        const response = await fetch(
            "/api/v1/student/placement",
            requestOptions
        );
        const data = await response.json();
        Loader.close();
        if (data.success) {
            window.location.reload();
        } else {
            document.getElementById(
                "plac-error-msg"
            ).innerHTML = `${data.message}`;
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

        for (let placement of placements) {
            let {
                company,
                jobProfile,
                joiningDate,
                joiningLetter,
                location,
                offerLetter,
                package,
                student_id,
                _id,
            } = placement;

            joiningDate = joiningDate.split("T")[0];

            let html = `
      <div class="exp-info-text">
        <div class="prof-exp-item" id=${_id}>
          <h2>${company}</h2>
          <div class="exp-inner-wrap">
            <div><h3>Job Role:</h3><span>${jobProfile}</span></div>  
          </div>    
          <div class="exp-inner-wrap">
            <div><h3>Package:</h3><span>${package}</span></div>
          </div>
          <div class="exp-inner-wrap">
            <div><h3>Location:</h3><span>${location}</span></div>
          </div>
          
        `;

            if (joiningDate) {
                html += `<div class="exp-inner-wrap">
                        <div><h3>Start Date:</h3><span>${joiningDate}</span></div>
                    </div>`;
            }
            if (offerLetter) {
                html += `<div class="exp-inner-wrap">
                          <div><h3>Start Date:</h3><a href=${offerLetter}>Click to view offer letter</a></div>
                      </div>`;
            }
            if (joiningLetter) {
                html += `<div class="exp-inner-wrap">
                          <div><h3>Start Date:</h3><a href=${joiningLetter}>Click to view joining letter</a></div>
                      </div>`;
            }

            html += `</div>
            </div>`;
            placementParent.innerHTML += html;
        }
    } catch (error) {
        console.log("failed to fetch error", error);
    }
}

// LOGOUT
document.getElementById("logout").addEventListener("click", logoutFunc);
async function logoutFunc(e) {
    e.preventDefault();
    try {
        var requestOptions = {
            method: "GET",
            redirect: "follow",
        };
        const response = await fetch("/api/v1/auth/logout", requestOptions);
        const data = await response.json();
        window.location.reload();
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

// JAVASCRIPT CODE FOR OTHER THAN API CALLS

const curr_working = document.getElementById("exp-curr-work");
curr_working.addEventListener("click", toggleEndDate);
function toggleEndDate() {
    if (curr_working.checked == true) {
        document.getElementById("exp_end_date").style.display = "none";
    } else {
        document.getElementById("exp_end_date").style.display = "block";
    }
}

//main menu in mobile
document.getElementById("hamburger").addEventListener("click", mobMenuToggle);
function mobMenuToggle() {
    const main_menu = document.querySelector(".main-menu");
    if (main_menu.classList.contains("showHamburger")) {
        main_menu.classList.remove("showHamburger");
    } else {
        main_menu.classList.add("showHamburger");
    }
}

document
    .getElementById("placed-offer-letter")
    .addEventListener("change", function (e) {
        if (e.target.files[0]) {
            document.getElementById(
                "placed-offer-letter"
            ).nextElementSibling.innerHTML = `${e.target.files[0].name}`;
        }
    });

document
    .getElementById("placed-joining-letter")
    .addEventListener("change", function (e) {
        if (e.target.files[0]) {
            document.getElementById(
                "placed-joining-letter"
            ).nextElementSibling.innerHTML = `${e.target.files[0].name}`;
        }
    });

//Create Experience poppup
const createExpBtn = document.getElementById("create-exp-btn");
const closeExpBtn = document.getElementById("close-exp-modal");

createExpBtn.addEventListener("click", showExpModal);
closeExpBtn.addEventListener("click", hideExpModal);
function showExpModal(event) {
    event.preventDefault();
    document.getElementById("create-exp-modal").style.display = "block";
}
function hideExpModal(event) {
    event.preventDefault();
    document.getElementById("create-exp-modal").style.display = "none";
}

//Create Placement poppup
const createPlacBtn = document.getElementById("create-plac-btn");
const closePlacBtn = document.getElementById("close-plac-modal");

createPlacBtn.addEventListener("click", showPlacModal);
closePlacBtn.addEventListener("click", hidePlacModal);
function showPlacModal(event) {
    event.preventDefault();
    document.getElementById("create-plac-modal").style.display = "block";
}
function hidePlacModal(event) {
    event.preventDefault();
    document.getElementById("create-plac-modal").style.display = "none";
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
