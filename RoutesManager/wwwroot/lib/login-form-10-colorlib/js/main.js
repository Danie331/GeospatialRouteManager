
(function ($) {
    "use strict";


    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').submit(function () {
        var check = true;
        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        if (check) {
            $("body").css("cursor", "progress");
            $.ajax({
                type: 'POST',
                url: app.LOGIN_URL,
                data: $(this).serialize()
            }).done((result) => {
                $("body").css("cursor", "default");
                localStorage.setItem('access-token', result.Token);
                localStorage.setItem('default-map', result.DefaultMapProvider);
                localStorage.setItem('user-id', result.UserId);
                localStorage.setItem('user-friendly-name', result.FriendlyName);
                window.location = app.DEFAULT_PAGE;
            }).fail(function (jqXHR, textStatus, error) {
                $("body").css("cursor", "default");
                if (error === "Unauthorized") {
                    console.log("Unauthorized");
                    localStorage.setItem('access-token', '');
                    $(".login-error").show();
                } else {
                    console.log(error);
                }
            });
        }
        return false;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);