var maximize_button = '<div class="maximize-toolbar">' +
    '<a href="javascript:void(0)" title="Maximize" onclick="maximizeEditor(this)">' +
    '<i class="fa fa-arrows-alt"></i></a></div>';
var minimize_button = '<div class="minimize-toolbar">' +
    '<a href="javascript:void(0)" title="Save" onclick="minimizeEditor(this)">' +
    '<i class="fa fa-save"></i></a></div>';

$(function () {
    // Init tooltip for widget description
    $('.information').tooltip();

    // Init code mirror by class 'arr-codemirror'
    var textarea = document.getElementsByClassName('arr-codemirror');
    if (textarea.length > 0) {
        for (var i = 0; i < textarea.length; i++) {
            if (textarea[i] != null) {
                var input = textarea[i];
                var editor = CodeMirror.fromTextArea(textarea[i]);
                $(textarea[i]).after(maximize_button);

                editor.on('change', function (cm, obj) {
                    cm.save();
                });
            }
        }
    }

    // Collapse all widgets after init code mirror to prevent cursor height bug
    $('.sidebar-list').find('div.widget-item')
        .next('a').removeClass('fa-caret-down').addClass('fa-caret-left')
        .next('div.box').removeClass('open').addClass('close');

    $("#widgets li").draggable({
        appendTo: "body",
        helper: "clone",
        start: function (event, ui) {
            $(ui.helper).width($(this).width());
        }
    });

    $(".sidebar-widget").droppable({
        activeClass: "ui-state-default",
        hoverClass: "widget-state-hover",
        accept: ":not(.ui-sortable-helper)",
        drop: function (event, ui) {
            $(this).find(".placeholder").remove();
            var li = $("<li style='position: relative' id=''></li>");
            li.append("<div class='widget-item'></div>");
            li.append('<a href="#" class="fa fa-caret-down expand_arrow" onclick="return showDetail(this);"></a>');
            li.find(".widget-item").first().text(ui.draggable.text());
            var ul = $(this);

            $.ajax({
                url: '/admin/widgets/sidebars/add/' + ui.draggable.attr('data-alias')
            }).done(function (re) {
                var new_box = $("<div class='box box-solid open'><div class='box-body'></div></div>");
                new_box.find(".box-body").first().append(re);
                new_box.find("form").first().append("<input type='hidden' name='sidebar' value='" + ul.parents('.box').first().attr('id') + "'>");
                new_box.find("form").first().append("<input type='hidden' name='ordering' value='" + (ul.find("li").length + 1) + "'>");
                li.append(new_box);
                ul.append(li);

                // Init code mirror by class 'arr-codemirror' after drop
                var textarea = $(li)[0].getElementsByClassName('arr-codemirror');
                if (textarea.length > 0) {
                    for (var i = 0; i < textarea.length; i++) {
                        if (textarea[i] != null) {
                            var editor = CodeMirror.fromTextArea(textarea[i]);
                            $(textarea[i]).after(maximize_button);

                            editor.on('change', function (cm, obj) {
                                cm.save();
                            });
                        }
                    }
                }
            });
        }
    }).sortable({
        handle: ".widget-item",
        delay: 100,
        items: "li",
        placeholder: "placeholder",
        start: function (event, ui) {
            // Close open widget in sidebar
            var arrow = $(ui.item).children('a.expand_arrow');
            var box = $(ui.item).children('div.box');
            if (arrow.hasClass('fa-caret-down')) {
                arrow.removeClass('fa-caret-down').addClass('fa-caret-left');
            }
            if (box.hasClass('open')) {
                box.removeClass('open').addClass('close');
            }
        },
        sort: function () {
            $(this).removeClass("ui-state-default");
        },
        connectWith: ".sidebar-widget",
        receive: function (event, ui) {
            $(this).find(".placeholder").remove();
            var ids = $(this).sortable('toArray');
            sorting(this, ids);
        },
        remove: function (event, ui) {
            if ($(this).find('.widget-item').length == 0 && $(this).find('.placeholder').length == 0) {
                $(this).find("ul").append("<li class='placeholder'>Drop widget here</li>");
            }
        },
        stop: function (event, ui) {
            var ids = $(this).sortable('toArray');
            sorting(this, ids);
        }
    });
});

function maximizeEditor(button) {
    var editor = $(button).parent('.maximize-toolbar').next();
    editor.css({
        'position': 'fixed',
        'width': '100%',
        'height': '100%',
        'top': '0',
        'left': '0',
        'z-index': '9999'
    });

    editor.children().first().before(minimize_button);
}

function minimizeEditor(button) {
    // Minimize the editor
    var editor = $(button).parent().parent('.CodeMirror');
    editor.css({
        'position': 'relative',
        'width': '',
        'height': '',
        'top': '',
        'left': '',
        'z-index': ''
    });

    // Remove minimize button
    $(button).parent('.minimize-toolbar').remove();

    // Save the editor and current widget
    editor.parents('form').first().find('.arr-btn-submit').first().trigger('click');
}

function showDetail(element, changeIcon) {
    var box = $(element).parents("li").first().find('.box').first();

    if (box.hasClass('open')) {
        box.removeClass('open');
        box.addClass('close');
        if (changeIcon == undefined) {
            $(element).removeClass('fa-caret-down');
            $(element).addClass('fa-caret-left');
        }
        else {
            var el = $(element).parents('li').first().find('a').first();
            $(el).removeClass('fa-caret-down');
            $(el).addClass('fa-caret-left');
        }

    }
    else {
        box.removeClass('close');
        box.addClass('open');
        if (changeIcon == undefined) {
            $(element).removeClass('fa-caret-left');
            $(element).addClass('fa-caret-down');
        }
    }

    return false;
}

function saveWidget(button) {
    var form = $(button).parents('form').first();
    var box = $(button).parents('.box').first();

    showBlock(box);

    $.ajax({
        type: "POST",
        url: '/admin/widgets/sidebars/save',
        data: form.serialize()
    }).done(function (id) {
        form.find('input[name="id"]').val(id);
        form.find('input[name="ordering"]').remove();
        removeBlock(box);
        return false;
    });

    return false;
}

function removeWidget(button) {
    var id = $(button).parents('form').find('input[name="id"]').val();
    var box = $(button).parents('.box').first();

    if (id != '') {
        showBlock(box);

        $.ajax({
            url: '/admin/widgets/sidebars/' + id,
            type: "DELETE"
        }).done(function (re) {
            $(button).parents('li').first().remove();
            removeBlock(box);
            return false;
        });
    } else {
        $(button).parents('li').first().remove();
    }

    return false;
}

function showBlock(element) {
    $(element).append('<div class="overlay"><i class="fa fa-refresh fa-spin"></i></div>');
}

function removeBlock(element) {
    $(element).find(".overlay").remove();
}

function sorting(element, ids) {
    var box = $(element).parents(".box").first();

    for (var i in ids) {
        if (ids[i] == '') {
            box.find("form").find("input[name='ordering']").val(parseInt(i) + 1);
        }
    }

    showBlock(box);

    $.ajax({
        url: '/admin/widgets/sidebars/sort',
        type: 'POST',
        data: {
            ids: ids.join(','),
            sidebar: box.attr('id')
        }
    }).done(function (re) {
        removeBlock(box);
    });
}


