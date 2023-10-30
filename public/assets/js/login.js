+(function ($) {
  $('.palceholder').click(function () {
    $(this).siblings('input').focus();
  });

  $('.form-control').focus(function () {
    $(this).parent().addClass('focused');
  });

  $('.form-control').blur(function () {
    let $this = $(this);
    if ($this.val().length == 0) $(this).parent().removeClass('focused');
  });
  $('.form-control').blur();

  // validation
  $.validator.setDefaults({
    errorElement: 'span',
    errorClass: 'validate-tooltip',
  });

  $('#login-form').validate({
    rules: {
      email: {
        required: true,
      },
      password: {
        required: true,
      },
    },
    messages: {
      rollNo: {
        required: 'Email is required!',
      },
      dob: {
        required: 'Enter your password to Login.',
      },
    },
  });
})(jQuery);

window.onload = function () {
  checkAlreadyLogged();
};

function checkAlreadyLogged() {
  fetch('/api/v1/user/whoami/')
    .then((response) => response.json())
    .then((data) => {
      if (data?.user?.role === 'student') {
        window.location.href = '/student/index.html';
      } else if (data?.user?.role === 'admin') {
        window.location.href = '/admin/index.html';
      }
      // console.log(JSON.stringify(data))
    })
    .catch((error) => {
      // console.log('error', error)
    });
}

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const entries = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(entries),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw Error('Login failed!');
    const { role } = await response.json();
    if (role == 'admin') window.location.href = './admin/';
    else if (role == 'student') window.location.href = './student/';
  } catch (error) {
    Toastify({
      text: 'Wrong Credentials! Please enter details correctly',
      duration: 3000,
      style: {
        background: '#cc0000',
      },
    }).showToast();
  }
});
