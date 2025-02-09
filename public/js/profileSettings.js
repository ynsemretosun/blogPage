cript >
  $(document).ready(function () {
    $.ajax({
      url: "api/v1/users/getMe",
      type: "GET",
      success: function (response) {
        $("#username").val(response.data.username);
        $("#email").val(response.data.email);
      },
      error: function (xhr, status, error) {
        $("#message").html(
          '<div class="alert alert-danger">' + xhr.responseText + "</div>"
        );
      },
    });

    $("#passwordForm").submit(function (e) {
      e.preventDefault();
      const currentPassword = $("#currentPassword").val();
      const newPassword = $("#newPassword").val();
      const confirmPassword = $("#confirmPassword").val();
      $.ajax({
        url: "api/v1/users/updateMyPassword",
        type: "PATCH",
        data: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
        success: function (response) {
          $("#message").html(
            '<div class="alert alert-success">' + response + "</div>"
          );
        },
        error: function (xhr, status, error) {
          $("#message").html(
            '<div class="alert alert-danger">' + xhr.responseText + "</div>"
          );
        },
      });
    });

    $("#profileForm").submit(function (e) {
      e.preventDefault();
      const username = $("#username").val();
      const email = $("#email").val();
      $.ajax({
        url: "api/v1/users/updateMe",
        type: "PUT",
        data: JSON.stringify({ username, email }),
        success: function (response) {},
        error: function (xhr, status, error) {},
      });
    });
  });
