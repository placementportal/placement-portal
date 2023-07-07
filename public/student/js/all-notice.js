window.onload = async function () {
    checkAlreadyLogged();
    await fetchNotices();
};
function checkAlreadyLogged() {
    fetch("/api/v1/user/whoami/")
        .then((response) => response.json())
        .then((data) => {
            if (data?.user?.role === "admin") {
                window.location.href = "/admin/";
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

//Notice Fetch
async function fetchNotices() {
    try {
        Loader.open();
        const response = await fetch("/api/v1/notice/student");
        Loader.close();
        const dataItem = await response.json();
        const { notices } = dataItem;
        
        function dateFormat(item){
            //create a new date object
            const date = new Date(item);

            //get the date and time string in local format
            const dateTimeString = date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
            });

            
            //display the date and time string
            return dateTimeString;
        }
        dateFormat(notices[0].createdAt)

        const noticesParent = document.getElementById("notices-disp-container");
        for (let notice in notices) {
            
            let {
                noticeTitle,
                noticeBody,
                noticeFile,
                createdAt
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
                        <div><h3>Created At:</h3><span>${dateFormat(createdAt)}</span></div>
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


