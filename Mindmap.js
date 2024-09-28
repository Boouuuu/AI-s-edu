$(document).ready(function() {
    $('body').fadeIn("slow");
  });
  
  
  $('#lastpage').on('click', function(e) {
    e.preventDefault(); // 防止默认的立即跳转
    $('body').fadeOut('slow', function() {
        // 淡出完成后进行页面跳转
        window.location.href = "wordcloud.html";
    });
  });