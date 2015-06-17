/**
 * Created by vhchung on 1/20/15.
 */
(function ($) {
    $.fn.clickToggle = function (func1, func2) {
        var funcs = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(function () {
            var data = $(this).data();
            var tc = data.toggleclicked;
            $.proxy(funcs[tc], this)();
            data.toggleclicked = (tc + 1) % 2;
        });
        return this;
    };
    $('#searchicon').clickToggle(function () {
        $('#searchdiv').addClass('active');
        $('#s').focus();
        $('#s').val('');

    }, function () {
        $('#searchdiv').removeClass('active');
    });
    $('#trigger').clickToggle(function () {
        $('#global').addClass('open');
    }, function () {
        $('#global').removeClass('open');
    });
    $('li.menu-item-has-children').clickToggle(function () {
        $(this).find('ul').show('fast');
    }, function () {
        $(this).find('ul').hide('fast');
    });
//Check to see if the window is top if not then display button
    var isShow = false;
    var pos;
    $(window).scroll(function () {
        pos = $(this).scrollTop();
        if (pos > 100 && !isShow) {
            isShow = true;
            $('#scrolltop').fadeIn();
        } else if(pos < 101 && isShow) {
            isShow = false;
            $('#scrolltop').fadeOut();
        }
    });

//Click event to scroll to top
    $('#scrolltop').click(function () {
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });
}(jQuery));



