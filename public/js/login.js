$(document).ready(function () {
  const reset = () => {
    $("#login-form")[0].reset();
  };

  $("#login-form").on("submit", (e) => {
    e.preventDefault();
    const userData = {
      username: $("#username").val(),
      password: $("#password").val(),
      _csrf: $("input[name='_csrf']").val(),
    };
    $.ajax({
      url: "/api/v1/users/login",
      method: "POST",
      data: userData,
      success: function (data) {
        reset();
        $("#toast-success").text(
          "Giriş işlemi başarılı! Blog sayfasına yönlendiriliyorsunuz."
        );
        const successToast = new bootstrap.Toast(
          document.getElementById("successToast")
        );
        successToast.show();

        setTimeout(() => {
          window.location.href = "/blog";
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
