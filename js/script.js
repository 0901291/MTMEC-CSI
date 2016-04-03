function initApp() {
    onResize();
    $(window).on('resize', onResize);
    $('.answer').on('click', setAnswer);
    $('#zoom-out').on('mousedown', zoomOut);
    $('img').on('dragstart', function(event) { event.preventDefault(); });
    $('#close-dialog-button').on('click', closeDialog);
    $('.item-info').on('click', showItemInfo);
    calculateItemsSize();
    initDialog();
    zoomOut();
    setDialogContent('intro');
    setTimeout(openDialog, 1000);
}

function calculateItemsSize() {
    var width = 0;
    var height = 0;
    $.each($('#items > *'), function () {
        var el = $(this);
        var offset = el.offset();
        if (offset.left + el.width() > width) width = offset.left + el.width();
        if (offset.top + el.height() > height) height = offset.top + el.height();
    });
    $('#items').css({
        width: width + 64,
        height: height - 100
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
        if (suspectsLeft.attr('id') === 'ian') message = 'Goed geraden! Zojuist is Ian aangehouden op verdenking van moord!';
        else message = 'Helaas, ' + suspectsLeft.find('p').text() + ' is onschuldig! Probeer wat andere antwoorden om op iemand anders uit te komen.';
    } else if (suspectsLeft.length == 0) {
        message = 'Iemand van deze verdachten is schuldig! Probeer wat andere antwoorden om op iemand uit te komen.';
    }
    if (message.length > 0) {
        $('#dialog .mdl-dialog__title h3').text('Crime Scene Investigation');
        $('#dialog .mdl-dialog__content').html('<p>' + message + '</p>');
        openDialog();
    }
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
    var items = $('#items');
    var iw = items[0].scrollWidth;
    var ih = items[0].scrollHeight;
    iw += 100;
    ih += 100;
    var wr = ww / iw;
    var hr = wh / ih;
    var scale = wr > hr ? hr : wr;
    $('html, body').animate({
        scrollTop: 0
    }, 200);
    iw -= 280;
    items.css('transform-origin', ((ww - iw * scale) / 2) + 'px 20px');
    setZoom(scale);
}

function setZoom(scale) {
    $('#items').css('transform', 'scale(' + scale + ')');
}

function showItemInfo(e) {
    e.stopPropagation();
    var item = $(this).parents('.question');
    if (!item.length) item = $(this).parents('.static');
    console.log(item);
    var id = item.attr('id');
    setDialogContent(id);
    openDialog();
}

function setDialogContent(i) {
    $('#dialog .mdl-dialog__title h3').html(infoTexts[i].title);
    $('#dialog .mdl-dialog__content').html(infoTexts[i].text);
}

function openDialog() {
    $('#dialog')[0].MaterialDialog.show(true);
}

function closeDialog() {
    $('#dialog')[0].MaterialDialog.close();
    if (!$('body').hasClass('zoominit')) {
        $('body').addClass('zoominit');
        setZoom(1);
    }
}

function initDialog() {
    'use strict';
    var MaterialDialog = function MaterialDialog(element) {
        this.element_ = element;
        var t = this;
        window.addEventListener("hashchange", function () {
            if (window.location.hash === "") t.close.bind(t)();
            else if (window.location.hash === "#dialog") t.show.bind(t)(true);
        });
    };
    window['MaterialDialog'] = MaterialDialog;
    MaterialDialog.prototype.cssClasses_ = {
        BACKDROP: 'mdl-dialog-backdrop'
    };
    MaterialDialog.prototype.showInternal_ = function(backdrop) {
        if (backdrop === undefined) {
            throw Error('You must provide whether or not to show the backdrop.');
        }
        if (this.element_.hasAttribute('open')) {
            return;
        }
        if (backdrop) {
            this.createBackdrop_();
        }
        $(this.element_).css("bottom", $(this.element_).height() * (-1));
        this.element_.setAttribute('open', true);
        var el = this.element_;
        setTimeout(function () {
            el.classList.add("mdl-dialog-visible");
        }, 10);
        window.location.hash = "dialog";
    };
    MaterialDialog.prototype.createBackdrop_ = function() {
        this.backdropElement_ = document.createElement('div');
        this.backdropElement_.classList.add(this.cssClasses_.BACKDROP);
        var t = this;
        this.backdropElement_.addEventListener("click", function () {
            t.close.bind(t)();
        });
        $(".mdl-js-dialog").before(this.backdropElement_);
        var el = this.backdropElement_;
        setTimeout(function () {
            el.classList.add("visible");
        }, 10);
    };
    MaterialDialog.prototype.show = function(modal) {
        this.showInternal_(modal);
    };
    MaterialDialog.prototype['show'] = MaterialDialog.prototype.show;
    MaterialDialog.prototype.close = function() {
        this.element_.classList.remove("mdl-dialog-visible");
        if (this.backdropElement_) this.backdropElement_.classList.remove("visible");
        var t = this;
        setTimeout(function () {
            t.element_.removeAttribute('open');
            if (t.backdropElement_) {
                document.body.removeChild(t.backdropElement_);
                t.backdropElement_ = undefined;
            }
            window.location.hash = "";
        }, 200);
    };
    MaterialDialog.prototype['close'] = MaterialDialog.prototype.close;
    componentHandler.register({
        constructor: MaterialDialog,
        classAsString: 'MaterialDialog',
        cssClass: 'mdl-js-dialog',
        widget: true
    });
}

var infoTexts = {
    intro: {
        title: 'Crime Scene Investigation',
        text: '<p>Er is een moord gepleegd! Aan jou om uit te zoeken wie hierachter zit. De recherche heeft in samenwerking met de IT-afdeling aardig wat informatie verzameld, maar er is nog veel onduidelijk. Zo zijn er van veel soorten data meerdere dingen naar boven gekomen. Misschien dat jij met je deduceer-skills kunt helpen! </p><p>Scroll of pan (klikken en slepen) over het bord heen en beantwoord de vragen. Elk antwoord sluit een aantal mensen uit. Uiteindelijk houd je er één over, hopelijk kunnen we de dader dan pakken! </p>'
    },
    security_cams: {
        title: 'Beveiligingscamera\'s - Crime Scene Investigation',
        text: '<p>Er is bekend dat de verdachte op het moment van de beelden op het station was. Er zijn alleen op hetzelfde tijdstip twee onbekende personen gespot. Waar zou de verdachte eerder een drankje halen?</p><p>Overal waar je komt word je in de gaten gehouden door camera\'s. Vaak passief en worden de beelden pas gebruikt als er iets gebeurd is. In sommige gevallen echter ook pro-actief. Bij bepaalde evenenten en in het openbaar vervoer word je gescand om te kijken wie je bent, en of je daar wel hoort te zijn</p>'
    },
    train_tickers: {
        title: 'Openbaar vervoer - Crime Scene Investigation',
        text: '<p>Openbaar vervoerders als de NS en de RET kunnen door jouw in- en uitcheckgedrag te monitoren heel veel informatie verkrijgen. Niet alleen </p>'
    },
    music: {
        title: 'Spotify - Crime Scene Investigation',
        text: '<p>We weten van een aantal verdachten van welke muziek zij houden. Op het plaats delict hebben wij toegangsbewijzen gevonden voor deze drie artiesten. Welk album heeft de voorkeur van de dader denk je?</p><p>Spotify is erg goed in het bijhouden van je luister-gedrag. Ze kunnen hiermee spotten waar de muziek-trends van dit moment liggen, jou motiveren naar optredens van jouw favoriete artiest te gaan, maar bovenal jou laten luisteren naar muziek die jij leuk vindt. Hoe meer muziek jij leuk vindt, hoe meer muziek je luistert. Hoe meer muziek je luistert, hoe meer Spotify verdient.</p>'
    },
    work: {
        title: 'Stage/werk - Crime Scene Investigation',
        text: '<p>Weer twijfel! We hebben van een aantal verdachten kunnen vinden dat zij geïnteresseerd zijn bepaalde bedrijven. Als we die informatie nou konden bevestigen, is er misschien wel een verband te leggen?</p><p>In een professionele omgeving wordt er van alles over je bijgehouden. Je surfgedrag, je communicatie via je werk-telefoon.</p>'
    },
    calls: {
        title: 'Bellerlijst - Crime Scene Investigation',
        text: '<p>We hebben op het plaats delict een telefoon gevonden die in contact heeft gestaan met deze nummers. Helaas heeft iemand er inkt overheen laten vallen waardoor de lijst onbruikbaar is geworden.</p><p>Telecombedrijven houden bij met wie je belt, hoe lang je belt, vanaf waar je belt en op welke tijdstippen jij het meeste belt. In sommige gevallen luisteren ze zelfs mee met wat je zegt. Ondanks dat er stricte regulering is rondom het bewaren van deze gegevens, worden grenzen steeds verder opgezocht. Overheden willen steeds meer informatie van hun volk hebben en gaan daarvoor erg ver.</p>'
    },
    residence: {
        title: 'Locatiegegevens - Crime Scene Investigation',
        text: '<p>We weten dat de dader in minstens één van deze steden is geweest en misschien wel woont. Kun jij wat verdachten uitsluiten?</p><p>Als je de locatiegegevens van je telefoon aan hebt staan kan Google je op de voet volgen. Zo kan hij patronen opstellen van wanneer je ergens komt, wie je daar tegenkomt en wat je daar gaat doen. Door dit toe te voegen aan alle andere informatie die hij van je heeft kan Google nog gerichter advertenties op jou afstellen.</p>'
    },
    netflix: {
        title: 'Netflix - Crime Scene Investigation',
        text: '<p>Via de gegevens van het openbare netwerk rondom de plaats delict konden we zien dat er net voor de moord naar deze drie series is gekeken. Welke serie volgt de dader volgens jou?</p><p>Ook Netflix is veel bezig met het opstellen van patronen op basis van informatie. Hoe beter zij aan jou aanbevelingen kunnen doen, hoe meer jij kijkt. Netflix wekt dan de illusie oneindig leuke content te kunnen bieden, dus wordt hij interessanter, krijgt hij meer klanten, en blijf jij langer klant.</p>'
    }
};
