var mobileSidebar = $('#mobile-sidebar');
var triggerMenu = $('#trigger-menu');
var mainContent = $('#main-content');
var searchIcon = $('#search-icon');
var searchForm = $('#search-form');

$(function () {
    // Init highlight js
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    // Init Search form
    initSearchIconEvent();

    // Show, hide mobile sidebar
    triggerMenu.click(function() {
        mobileSidebar.css('visibility', 'visible');
        mobileSidebar.toggleClass('show-sidebar');
        triggerMenu.toggleClass('show-sidebar');
        mainContent.toggleClass('open-sidebar');
    });

    // Show, hide go top button
    $(window).scroll(function() {
        if($(this).scrollTop() != 0) {
            $('#scroll-top').fadeIn();
        } else {
            $('#scroll-top').fadeOut();
        }
    });
    $('#scroll-top').click(function() {
        $('body,html').animate({scrollTop:0},600);
    });

    $(window).resize(function(){
        // Reset mobile sidebar
        mobileSidebar.css('visibility', 'hidden');
        mobileSidebar.removeClass('show-sidebar');
        triggerMenu.removeClass('show-sidebar');
        mainContent.removeClass('open-sidebar');

        // Reset search form
        initSearchIconEvent();
    });
});

function initSearchIconEvent(){
    if($('.main-navigation-wrapper').height() > 1) {
        searchForm.addClass('active');

        searchIcon.off('click');
        searchIcon.on('click', function(){
            $('#frm-search').submit();
        });
    }else{
        searchForm.removeClass('active');

        searchIcon.off('click');
        searchIcon.on('click', function(){
            searchForm.toggleClass('active');
        });
    }
}

function expandSubMenu(){
    var subMenu = $('#mobile-sidebar').find('.sub-menu');
    var caret = subMenu.prev('a').children('i');
    subMenu.toggleClass('expand');
    if(subMenu.hasClass('expand')){
        caret.removeClass('fa-plus').addClass('fa-minus');
        subMenu.slideDown('fast');
    }else{
        caret.removeClass('fa-minus').addClass('fa-plus');
        subMenu.slideUp('fast');
    }
}