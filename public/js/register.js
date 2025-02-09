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
        $("#toast-success").text("Kayıt işlemi başarılı!");
        const successToast = new bootstrap.Toast(
          document.getElementById("successToast")
        );
        successToast.show();
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
// $("#blog-form").on("submit", function (event) {
//   // Browser'a otomatik olarak herhangi bir veri göndermesini kısıtkadım.
//   // DİKKATTTTT : Bunu kapatmazsam csrf çalışmıyordu
//   event.preventDefault();

//   // Blog Form'da verileri almak için
//   const blogDataCreate = {
//     // Blog Form'da verileri almak için
//     header: $("#header").val(),
//     content: $("#content").val(),
//     author: $("#author").val(),
//     tags: $("#tags").val(),
//     _csrf: $("input[name='_csrf']").val(), // CSRF token'ı AJAX isteğine dahil ediyoruz
//   };

//   console.warn("sonuç:" + blogDataCreate._csrf); // csrf ekle

//   // Aldığım verileri kaydetmek (AJAX)
//   $.ajax({
//     url: "/blog",
//     method: "POST",
//     data: blogDataCreate,
//     success: function (data) {
//       // Ekledikten sonraki işlem için listeyi tazele
//       blogList();
//       // Formu temizlemek için
//       // 1.YOL
//       $("#blog-form")[0].reset();
//       // 2.YOL
//       //reset()
//     }, //end success
//     error: function (xhr, status, error) {
//       console.error("Blog Ekleme işlemi başarısız:", error); // Hata mesajını göster
//     },
//   }); //end submit ajax
// }); // end Blog Add submit

// $(document).ready(function () {
//   let isUpdating = false;
//   let updateId = null;
//   const maxChars = 2000; // Maksimum harf sayısı

//   // Hata mesajlarını temizleme fonksiyonu
//   const clearErrors = () => {
//     $(".error-message, .valid-message").remove();
//   };

//   // Hata mesajı ekleme fonksiyonu
//   const showError = (element, message) => {
//     $(element).next(".error-message, .valid-message").remove();
//     $(element).after(
//       `<small class="text-danger error-message">${message}</small>`
//     );
//   };

//   // Geçerli mesajı ekleme fonksiyonu
//   const showValid = (element, message) => {
//     $(element).next(".error-message, .valid-message").remove();
//     $(element).after(
//       `<small class="text-success valid-message">${message}</small>`
//     );
//   };

//   // İçerik harf sınırını kontrol etme fonksiyonu
//   const updateCharCount = () => {
//     const content = $("#content").val();
//     const charCount = content.length;
//     const remainingChars = maxChars - charCount;

//     $("#char-count").text(`Kalan Harf Sayısı: ${remainingChars}`);

//     if (remainingChars < 0) {
//       $("#char-count").removeClass("text-success").addClass("text-danger");
//       showError("#content", "İçerik 2000 harften fazla olamaz!");
//     } else {
//       $("#char-count").removeClass("text-danger").addClass("text-success");
//       $(".error-message").remove();
//     }
//   };

//   // Form doğrulama fonksiyonu
//   const validateForm = () => {
//     clearErrors();
//     let isValid = true;
//     const content = $("#content").val();
//     const charCount = content.length;

//     if ($("#header").val().trim() === "") {
//       showError("#header", "Başlık boş bırakılamaz!");
//       isValid = false;
//     } else {
//       showValid("#header", "Başlık geçerli.");
//     }

//     if (content.trim() === "") {
//       showError("#content", "İçerik boş bırakılamaz!");
//       isValid = false;
//     } else if (charCount > maxChars) {
//       showError("#content", "İçerik 2000 harften fazla olamaz!");
//       isValid = false;
//     } else {
//       showValid("#content", "İçerik geçerli.");
//     }

//     if ($("#author").val().trim() === "") {
//       showError("#author", "Yazar adı boş bırakılamaz!");
//       isValid = false;
//     } else {
//       showValid("#author", "Yazar adı geçerli.");
//     }

//     if ($("#tags").val().trim() === "") {
//       showError("#tags", "En az bir etiket eklemelisiniz!");
//       isValid = false;
//     } else {
//       showValid("#tags", "Etiket geçerli.");
//     }

