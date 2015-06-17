/**
 * Created by vhchung on 3/11/15.
 */
var SEO = function() {
    options = {
        title_field: 'title',
        content_field: 'content'
    };
    var titleItem = $('input[name=' + options.title_field + ']');
    var contentObj = options.content_field;
    var mtitle = $('#meta_title');
    var mdescription = $('#meta_description');
    var mkeyword = $('#meta_keywords');

    var initForm = function() {
        var seo_info = $('input[name=seo_info]').val();
        try {
            seo_info = JSON.parse(decodeURIComponent(seo_info));
        }
        catch(err) {
            seo_info = {};
        }
        if(seo_info){
            if(seo_info.meta_title) mtitle.val(seo_info.meta_title);
            if(seo_info.meta_keywords) mkeyword.val(seo_info.meta_keywords);
            if(seo_info.meta_description) {
                mdescription.val(seo_info.meta_description);
                $('#counter > span').html(seo_info.meta_description.length);
            }
        }
    };

    var handleForm = function() {
        $('input[name=title]').focusout(function(){
            $('#meta_title').val($(this).val());
        });

        mdescription.keyup(function(){
            limiting($(this), 156);
        });

        mdescription.focusout(function() {
            checkKeyWord()
        });
        mtitle.focusout(function(){
            checkKeyWord()
        });
        mkeyword.focusout(function(){
            checkKeyWord()
        });
    };

    var handleAnalysis = function() {
        $('#seo_analysis').on('shown.bs.tab', function(e){
            var content = CKEDITOR.instances[contentObj].getData(),
                title = mtitle.val().toLowerCase(),
                des = mdescription.val().toLowerCase(),
                html = '',
                good = '<li> <span class="good"><i class="fa-lg fa fa-check"></i></span> <span>',
                bad = '<li> <span class="bad"><i class="fa-lg fa fa-exclamation-circle"></i></span> <span>';

            var key =  mkeyword.val().toLowerCase();

            if(key == '') html = 'No focus keyword was set';
            else{
                var regex = new RegExp('(\\b' + key + '\\b)', "gi");

                html = '<ul class="analysis-list">';
                if(title == '') html += bad + 'Meta title is blank';
                    else {
                        var in_title = (title.match(regex)) ? title.match(regex).length : 0;
                        if(in_title > 0) html += good + 'Keyword appear in page title';
                            else html += bad + 'Keyword doesn\'t appear in page title';
                        if(title.length > 70) html += bad + 'Meta title contains more then 70 characters';
                    }
                if(des == '') html +=  bad + 'Meta descriptino is blank';
                    else {
                    var in_description = (des.match(regex)) ? des.match(regex).length : 0;
                    if (des.length > 160) html += bad + 'Meta description has more then 160 characters.';
                    if(in_description > 0) html += good + 'Keyword appear in meta description';
                        else html += bad + 'Keyword doesn\'t appear in meta description';
                }
                if($(content).find('img').length > 0) {
                    html += good + 'Content has image';
                } else html += bad + 'Your content has no image';


                content = $(content).text().toLowerCase();
                var fre = (content.match(regex)) ? content.match(regex).length : 0;

                if(fre > 0) html += good + 'Keyword appear in content';
                    else html += bad + 'Keyword doesn\'t appear in content';

                html += '</span> </li>';

                html += '</ul>';
            }
            $('#tab_analysis').html(html);
        });
    };


    var handleSubmit = function() {
        $('form').submit(function(e) {
            var content = CKEDITOR.instances[contentObj].getData();
            var div = document.createElement('div');
            div.innerHTML = content;
            content = div.textContent;

            var seo_info = {
                meta_title: (mtitle.val() != '')? mtitle.val() : titleItem.val(),
                meta_keywords: mkeyword.val(),
                meta_description: (mdescription.val() != '')? mdescription.val() : extractDes(content)
            };
            $('input[name="seo_info"]').val(encodeURIComponent(JSON.stringify(seo_info)));
        })
    };

    function limiting(obj, limit) {
        var cnt = $("#counter > span");
        var txt = $(obj).val();
        var len = txt.length;

        // check if the current length is over the limit
        $(cnt).html(len);

        // check if user has less than 20 chars left
        if(limit-len <= 20) {
            $(cnt).addClass("warning");
        }
    }

    function extractDes(str) {
        var result = str.trim().substr(0, 160);
        var resultArray = result.split(' ');
        resultArray.pop();
        return resultArray.join(' ') + ' ... ';
    }

    function checkKeyWord() {
        // check if keyword appear in content
        console.log();
        var content = CKEDITOR.instances[contentObj].getData().toLowerCase(),
            title = $('#meta_title').val().toLowerCase(),
            description = $('#meta_description').val().toLowerCase(),
            key =  mkeyword.val().toLowerCase();
        if(key != '') {
            // \b : word boundary
            var regex = new RegExp('(\\b' + key + '\\b)', "gi");
            var fre = (content.match(regex)) ? content.match(regex).length : 0,
                in_title = (title.match(regex)) ? title.match(regex).length : 0,
                in_description = (description.match(regex)) ? description.match(regex).length : 0;

            $('.check-keyword').css('display', 'block');

            keyResult(in_title, $('#count-in-title'));
            keyResult(fre, $('#count-in-content'));
            keyResult(in_description, $('#count-in-description'));
        }
        else
            $('.check-keyword').css('display', 'none');
    }

    function keyResult(count, obj) {
        if($(obj).hasClass('label-success'))
            $(obj).removeClass('label-success');
        if($(obj).hasClass('label-danger'))
            $(obj).removeClass('label-danger');

        if(count > 0)
            $(obj).addClass('label-success').html('Yes (' + count + ')');
        else
            $(obj).addClass('label-danger').html('No');
    }

    return {
        /**
         * provide name of title field, content field, short description field (if exist)
         * @param options
         */
        init: function(options) {
            SEO.options = $.extend(true, {
                title_field: 'title',
                content_field: 'content'
            }, options);
            titleItem = $('input[name=' + SEO.options.title_field + ']');
            contentObj = SEO.options.content_field;
            initForm();
            handleForm();
            handleAnalysis();
            handleSubmit();
        }
    }
}();

