/*jshint browser: true, jquery: true */

function Message(title, text, type, parent) {
    var icon = $('<i class="material-icons">').html(type),
        span = $('<span>').html('<strong>' + title + '</strong> ' + text),
        close = $('<i class="material-icons close">close</i>'),
        message = $('<div class="message ' + type + '">').append(icon, span, close);

    close.click(function () {
        message.fadeOut(200, function () {
            message.remove();
        });
    });

    return message;
}