//     return isValid;
//   };

//   // Kullanıcı içerik alanına yazdıkça harf sayısını güncelle
//   $("#content").on("input", function () {
//     updateCharCount();
//   });

//   // Kullanıcı input'a yazarken hataları kaldır ve geçerli mesaj ekle
//   $("#header, #author, #tags").on("input", function () {
//     const field = $(this);
//     if (field.val().trim() === "") {
//       showError(field, "Bu alan boş bırakılamaz!");
//     } else {
//       showValid(field, "Geçerli.");
//     }
//   });

//   // Formu sıfırlama fonksiyonu
//   const resetForm = () => {
//     $("#blog-form")[0].reset();
//     isUpdating = false;
//     updateId = null;
//     $("#submit-btn").text("Ekle");
//     clearErrors();
//     updateCharCount();
//   };

//   // Blog listesini getir
//   const fetchBlogList = () => {
//     $.ajax({
//       url: "/blog/register",
//       method: "GET",
//       success: function (data) {
//         const $tbody = $("#blog-table tbody").empty();
//         data.forEach((item) => {
//           $tbody.append(`
//                         <tr data-id="${item._id}">
//                             <td>${item._id}</td>
//                             <td>${item.header}</td>
//                             <td>${item.content}</td>
//                             <td>${item.author}</td>
//                             <td>${item.tags}</td>
//                             <td>${item.views}</td>
//                             <td>${item.status}</td>
//                             <td>${item.dateInformation}</td>
//                             <td>
//                                 <button class="btn btn-primary edit-btn"><i class="fa-solid fa-wrench"></i></button>
//                                 <button class="btn btn-danger delete-btn"><i class="fa-solid fa-trash"></i></button>
//                             </td>
//                         </tr>
//                     `);
//         });
//       },
//       error: handleError,
//     });
//   };

//   // Hata yönetimi fonksiyonu
//   const handleError = (xhr, status, error) => {
//     console.error("İşlem başarısız:", error);
//     alert("Beklenmeyen bir hata oluştu, lütfen tekrar deneyin.");
//   };

//   // Blog ekleme/güncelleme işlemi
//   $("#blog-form").on("submit", function (event) {
//     event.preventDefault();

//     // Form doğrulama
//     if (!validateForm()) {
//       return;
//     }

//     const blogData = {
//       header: $("#header").val(),
//       content: $("#content").val(),
//       author: $("#author").val(),
//       tags: $("#tags").val(),
//       _csrf: $("input[name='_csrf']").val(),
//     };

//     if (isUpdating && updateId) {
//       $.ajax({
//         url: `/blog/register/${updateId}`,
//         method: "PUT",
//         data: blogData,
//         success: function () {
//           fetchBlogList();
//           resetForm();
//         },
//         error: handleError,
//       });
//     } else {
//       $.ajax({
//         url: "/blog/register",
//         method: "POST",
//         data: blogData,
//         success: function () {
//           fetchBlogList();
//           resetForm();
//         },
//         error: handleError,
//       });
//     }
//   });

//   // Blog güncelleme işlemi
//   $("#blog-table tbody").on("click", ".edit-btn", function () {
//     const row = $(this).closest("tr");
//     const id = row.data("id");

//     $("#header").val(row.find("td:eq(1)").text());
//     $("#content").val(row.find("td:eq(2)").text());
//     $("#author").val(row.find("td:eq(3)").text());
//     $("#tags").val(row.find("td:eq(4)").text());

//     isUpdating = true;
//     updateId = id;
//     $("#submit-btn").text("Güncelle");
//   });

//   // Blog silme işlemi
//   $("#blog-table tbody").on("click", ".delete-btn", function () {
//     const id = $(this).closest("tr").data("id");

//     if (!confirm(`${id} nolu Blog'u Silmek İstiyor musunuz?`)) return;

//     $.ajax({
//       url: `/blog/register/${id}`,
//       method: "DELETE",
//       success: fetchBlogList,
//       error: handleError,
//     });
//   });

//   // Sayfa yüklendiğinde blog listesini getir
//   fetchBlogList();
//   updateCharCount(); // Başlangıçta harf sayacını güncelle
// });
