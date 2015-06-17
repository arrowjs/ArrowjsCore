var qjson,
    modal = $('#quiz-modal'), quiz_index,
    modal_footer = $('#quiz-modal .modal-footer'),
//                btnIgnore = $('#btnIgnore'),
    btnCheck = $('#btnCheck'),
    btnNext = $('#btnNext'),
    istatus = $('#btnCheck i'),
    heart = 3;

// progressbar script
var t = $('.progressbar'),
    dataperc = t.attr('data-perc'),
    barperc = Math.round(dataperc * 5.56);
t.find('.bar').animate({width: barperc}, dataperc * 25);
t.find('.label').append('<div class="perc"></div>');

function perc() {
    var weight = parseInt($('.progressbar').css('width')) / 100;
    var perc = $('.progressbar').attr('data-perc');
    var length = Math.ceil(parseInt(perc) * weight * 0.99),//5.56
        labelpos = length - 2;
    t.find('.bar').css('width', length);
    t.find('.label').css('left', labelpos);
    t.find('.perc').text(perc + '%');
}
perc();
setInterval(perc, 0);
btnCheck.on('click', function () {
    checkAnswer();
});
/**
 * get list quizzes and answers in json format
 * show first quiz on modal
 * @param quiz_collection --> array quiz_id
 */
function getQuiz(quiz_collection) {
    if (quiz_index == undefined) {
        quiz_collection = quiz_collection.split(',');
        $.ajax({
            url: '/courses/get-quiz-answer',
            type: 'GET',
            data: {
                ids: quiz_collection
            },
            success: function (data) {
//                        console.log('JSON data:\n', data);
                qjson = shuffle(data.quiz);
//                        console.log(qjson);
                quiz_index = 0;
                changeQuiz(qjson, quiz_index);
                modal.modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }
        });
    } else {
        modal.modal({
            backdrop: 'static',
            keyboard: false
        });
    }
}
function changeQuiz(json, id) {
    if (istatus.hasClass('fa-check')) {
        istatus.removeClass('fa-check').addClass('fa-question');
    }
    // hide button check until user check an option
    btnCheck.addClass('disabled');
    var quiz = json[id];
    var input_type, answers = quiz.answers;

    if (quiz.type == 0) input_type = 'radio';
    else if (quiz.type == 1) input_type = 'checkbox';
    else input_type = 'text';

    var html = quiz.html + '<div class="clear"></div>';
    answers.forEach(function (a, index) {
        html += '<div class="col-md-6 col-sm-12 answer-wrap">' +
        '<label>' +
        '<input id="' + a.id + '" type="' + input_type + '" name="answer"> ' +
        '[' + (index + 1) + '] ' +
        html_entity_decode(htmlentities(a.answer_text)).replace(/\</g, '&lt;').replace(/\>/g, '&gt;') +
        '</label>' +
        '</div>';
    });
    $('#quiz-content').html(html);
    $('.modal input').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
        increaseArea: '20%' // optional
    });
    bindMouse();
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });
    $(document).on('ifChecked', '.modal input', function () {
        btnCheck.removeClass('disabled');
    });
    $(document).on('ifChanged', '.modal input', function () {
        if ($('.modal input:checked').length == 0) btnCheck.addClass('disabled');
    });
}
function checkAnswer() {
    // get list answer
    var ids = [];
    var check = $('.modal input:checked');
    if (check.length > 1)
        check.each(function () {
            ids.push($(this).attr('id'));
        });
    else ids.push(check.attr('id'));
    var istatus = $('#btnCheck i');
    $('.modal input').iCheck('disable');
    $('.modal input:checked').iCheck('enable');
    Mousetrap.reset();
    Mousetrap.bind('enter', function () {
        $(".modal button:last").trigger("click");
    });
    $.ajax({
        url: '/courses/check-quiz-answer',
        type: 'POST',
        data: {
            ids: ids,
            quiz_id: qjson[quiz_index].quiz_id
        },
        beforeSend: function () {
            istatus.removeClass('fa-question').addClass('fa-spinner fa-spin');
        },
        success: function (data) {
            istatus.removeClass('fa-spinner fa-spin').addClass('fa-check');
//                    btnIgnore.addClass('hidden');
            btnCheck.addClass('hidden');
            btnNext.removeClass('hidden');
            var percent = Math.round(parseInt(quiz_index + 1) * 100 / qjson.length);
            $('.progressbar').attr('data-perc', percent);
            perc();
            setInterval(perc, 200);

            // show result and correct answer
            if (data == true) showCorrect();
            else {
                showIncorrect();
                // decrease heart
                heart--;
                $('.heart-red:nth-child(' + (3 - heart) + ')').removeClass('heart-red').addClass('heart-black');
                if (heart == 0) {
                    //move to result screen -> fail to finish quiz
                    showFinish(false);
                }
            }
            quiz_index++;
        }
    });
}
function nextQuiz() {
    if (quiz_index < qjson.length) {
        modal_footer.removeClass('incorrect').removeClass('correct');
//                btnIgnore.removeClass('hidden');
        btnCheck.removeClass('hidden');
        btnNext.addClass('hidden');
        $('.result').remove();
        changeQuiz(qjson, quiz_index);
    }
    else {
//                show result
        showFinish(true);
        // send ajax verify that user passed this lesson
        var lesson_id = $('input[name=lesson-id]').attr('id'),
            course_id = $('input[name=course-id]').attr('id');
        $.ajax({
            url: '/courses/complete-lesson/' + course_id + '/' + lesson_id,
            type: 'POST'
        });
    }
}
function hideModal() {
    modal.modal('hide');
}
function showFinish(status) {
    var html;
    if (status) html = '<h1>Chúc mừng bạn</h1>' +
    '<h3>Bạn đã hoàn thành bài học này. Hãy tiếp tục giữ phong độ!</h3>';
    else
        html = '<h1>Chia buồn cùng bạn</h1>' +
        '<h3>Bạn đã sai 3 câu hỏi và không vượt qua bài kiểm tra.Chúc bạn may mắn lần sau!</h3>';
    $('.result').remove();
    btnNext.addClass('hidden');
    modal_footer.append('<button class="btn btn-success btn-lg" onclick="hideModal()">Học tiếp</button>');
    $('#quiz-content').html(
        '<div class="final text-center">' + html + '</div>');
}
function showCorrect() {
    modal_footer.removeClass('incorrect').addClass('correct');
    modal_footer.prepend('<div class="result pull-left">' +
    '<span class="badge-quiz">' +
    '<i class="fa fa-check fa-4x"></i>' +
    '</span>' +
    '<h2>Chính xác</h2>' +
    '</div>');
}
function showIncorrect() {
    modal_footer.addClass('incorrect').removeClass('correct');
    modal_footer.prepend('<div class="result pull-left false">' +
    '<span class="badge-quiz">' +
    '<i class="fa fa-close fa-4x"></i>' +
    '</span>' +
    '<h2>Sai</h2>' +
    '</div>');
}
function bindMouse() {
    $('.modal input').each(function (index, input) {
        Mousetrap.bind((index + 1).toString(), function () {
            $(input).iCheck('toggle');
        });
    });
    Mousetrap.bind('enter', function () {
        var button = $(".modal button:last");
        document.getElementById('btnCheck').click();
    });
}