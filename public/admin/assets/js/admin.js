window.onload = function () {
    checkAlreadyLogged();
    fetchNotices();
};

function checkAlreadyLogged() {
    fetch("/api/v1/user/whoami/")
        .then((response) => response.json())
        .then((data) => {
            if (data?.user?.role === "student") {
                window.location.href = "/student/index.html";
            } else if (data?.user?.role !== "admin") {
                window.location.href = "/";
            }
            // console.log(JSON.stringify(data))
        })
        .catch((error) => {
            // console.log('error', error)
        });
}

//Notice Fetch
async function fetchNotices() {
    try {
        const response = await fetch("/api/v1/notice/");
        const dataItem = await response.json();

        const { notices } = dataItem;

        const noticesParent = document.getElementById("notices-disp-container");
        for (let notice in notices) {
            
            let {
                noticeTitle,
                noticeBody,
                noticeFile,
                receivingCourse,
                receivingBatches,
                receivingDepartments,
            } = notices[notice];
            let html = `
            <div class="exp-info-text">
                <div class="">
                  
                    <div class="exp-inner-wrap">
                        <div><h3>Notice Title:</h3><span>${noticeTitle}r</span></div>  
                    </div>    
                    <div class="exp-inner-wrap">
                        <div><h3>Notice Description:</h3><span>${noticeBody}</span></div>
                    </div>
                    <div class="exp-inner-wrap">
                        <div><h3>Notice File:</h3><a href=${noticeFile}>View Notice File</a></div>
                    </div>
                    
                    <div class="exp-inner-wrap">
                        <div><h3>To Course:</h3><span>${receivingCourse.courseName}</span></div>
                    </div>
                    <div class="exp-inner-wrap">
                        <div><h3>To Batch:</h3>
            `;
            
            for (let batch in receivingBatches){
                let {batchYear}=receivingBatches[batch]
                console.log(batchYear)
                html+=`
                    <span style="margin-right:5px;">${batchYear}</span>
                `
            }
            html+=`
                </div>
            </div>
            `;

            html+=`
                <div class="exp-inner-wrap">
                <div><h3>To Department:</h3>
            `
            for (let dept in receivingDepartments){
                let {departmentName}=receivingDepartments[dept]
                
                html+=`
                    <span style="margin-right:5px;">${departmentName}</span>
                `
            }
            html+=`
                        </div>
                     </div>
                </div>
            </div>
            `;

            noticesParent.innerHTML += html;
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
