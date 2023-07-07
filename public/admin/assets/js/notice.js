    window.onload = function () {
        checkAlreadyLogged();
        getCourseDetails();
        
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

    //NOTICE CREATE
    document.getElementById('notice-main-form').addEventListener('submit',createNoticeFunction);


    async function createNoticeFunction(e){
        e.preventDefault();
        const courseSelectId = document.getElementById("course_name_select").value;
        const  notice_title = document.getElementById("notice-title").value;
        const  notice_desc = document.getElementById("notice-description").value;
        const  notice_file = document.getElementById("notice-file").files;
        let batchItems=[]
        document.querySelectorAll('.batch-checked').forEach(function(elem) {
            if(elem.checked){
                batchItems.push(elem.value)
            }
        });
        let deptItems=[]
        document.querySelectorAll('.dept-checked').forEach(function(elem) {
            if(elem.checked){
                deptItems.push(elem.value)
            }
        });

        const strBatch=JSON.stringify(batchItems)
        const strDept=JSON.stringify(deptItems)

        try {
            // let myHeaders = new Headers();
            // myHeaders.append("Content-Type", "application/json");
    
            let formdata = new FormData();
            formdata.append("noticeTitle", notice_title);
            formdata.append("noticeBody", notice_desc);
            formdata.append("noticeFile", notice_file[0]);
            formdata.append("receivingCourse", courseSelectId);
            formdata.append("receivingBatches", strBatch);
            formdata.append("receivingDepartments", strDept);

            var requestOptions = {
                method: 'POST',
                // headers: myHeaders,
                body: formdata,
                redirect: 'follow'
            };

            Loader.open();
            const response = await fetch(
                "/api/v1/notice/", requestOptions
            );
            const data = await response.json();
            Loader.close();

            if (data.success) {
                window.location.reload();
                console.log(data)
            } else {
                // document.getElementById(
                //     "exp-error-msg"
                // ).innerHTML = `${data.message}`;
            }
        } catch (error) {
            console.log("failed to fetch error", error);
        }
    }




    async function getCourseDetails() {
        try {
            const response = await fetch("/api/v1/batchDept/course");
            const data = await response.json();

            const { id } = data;

            const courseSelectParent =
                document.getElementById("course_name_select");
            
            for (let item of id) {
                let { courseName, batches, departments, _id } = item;

                let html = `
                <option value=${_id}>${courseName}</option>
            `;

                courseSelectParent.innerHTML += html;
            }
        } catch (error) {
            console.log("failed to fetch error", error);
        }
    }

    async function getBatchDetails() {
        const checkSelectedCourse =
            document.getElementById("course_name_select").value;
        if (checkSelectedCourse) {
            const selectedCourse = document.getElementById("course_name_select");
            const selectedCourseId = selectedCourse.value;
            
            try {
            
                const response = await fetch(`/api/v1/batchDept/batch?courseId=${selectedCourseId}`);
                const data = await response.json();
            
                const { batches } = data;


                const batchOptionElement =
                    document.getElementById("batch-option-wrapper");
                batchOptionElement.innerHTML="";
                if(batches.length==0){
                    batchOptionElement.innerHTML="no batch found";
                }
                for (let batch of batches) {
                    let { _id, batchYear } = batch;

                    let html = `
                    <input type="checkbox" class="batch-checked" name="batch_name" value=${_id}>
                    <label for=${batchYear}>${batchYear}</label><br>
                `;

                batchOptionElement.innerHTML += html;
                }
            } catch (error) {
                console.log("failed to fetch error", error);
            }
        }
    }

    async function getDepartmentDetails() {
        const checkSelectedCourse =
            document.getElementById("course_name_select").value;
        if (checkSelectedCourse) {
            const selectedCourse = document.getElementById("course_name_select");
            const selectedCourseId = selectedCourse.value;
            
            try {
        
                const response = await fetch(`/api/v1/batchDept/dept?courseId=${selectedCourseId}`);
                const data = await response.json();
                const { departments } = data;

                const deptOptionElement =
                    document.getElementById("dept-option-wrapper");
                deptOptionElement.innerHTML=""
                if(departments.length==0){
                    deptOptionElement.innerHTML="no department found";
                }
                for (let department of departments) {
                    let { _id, departmentName } = department;

                    let html = `
                    <input type="checkbox" class="dept-checked" name="dept_name" value=${_id}>
                    <label for="">${departmentName}</label><br>
                `;

                deptOptionElement.innerHTML += html;
                }
            } catch (error) {
                console.log("failed to fetch error", error);
            }
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


    document.getElementById('course_name_select').addEventListener('change', function(){
        getBatchDetails();
        getDepartmentDetails();
    });

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
