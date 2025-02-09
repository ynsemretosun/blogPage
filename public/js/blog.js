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
//       url: "/api/v1/blog",
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
//         url: `/api/v1/blog/${updateId}`,
//         method: "PUT",
//         data: blogData,
//         success: function () {
//           fetchBlogList();
//           resetForm();
//         },
//         error: function (xhr, status, error) {
//           const errorMessage = xhr.responseJSON
//             ? xhr.responseJSON.message
//             : "Bilinmeyen bir hata oluştu.";

//           $("#toast-error-blog").text(errorMessage);
//           const errorToast = new bootstrap.Toast(
//             document.getElementById("errorToast")
//           );
//           errorToast.show();
//         },
//       });
//     } else {
//       $.ajax({
//         url: "/api/v1/blog/",
//         method: "POST",
//         data: blogData,
//         success: function () {
//           fetchBlogList();
//           resetForm();
//           $("#toast-success-blog").text("Blog başarıyla eklendi!.");
//           const successToast = new bootstrap.Toast(
//             document.getElementById("successToast")
//           );
//           successToast.show();
//         },
//         error: function (xhr, status, error) {
//           const errorMessage = xhr.responseJSON
//             ? xhr.responseJSON.message
//             : "Bilinmeyen bir hata oluştu.";

//           $("#toast-error-blog").text(errorMessage);
//           const errorToast = new bootstrap.Toast(
//             document.getElementById("errorToast")
//           );
//           errorToast.show();
//         },
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
//       url: `/api/v1/blog/${id}`,
//       method: "DELETE",
//       success: fetchBlogList,
//       error: handleError,
//     });
//   });

//   // Sayfa yüklendiğinde blog listesini getir
//   fetchBlogList();
//   updateCharCount(); // Başlangıçta harf sayacını güncelle
// });

