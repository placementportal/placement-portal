window.onload = async function () {
    checkAlreadyLogged();
    // await ();
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
            document.getElementById("student-name-top").innerText =
                data.user.name;
        })
        .catch((error) => {
            // console.log('error', error)
        });
}

// PERSONAL DETAIL FETCH
async function fetchPersonalDetail() {
    try {
        Loader.open();
        const response = await fetch("/api/v1/student/personal");
        const data = await response.json();
        Loader.close();
        const { student } = data;
        const { personal_details } = student;
        // console.log(data);
        const personalDetailParent = document.getElementById(
            "personal-info-container"
        );
        const studentProfile = document.getElementById("student-profile-pic");

        let { name, email, photo } = student;
        let {
            address,
            contactNumber,
            district,
            fatherName,
            motherName,
            state,
            _id,
        } = personal_details;

        let html = `
            <div class="pd-text-wrapper">
                <div class="pd-text-group">
                    <div class="pd-text-main">
                        <h3>Name:</h3>
                        <span>${name}</span>
                    </div>
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

        if (photo) {
            studentProfile.src = photo;
        }
        personalDetailParent.innerHTML += html;
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

// EDUCATION FETCH
async function fetchEducation() {
    try {
        Loader.open();
        const response = await fetch("/api/v1/student/education");
        const dataItem = await response.json();
        Loader.close();

        const { data } = dataItem;
        const { education_details } = data;

        const educationParent = document.getElementById("education-container");
        educationParent.innerHTML = "";
        let { batchId, courseId, departmentId, roll_no, _id } = data;
        let {
            btech_scores,
            diploma_board,
            diploma_score,
            diploma_year,
            highschool_board,
            highschool_score,
            highschool_year,
            is_lateral_entry,
        } = education_details;

        document.getElementById("is_lateral_entry").value = is_lateral_entry;
        let html = `
            <div class="prof-qual-item">
                <div class="qual-head-wrap">
                    <h2>Graduation</h2>
                    <a href="#" id="edit-grad-poppup" onclick="editGradPoppup(event);">Edit Graduation<i class="fa-regular fa-pen-to-square"></i></a>
                </div>
                <div class="course-det">
                    <div>
                        <h3>Course:</h3>
                        <span>${courseId.courseName}</span>
                    </div>
                    <div>
                        <h3>Branch:</h3>
                        <span>${departmentId.departmentName}</span>
                    </div>
                </div>
                <div class="course-det">
                    <div>
                        <h3>Passing Year:</h3>
                        <span>${batchId.batchYear}</span>
                    </div>
                </div>
                <div class="course-det">
                    <div>
                        <h3>1st Year:</h3>
                        <span>${batchId.batchYear}</span>
                    </div>
                </div>
            </div>
            
       
            `;

        let remainingDefaultScoresCount;

        if (is_lateral_entry)
            remainingDefaultScoresCount = 6 - btech_scores.length;
        else remainingDefaultScoresCount = 8 - btech_scores.length;

        for (let i = 0; i < remainingDefaultScoresCount; i++) {
            btech_scores.push(0);
        }

        let bTechScoreCounter = 0;
        if (!is_lateral_entry) {
            document.getElementById("first_sem_score").value = btech_scores[0];
            document.getElementById("second_sem_score").value = btech_scores[1];
            bTechScoreCounter = 2;
        }

        document.getElementById("third_sem_score").value =
            btech_scores[bTechScoreCounter++];
        document.getElementById("fourth_sem_score").value =
            btech_scores[bTechScoreCounter++];
        document.getElementById("fifth_sem_score").value =
            btech_scores[bTechScoreCounter++];
        document.getElementById("sixth_sem_score").value =
            btech_scores[bTechScoreCounter++];
        document.getElementById("seventh_sem_score").value =
            btech_scores[bTechScoreCounter++];
        document.getElementById("eighth_sem_score").value =
            btech_scores[bTechScoreCounter++];

        if (is_lateral_entry) {
            document.getElementById("lateral-hide").style.display = "none";

            html += `<div class="prof-qual-item id=${_id}">
                <div class="qual-head-wrap">
                    <h2>Diploma</h2>
                    <a href="#" id="edit-diploma-poppup" onclick="editDiplomaPoppup(event);">Edit Diploma<i class="fa-regular fa-pen-to-square"></i></a>
                </div>
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
            </div>`;

            document.getElementById("diploma_board").value = diploma_board;
            document.getElementById("diploma_year").value = diploma_year;
            document.getElementById("diploma_score").value = diploma_score;
        }

        html += `<div class="prof-qual-item">
                <div class="qual-head-wrap">
                    <h2>High School</h2>
                    <a href="#" id="edit-grad-poppup" onclick="editHighSchoolPoppup(event);">Edit High School<i class="fa-regular fa-pen-to-square"></i></a>
                </div>
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
                        <h3>Passing Year:</h3>
                        <span>${highschool_year}</span>
                    </div>
                </div>
            </div>
        </div>`;

        document.getElementById("high_school_year").value = highschool_year;
        document.getElementById("high_school_score").value = highschool_score;
        document.getElementById("high_school_board").value = highschool_board;

        educationParent.innerHTML += html;
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

// Update Education Details

// Update Graduation Details
document
    .getElementById("edit-grad-form")
    .addEventListener("submit", updateGradForm);
async function updateGradForm(e) {
    e.preventDefault();
    const first_sem_score = parseInt(
        document.getElementById("first_sem_score").value
    );
    const second_sem_score = parseInt(
        document.getElementById("second_sem_score").value
    );
    const third_sem_score = parseInt(
        document.getElementById("third_sem_score").value
    );
    const fourth_sem_score = parseInt(
        document.getElementById("fourth_sem_score").value
    );
    const fifth_sem_score = parseInt(
        document.getElementById("fifth_sem_score").value
    );
    const sixth_sem_score = parseInt(
        document.getElementById("sixth_sem_score").value
    );
    const seventh_sem_score = parseInt(
        document.getElementById("seventh_sem_score").value
    );
    const eighth_sem_score = parseInt(
        document.getElementById("eighth_sem_score").value
    );
    const gradUpdateBody = document.getElementById("gradUpdateBody").value;

    try {
        const isLateral = document.getElementById("is_lateral_entry").value;

        let btechScoreList = [
            third_sem_score,
            fourth_sem_score,
            fifth_sem_score,
            sixth_sem_score,
            seventh_sem_score,
            eighth_sem_score,
        ];
        if (!isLateral) {
            btechScoreList = [
                first_sem_score,
                second_sem_score,
                third_sem_score,
                fourth_sem_score,
                fifth_sem_score,
                sixth_sem_score,
                seventh_sem_score,
                eighth_sem_score,
            ];
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = {
            is_lateral_entry: isLateral === "true",
            update: gradUpdateBody,
            updateBody: {
                btech_scores: btechScoreList,
            },
        };

        let requestOptions = {
            method: "PATCH",
            body: JSON.stringify(raw),
            headers: myHeaders,
            redirect: "follow",
        };

        Loader.open();
        const response = await fetch(
            "/api/v1/student/education",
            requestOptions
        );
        const data = await response.json();
        Loader.close();

        if (data.success) {
            window.location.reload();
        } else {
            // document.getElementById(
            //     "highSchool-err-msg"
            // ).innerHTML = `${data.message}`;
        }
    } catch (error) {
        console.log("failed to fetch error", error);
    }
}

// Update High School Details
document
    .getElementById("edit-highSchool-form")
    .addEventListener("submit", updateHighSchoolForm);

async function updateHighSchoolForm(e) {
    e.preventDefault();
    let high_school_year = document.getElementById("high_school_year").value;
    let high_school_score = document.getElementById("high_school_score").value;
    let high_school_board = document.getElementById("high_school_board").value;
    let isLateral = document.getElementById("is_lateral_entry").value;
    const highUpdateBody = document.getElementById("hsUpdateBody").value;
    try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        let raw = JSON.stringify({
            is_lateral_entry: isLateral,
            update: highUpdateBody,
            updateBody: {
                highschool_year: high_school_year,
                highschool_score: high_school_score,
                highschool_board: high_school_board,
            },
        });

        console.log(raw);

        let requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        Loader.open();
        const response = await fetch(
            "/api/v1/student/education",
            requestOptions
        );
        const data = await response.json();
        Loader.close();

        if (data.success) {
            window.location.reload();
        } else {
            document.getElementById(
                "highSchool-err-msg"
            ).innerHTML = `${data.message}`;
        }
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

// Update Diploma  Details
document
    .getElementById("edit-diploma-form")
    .addEventListener("submit", updateDiplomaForm);

async function updateDiplomaForm(e) {
    e.preventDefault();
    let diploma_year = document.getElementById("diploma_year").value;
    let diploma_score = document.getElementById("diploma_score").value;
    let diploma_board = document.getElementById("diploma_board").value;
    let isLateral = document.getElementById("is_lateral_entry").value;
    const diplomaUpdateBody =
        document.getElementById("diplomaUpdateBody").value;
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        let raw = JSON.stringify({
            is_lateral_entry: isLateral,
            update: diplomaUpdateBody,
            updateBody: {
                diploma_year: diploma_year,
                diploma_score: diploma_score,
                diploma_board: diploma_board,
            },
        });

        let requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };

        Loader.open();
        const response = await fetch(
            "/api/v1/student/education",
            requestOptions
        );
        const data = await response.json();
        Loader.close();

        if (data.success) {
            window.location.reload();
        } else {
            document.getElementById(
                "highSchool-err-msg"
            ).innerHTML = `${data.message}`;
        }
    } catch (error) {
        console.log("failed to fetch error", error);
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
        Loader.open();
        const response = await fetch("/api/v1/student/experience");
        const data = await response.json();
        Loader.close();
        const { experiences } = data;

        const experienceParent = document.getElementById(
            "experience-container"
        );
        experienceParent.innerHTML = "";

        if (data.success === true) {
            for (let experience of experiences) {
                let { jobProfile, company, startDate, endDate, _id } =
                    experience;
                startDate = startDate.split("T")[0];
       
                let html = `
          <div class="exp-info-text">
            <div class="prof-exp-item" id=${_id}>
                <div class="box-head-wrap">
                  <h2>${company}</h2>
                  <div>
                    <a href="#"  onclick="deleteItemFunc(event,'experience');" data-id=${_id}><i class="fa-solid fa-trash"></i></a>
                    <a href="#" onclick="openModalForm(event)" data-id="edit-exp-modal" style="margin-left:10px;"><i class="fa-regular fa-pen-to-square"></i></a>
                  </div>
                </div>
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
        } else {
            experienceParent.innerHTML = "<div>No Experience Found</div>";
        }
    } catch (error) {
        // console.log("failed to fetch error", error);
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
    console.log(placed_offer_letter);
    try {
        let formdata = new FormData();
        formdata.append("jobProfile", placed_job_profile);
        formdata.append("company", placed_company);
        formdata.append("location", placed_company_loc);
        formdata.append("package", placed_package);

        if (placed_offer_letter.length > 0) {
            formdata.append("offerLetter", placed_offer_letter[0]);
        }
        if (placed_joining_letter.length > 0) {
            formdata.append("joiningLetter", placed_joining_letter[0]);
        }
        if (placed_doj) {
            formdata.append("joiningDate", placed_doj);
        }
        let requestOptions = {
            method: "POST",
            body: formdata,
            redirect: "follow",
        };
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

// Edit Experience
function editExpItem(event,currData){
    event.preventDefault();
    console.log(currData)
}

// STUDENT Placement FETCH
async function fetchPlacement() {
    try {
        const response = await fetch("/api/v1/student/placement");
        const data = await response.json();

        const { placements } = data;

        const placementParent = document.getElementById("placement-container");
        placementParent.innerHTML = "";
        if (data.success === true) {
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

                if (joiningDate) {
                    joiningDate = joiningDate.split("T")[0];
                }

                let html = `
          <div class="exp-info-text">
            <div class="prof-exp-item">
              <h2>${company}</h2>
              <a href="#"  onclick="deleteItemFunc(event,'placement');" data-id=${_id}><i class="fa-solid fa-trash"></i></a>
         
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
                              <div><h3>Offer Letter:</h3><a href=${offerLetter} target='_blank'>Click to view offer letter</a></div>
                          </div>`;
                }
                if (joiningLetter) {
                    html += `<div class="exp-inner-wrap">
                              <div><h3>Joining Letter:</h3><a href=${joiningLetter} target='_blank'>Click to view joining letter</a></div>
                          </div>`;
                }

                html += `</div>
                </div>`;
                placementParent.innerHTML += html;
            }
        } else {
            placementParent.innerHTML += "<div>No Placement Found</div>";
        }
    } catch (error) {
        console.log("failed to fetch error", error);
    }
}

