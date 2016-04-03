function initApp() {
    onResize();
    $(window).on('resize', onResize);
    //zoomOut();
    $('.answer').on('click', setAnswer);
    setTimeout(function () {setZoom(1); $('body').addClass('zoominit')}, 0);
    $('#zoom-out').on('mousedown', zoomOut);
    $('img').on('dragstart', function(event) { event.preventDefault(); });
    calculateItemsSize();
}

function calculateItemsSize() {
    var width = 0;
    var height = 0;
    $.each($('#items > *'), function () {
        var el = $(this);
        var offset = el.offset();
        if (offset.left + el[0].scrollWidth > width) width = offset.left + el[0].scrollWidth;
        if (offset.top + el[0].scrollHeight > height) height = offset.top + el[0].scrollHeight;
    });
    $('#items').css({
        width: width,
        height: height
    });
}

function onResize() {
    $('#items-container').css('top', $('#suspects')[0].scrollHeight);
}

function setAnswer() {
    var answer = $(this);
    var question = answer.parents('.question');
    var deselect = answer.hasClass('selected');
    question.find('.answer').removeClass('selected');
    if (!deselect) answer.addClass('selected');
    processAnswers();
}

function processAnswers() {
    $('.suspect').removeClass('ruled-out');
    $.each($('.question'), function () {
        var answer = $(this).find('.selected');
        var question = answer.parents('.question');
        var rulesOut = answer.data('rules-out') != undefined ? answer.data('rules-out').split(',') : [];
        $.each(rulesOut, function () {
            $('#' + this).addClass('ruled-out').removeClass('main-suspect');
        });
    });
    checkSuspects();
}

function checkSuspects() {
    var suspectsLeft = $('.suspect:not(.ruled-out)');
    var message = '';
    if (suspectsLeft.length == 1) {
        if (suspectsLeft.attr('id') === 'ian') message = 'Goed geraden! Zojuist is Ian aangehouden op verdenking van van alles en nog wat.';
        else message = 'Helaas, ' + suspectsLeft.find('p').text() + ' is onschuldig!';
    } else if (suspectsLeft.length == 0) {
        message = 'Iemand van deze verdachten is schuldig!';
    }
    if (message.length > 0) console.log(message);
}

$(function () {
    var curYPos = 0,
        curXPos = 0,
        curDown = false;

    $('#items').on('mousemove', function (e) {
        if (curDown) {
            window.scrollTo(document.body.scrollLeft + (curXPos - e.pageX), document.body.scrollTop + (curYPos - e.pageY));
        }
    });

    $('#items').on('mousedown', function(e){ curDown = true; curYPos = e.pageY; curXPos = e.pageX; $('body').addClass('mousedown').removeClass('mouseup') });
    $(window).on('mouseup', function(e){ curDown = false; $('body').addClass('mouseup').removeClass('mousedown'); setZoom(1); });
});

function zoomOut() {
    var ww = $(window).width();
    var wh = $(window).height() - $('#suspects')[0].scrollHeight;
    var iw = $('#items')[0].scrollWidth;
    var ih = $('#items')[0].scrollHeight;
    var wr = ww / iw;
    var hr = wh / ih;
    var scale = wr > hr ? hr : wr;
    $('html, body').animate({
        scrollTop: 0
    }, 200);
    setZoom(scale);
}

function setZoom(scale) {
    $('#items').css('transform', 'scale(' + scale + ')');
}
