function validatePassword() {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorDiv = document.getElementById("passwordError");

  if (password !== confirmPassword) {
    errorDiv.style.display = "block";
    return false;
  } else {
    errorDiv.style.display = "none";
    return true;
  }
}

$(document).ready(function () {
  let isUpdating = false;
  let updateId = null;

  // Formu Temizleme Functionu
  const reset = () => {
    // Formu temizlemek için
    $("#register-form")[0].reset();
  };

  $("#register-form").on("submit", (e) => {
    e.preventDefault();
    const userData = {
      username: $("#username").val(),
      email: $("#email").val(),
      password: $("#password").val(),
      passwordConfirm: $("#confirmPassword").val(),
      _csrf: $("input[name='_csrf']").val(),
    };
    $.ajax({
      url: "/api/v1/users/register",
      method: "POST",
      data: userData,
      success: function (data) {
        reset();
        $("#toast-success").text(
          "Kayıt işlemi başarılı. Giriş ekranına yönlendiriliyorsunuz!"
        );
        const successToast = new bootstrap.Toast(
          document.getElementById("successToast")
        );
        successToast.show();
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      },
      error: function (xhr, status, error) {
        const errorMessage = xhr.responseJSON
          ? xhr.responseJSON.message
          : "Bilinmeyen bir hata oluştu.";

        $("#toast-error").text(errorMessage);
        const errorToast = new bootstrap.Toast(
          document.getElementById("errorToast")
        );
        errorToast.show();
      },
    });
  });
});