function getRandomColor() {
  const colors = [
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "dark",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

$(document).ready(function () {
  let isUpdating = false;
  let updateId = null;
  const maxChars = 2000; // Maksimum harf sayısı

  $.ajax({
    url: "/api/v1/blog",
    type: "GET",
    success: function (data) {
      data.data.blogs.forEach(function (blog) {
        let tagsHTML = "";
        if (blog.tags && blog.tags.length > 0) {
          tagsHTML = blog.tags.map(
            (tag) => `
    <span class="badge bg-${getRandomColor()} me-1">${tag}</span>
  `
          );
        }

        let blogCard = `
  <div class="col-md-4 mb-4" id="card_body">
    <div class="card blog-card shadow-sm rounded-3">
      <img src="${blog.imageUrl || "/default-image.jpg"}" 
           alt="${blog.header} görseli" 
           class="card-img-top" 
           style="height: 200px; object-fit: cover;" />
      <div class="card-body">
        <h5 class="card-title text-center h4 text-uppercase">${blog.header}</h5>
        <p class="card-text line-clamp8">
          ${blog.content ? blog.content.substring(0, 200) : "İçerik bulunamadı."}...
        </p>
        <div class="mb-2">${tagsHTML}</div> 
        <p class="text-muted small">Yazar: ${blog.author || "Bilinmiyor"}</p>
        <p class="text-muted small">Görüntülenme: ${blog.views || 0}</p>
        <p class="text-muted small">| Tarih: ${new Date(
          blog.createdAt
        ).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}</p>
        <a href="/blog/${blog.id}" class="btn btn-primary w-100">Daha Fazla</a>
      </div>
    </div>
  </div>
`;
        $("#blog-posts-container").append(blogCard);
      });
    },
    error: function (xhr, status, error) {
      console.error("Error fetching blog posts:", error);
    },
  });

  // İçerik harf sınırını kontrol etme fonksiyonu

  const fetchBlogList = () => {
    $.ajax({
      url: "/api/v1/blog/protected",
      method: "GET",
      success: function (data) {
        const $tbody = $("#blog-table tbody").empty();
        data?.data?.blogs.forEach((item) => {
          $tbody.append(`
            <tr data-id="${item._id}">
              <td>${item._id}</td>
              <td>${item.header}</td>
              <td>${item.content}</td>
              <td>${item.author}</td>
              <td>${item.tags}</td>
              <td>${item.views}</td>
              <td>${item.status}</td>
              <td>${item.dateInformation}</td>
              <td>
                <button class="btn btn-primary edit-btn" data-bs-toggle="modal" data-bs-target="#editModal">
                  <i class="fa-solid fa-wrench"></i>
                </button>
                <button class="btn btn-danger delete-btn">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          `);
        });
      },
      error: function (xhr, status, error) {
        console.log(xhr.responseJSON);
        const errorMessage = xhr.responseJSON
          ? xhr.responseJSON.message
          : "Bilinmeyen bir hata oluştu.";

        $("#toast-error-blog").text(errorMessage);
        const errorToast = new bootstrap.Toast(
          document.getElementById("errorToast")
        );
        errorToast.show();
      },
    });
  };

  // Hata yönetimi fonksiyonu
  const handleError = (xhr, status, error) => {
    console.error("İşlem başarısız:", error);
    alert("Beklenmeyen bir hata oluştu, lütfen tekrar deneyin.");
  };

  // Blog güncelleme işlemi için modal açma
  $("#blog-table tbody").on("click", ".edit-btn", function () {
    const row = $(this).closest("tr");
    updateId = row.data("id");

    // Modal form alanlarını doldur
    $("#modal-header").val(row.find("td:eq(1)").text());
    $("#modal-content").val(row.find("td:eq(2)").text());
    $("#modal-author").val(row.find("td:eq(3)").text());
    $("#modal-tags").val(row.find("td:eq(4)").text());

    isUpdating = true;
  });

  // Blog ekleme işlemi
  $("#blog-form").on("submit", function (event) {
    event.preventDefault();

    const blogData = {
      header: $("#header").val(),
      content: $("#content").val(),
      imageUrl: $("#imageUrl").val(),
      tags: $("#tags").val(),
      _csrf: $("input[name='_csrf']").val(), // CSRF koruması için token
    };

    // AJAX ile POST isteği gönder
    $.ajax({
      url: "/api/v1/blog", // API endpoint
      method: "POST",
      data: blogData,
      success: function () {
        fetchBlogList();
        $("#addModal").modal("hide");
        $("#blog-form")[0].reset();

        $("#toast-success-blog").text("Blog başarıyla eklendi!");
        const successToast = new bootstrap.Toast(
          document.getElementById("successToast")
        );
        successToast.show();
      },
      error: function (xhr, status, error) {
        const errorMessage = xhr.responseJSON
          ? xhr.responseJSON.message
          : "Bilinmeyen bir hata oluştu.";

        $("#toast-error-blog").text(errorMessage);
        const errorToast = new bootstrap.Toast(
          document.getElementById("errorToast")
        );
        errorToast.show();
      },
    });
  });

  $("#modal-form").on("submit", function (event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const blogData = {
      header: $("#modal-header").val(),
      content: $("#modal-content").val(),
      author: $("#modal-author").val(),
      tags: $("#modal-tags").val(),
      _csrf: $("input[name='_csrf']").val(),
    };

    if (isUpdating && updateId) {
      $.ajax({
        url: `/api/v1/blog/${updateId}`,
        method: "PUT",
        data: blogData,
        success: function () {
          fetchBlogList();
          $("#editModal").modal("hide");
          $("#toast-success-blog").text("Blog başarıyla güncellendi!");
          const successToast = new bootstrap.Toast(
            document.getElementById("successToast")
          );
          successToast.show();
        },
        error: function (xhr, status, error) {
          const errorMessage = xhr.responseJSON
            ? xhr.responseJSON.message
            : "Bilinmeyen bir hata oluştu.";

          $("#toast-error-blog").text(errorMessage);
          const errorToast = new bootstrap.Toast(
            document.getElementById("errorToast")
          );
          errorToast.show();
        },
      });
    } else {
      $.ajax({
        url: "/api/v1/blog",
        method: "POST",
        data: blogData,
        success: function () {
          fetchBlogList();
          $("#editModal").modal("hide");
        },
        error: function (xhr, status, error) {
          const errorMessage = xhr.responseJSON
            ? xhr.responseJSON.message
            : "Bilinmeyen bir hata oluştu.";

          $("#toast-error-blog").text(errorMessage);
          const errorToast = new bootstrap.Toast(
            document.getElementById("errorToast")
          );
          errorToast.show();
        },
      });
    }
  });

  $("#logoutBtn").on("click", function () {
    $.ajax({
      url: "/api/v1/users/logout",
      method: "GET",
      success: function () {
        $("#toast-success-blog").text(
          "Çıkış işlemi başarılı! Anasayfaya yönlendiriliyorsunuz."
        );
        const successToast = new bootstrap.Toast(
          document.getElementById("successToast")
        );
        successToast.show();

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      },
      error: function (xhr, status, error) {
        const errorMessage = xhr.responseJSON
          ? xhr.responseJSON.message
          : "Bilinmeyen bir hata oluştu.";

        $("#toast-error-blog").text(errorMessage);
        const errorToast = new bootstrap.Toast(
          document.getElementById("errorToast")
        );
        errorToast.show();
      },
    });
  });

  // Blog silme işlemi
  $("#blog-table tbody").on("click", ".delete-btn", function () {
    const id = $(this).closest("tr").data("id");

    if (!confirm(`${id} nolu Blog'u Silmek İstiyor musunuz?`)) return;

    $.ajax({
      url: `/api/v1/blog/${id}`,
      method: "DELETE",
      success: () => {
        fetchBlogList();
        $("#toast-success-blog").text("Blog başarıyla silindi!");
        const successToast = new bootstrap.Toast(
          document.getElementById("successToast")
        );
        successToast.show();
      },
      error: function (xhr, status, error) {
        const errorMessage = xhr.responseJSON
          ? xhr.responseJSON.message
          : "Bilinmeyen bir hata oluştu.";

        $("#toast-error-blog").text(errorMessage);
        const errorToast = new bootstrap.Toast(
          document.getElementById("errorToast")
        );
        errorToast.show();
      },
    });
  });

  // Sayfa yüklendiğinde blog listesini getir
  fetchBlogList();
  // Başlangıçta harf sayacını güncelle
});
