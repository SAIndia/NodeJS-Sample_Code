(function () {
    'use strict';

    var RESPONSE_MESSAGE_TIMER = 6000;
    var LOGIN_REDIRECT_TIMER = 1500;
    var loginResponseTimer = null;

    // Helper to flash a response message for login success and errors
    function showLoginResponse(message, alertType) {
        $(".login-response")
                .removeClass("alert-danger alert-warning alert-info alert-success");
        $(".login-response").html(message).addClass("alert-" + alertType).fadeIn();

        clearTimeout(loginResponseTimer);
        loginResponseTimer = setTimeout(function () {
            $(".login-response").fadeOut();
        }, RESPONSE_MESSAGE_TIMER);
    }

    $(document).on("submit", "#form-login", function (e) {
        e.preventDefault();
        var $form = $(this);
        $.ajax({
            type: "POST",
            url: "/fread/api/authenticate",
            data: {
                "username": $form.find("input[name=username]").val(),
                "password": $form.find("input[name=password]").val()
            },
            cache: false,
            success: function (user) {
                $form.find(".form-controls").hide();
                showLoginResponse("Login success, redirecting..", "success");
                alert('login sucess');
                setTimeout(function () {
                    window.location = "/fread";
                }, LOGIN_REDIRECT_TIMER);
            },
            error: function (jqXHR, status, errorThrown) {
                alert('login failed');
                if (jqXHR.status === 401) {
                    showLoginResponse("The username and password you entered don't match.", "warning")
                } else {
                    console.error(jqXHR);
                    showLoginResponse("Oops.. something went wrong. Please try again later. (" + jqXHR.status + ")", "danger");
                }
            }
        });

    });

}());