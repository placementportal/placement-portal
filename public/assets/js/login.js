+(function ($) {
    $(".palceholder").click(function () {
        $(this).siblings("input").focus();
    });

    $(".form-control").focus(function () {
        $(this).parent().addClass("focused");
    });

    $(".form-control").blur(function () {
        let $this = $(this);
        if ($this.val().length == 0) $(this).parent().removeClass("focused");
    });
    $(".form-control").blur();

    // validation
    $.validator.setDefaults({
        errorElement: "span",
        errorClass: "validate-tooltip",
    });

    $("#studentFormValidate").validate({
        rules: {
            rollNo: {
                required: true,
                minlength: 6,
            },
            dob: {
                required: true,
                minlength: 6,
            },
        },
        messages: {
            rollNo: {
                required: "Please enter your Roll No.",
                minlength: "Please provide valid Roll No.",
            },
            dob: {
                required: "Enter your password to Login.",
                minlength: "Incorrect login or password.",
            },
        },
    });

    $("#adminFormValidate").validate({
        rules: {
            email: {
                required: true,
                minlength: 6,
            },
            adminPassword: {
                required: true,
                minlength: 6,
            },
        },
        messages: {
            email: {
                required: "Please enter your email",
                minlength: "Please provide valid email",
            },
            adminPassword: {
                required: "Enter your password to Login.",
                minlength: "Incorrect login or password.",
            },
        },
    });
})(jQuery);

window.onload = function () {
    checkAlreadyLogged();
};

function checkAlreadyLogged() {
    fetch("/api/v1/user/whoami/")
        .then((response) => response.json())
        .then((data) => {
            if (data?.user?.role === "student") {
                window.location.href = "/student/index.html";
            } else if (data?.user?.role === "admin") {
                window.location.href = "/admin/index.html";
            }
            // console.log(JSON.stringify(data))
        })
        .catch((error) => {
            // console.log('error', error)
        });
}

const stuForm = document.getElementById("studentFormValidate");
stuForm.addEventListener("submit", studentLogin);

const adminForm = document.getElementById("adminFormValidate");
adminForm.addEventListener("submit", adminLogin);

function studentLogin(event) {
    event.preventDefault();

    let roll_no = document.getElementById("rollNo").value;
    let dob = document.getElementById("dob").value;

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
        roll_no: roll_no,
        password: dob,
    });

    let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    fetch("/api/v1/auth/login/student", requestOptions)
        .then((response) => {
            response.text();
            if (response.status === 200) {
                window.location.href = `/student/`;
            } else {
                Toastify({
                    text: "Wrong Credentials! Please enter details correctly",
                    duration: 3000,
                    style: {
                        background: "#cc0000",
                    },
                }).showToast();
            }
        })
        .catch((error) => {
            // console.log('error', error)
        });
}

function adminLogin(event) {
    event.preventDefault();

    let email = document.getElementById("email").value;
    let adminPassword = document.getElementById("adminPassword").value;

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
        email: email,
        password: adminPassword,
    });

    let requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    fetch("/api/v1/auth/login/admin", requestOptions)
        .then((response) => {
            response.text();
            if (response.status === 200) {
                window.location.href = `/admin/`;
            } else {
                Toastify({
                    text: "Wrong Credentials! Please enter details correctly",
                    duration: 3000,
                    style: {
                        background: "#cc0000",
                    },
                }).showToast();
            }
        })
        .catch((error) => {
            // console.log('error', error)
        });
}