//Create Training
document
    .getElementById("create-training-form")
    .addEventListener("submit", createTraining);
async function createTraining(e) {
    e.preventDefault();
    const training_name = document.getElementById("training_name").value;
    const training_organisation = document.getElementById(
        "training_organisation"
    ).value;
    const training_start_date = document.getElementById(
        "training_start_date"
    ).value;
    const training_end_date =
        document.getElementById("training_end_date").value;

    // const end_date=document.getElementById('end_date').value;
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const raw = {
            trainingName: training_name,
            organisation: training_organisation,
            startDate: training_start_date,
            end_date: training_end_date,
        };
        // if (end_date) {
        //     raw["endDate"] = training_end_date;
        // }
        const requestOptions = {
            method: "POST",
            body: JSON.stringify(raw),
            headers: myHeaders,
            redirect: "follow",
        };

        Loader.open();
        const response = await fetch(
            "/api/v1/student/training",
            requestOptions
        );
        const data = await response.json();
        Loader.close();

        if (data.success) {
            window.location.reload();
        } else {
            document.getElementById(
                "training-error-msg"
            ).innerHTML = `${data.message}`;
        }
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

// STUDENT TRAINING FETCH
async function fetchTraining() {
    try {
        Loader.open();
        const response = await fetch("/api/v1/student/training");
        const data = await response.json();
        Loader.close();
        const { trainings } = data;

        const trainingParent = document.getElementById("training-container");

        trainingParent.innerHTML = "";
        // console.log(data)
        if (trainings.length > 0) {
            for (let training of trainings) {
                let { trainingName, organisation, startDate, endDate, _id } =
                    training;

                startDate = startDate.split("T")[0];

                let html = `
                <div class="exp-info-text">
                    <div class="prof-exp-item"}>
                    <a href="#" onclick="deleteItemFunc(event,'training');" data-id=${_id}><i class="fa-solid fa-trash"></i></a>
                  
                    <div class="exp-inner-wrap">
                        <div><h3>Training Name:</h3><span>${trainingName}</span></div>  
                    </div>  
                    <div class="exp-inner-wrap">
                        <div><h3>Training Organization:</h3><span>${organisation}</span></div>  
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
                trainingParent.innerHTML += html;
            }
        } else {
            trainingParent.innerHTML += "<div>No Traning Found</div>";
        }
    } catch (error) {
        console.log("failed to fetch error", error);
    }
}

// STUDENT AWARD FETCH
async function fetchAward() {
    try {
        const response = await fetch("/api/v1/student/award");
        const data = await response.json();

        const { awards } = data;

        const awardParent = document.getElementById("award-container");
        awardParent.innerHTML = "";
        if (awards.length > 0) {
            for (let award of awards) {
                let { awardName, organisation, description, _id } = award;

                let html = `
                <div class="exp-info-text">
                    <div class="prof-exp-item"}>
                    <a href="#"  onclick="deleteItemFunc(event,'award');" data-id=${_id}><i class="fa-solid fa-trash"></i></a>
                  
                        <div class="exp-inner-wrap">
                            <div><h3>Award Name:</h3><span>${awardName}</span></div>  
                        </div>  
                        <div class="exp-inner-wrap">
                            <div><h3>Award Organization:</h3><span>${organisation}</span></div>  
                        </div>    
                        <div class="exp-inner-wrap">
                            <div><h3>Award Description:</h3><span>${description}</span></div>
                        </div>
                    </div>
                </div>`;

                awardParent.innerHTML += html;
            }
        } else {
            awardParent.innerHTML += "<div>No Award Found</div>";
        }
    } catch (error) {
        console.log("failed to fetch error", error);
    }
}

//Create Award
document
    .getElementById("award-detail-form")
    .addEventListener("submit", createAward);
async function createAward(e) {
    e.preventDefault();
    const award_name = document.getElementById("award-name").value;
    const award_organisation =
        document.getElementById("award-organization").value;
    const award_description =
        document.getElementById("award-description").value;

    // const end_date=document.getElementById('end_date').value;
    try {
        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const raw = {
            awardName: award_name,
            organisation: award_organisation,
            description: award_description,
        };

        const requestOptions = {
            method: "POST",
            body: JSON.stringify(raw),
            headers: myHeaders,
            redirect: "follow",
        };

        Loader.open();
        const response = await fetch("/api/v1/student/award", requestOptions);
        const data = await response.json();
        Loader.close();

        if (data.success) {
            window.location.reload();
        } else {
            document.getElementById(
                "award-error-msg"
            ).innerHTML = `${data.message}`;
        }
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

//Delete Experience, Placement, training, award
async function deleteItemFunc(event, section) {
    event.preventDefault();
    const delItem = event.target.parentNode.dataset.id;
    const validSection = ["experience", "placement", "training", "award"];
    try {
        let requestOptions = {
            method: "DELETE",
            redirect: "follow",
        };

        Loader.open();
        let response;

        if (validSection.includes(section)) {
            response = await fetch(
                `/api/v1/student/${section}/${delItem}`,
                requestOptions
            );
        }
        const data = await response.json();
        Loader.close();

        if (response?.status == "200") {
            window.location.reload();
        }
    } catch (error) {
        // console.log("failed to fetch error", error);
    }
}

// LOGOUT
document.getElementById("logout").addEventListener("click", logoutFunc);
async function logoutFunc(e) {
    e.preventDefault();
    try {
        let requestOptions = {
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

// JAVASCRIPT CODE FOR OTHER FUNCTIONALITY THAN NON API CALLS
function openModalForm(event,currData){
    event.preventDefault();
    const openFormId=document.getElementById(`${event.target.parentNode.dataset.id}`);
    openFormId.style.display='block';
}
function closeModalForm(event){
    event.preventDefault();
    const closeFormId=document.getElementById(`${event.target.parentNode.dataset.id}`);
    closeFormId.style.display='none';
}


function editGradPoppup(e) {
    e.preventDefault();
    const editGradModal = document.getElementById("edit-grad-modal");
    editGradModal.style.display = "block";
}
function closeGradModal(e) {
    e.preventDefault();
    const editGradModal = document.getElementById("edit-grad-modal");
    editGradModal.style.display = "none";
}
function editDiplomaPoppup(e) {
    e.preventDefault();
    const editDiplomaModal = document.getElementById("edit-diploma-modal");
    editDiplomaModal.style.display = "block";
}
function closeDiplomaModal(e) {
    e.preventDefault();
    const editDiplomaModal = document.getElementById("edit-diploma-modal");
    editDiplomaModal.style.display = "none";
}
function editHighSchoolPoppup(e) {
    e.preventDefault();

    const editHighSchoolModal = document.getElementById(
        "edit-highSchool-modal"
    );
    editHighSchoolModal.style.display = "block";
}
function closeHighSchoolModal(e) {
    e.preventDefault();
    const editHighSchoolModal = document.getElementById(
        "edit-highSchool-modal"
    );
    editHighSchoolModal.style.display = "none";
}

const curr_working = document.getElementById("exp-curr-work");
curr_working.addEventListener("click", toggleEndDate);

function toggleEndDate() {
    if (curr_working.checked == true) {
        document.getElementById("exp_end_date").style.display = "none";
    } else {
        document.getElementById("exp_end_date").style.display = "block";
    }
}

// const training_curr_working = document.getElementById("training-curr-work");
// training_curr_working.addEventListener("click", toggleTrainEndDate);
// function toggleTrainEndDate() {
//     if (training_curr_working.checked == true) {
//         document.getElementById("training_end_date").style.display = "none";
//     } else {
//         document.getElementById("training_end_date").style.display = "block";
//     }
// }

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

//Create Training poppup
const createTrainingBtn = document.getElementById("create-training-btn");
const closeTrainingBtn = document.getElementById("close-training-modal");
createTrainingBtn.addEventListener("click", showTrainingModal);
closeTrainingBtn.addEventListener("click", hideTrainingModal);
function showTrainingModal(event) {
    event.preventDefault();
    document.getElementById("create-training-modal").style.display = "block";
}
function hideTrainingModal(event) {
    event.preventDefault();
    document.getElementById("create-training-modal").style.display = "none";
}

//Create Experience poppup
const createAwardBtn = document.getElementById("create-award-btn");
const closeAwardBtn = document.getElementById("close-award-modal");

createAwardBtn.addEventListener("click", showAwardModal);
closeAwardBtn.addEventListener("click", hideAwardModal);
function showAwardModal(event) {
    event.preventDefault();
    document.getElementById("create-award-modal").style.display = "block";
}
function hideAwardModal(event) {
    event.preventDefault();
    document.getElementById("create-award-modal").style.display = "none";
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
