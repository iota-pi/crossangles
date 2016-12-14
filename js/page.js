/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true*/
/*global $, jQuery, console, Typeahead */

(function () {
    "use strict";
    var courses;
    
    /* initialise typeahead */
    function init() {
        var matcher = function (hash) {
            return function findMatches(q, cb) {
                var matches = [];
                $.each(hash, function (key, val) {
                    var str = (key + ' - ' + val),
                        index = str.toLowerCase().indexOf(q.toLowerCase());
                    if (index > 0) {
                        matches.push(str);
                    } else if (index === 0) {
                        matches.unshift(str);
                    }
                });
                matches.sort();
                cb(matches);
            };
        };
        $('.typeahead.coursein').typeahead({
            name: 'courses',
            source: matcher(courses)
        });
    }
    
    // Load course data from courses.json
    $.getJSON('data/courses.json', function (data) {
        courses = data;
        $(document).ready(function () {
            init();
        });
    });
}());

/* removecourse()
 * Adds course from course input (typeahead) box to list of courses
 */
function removecourse(e) {
    "use strict";
    var tr = $(e.currentTarget).parents('tr'),
        h = tr.height();
    tr.find('td').fadeOut(200, function () {
        tr.empty();
        tr.height(h);
        tr.slideUp(200, function () {
            var table = tr.parents('table');
            tr.remove();
            if (table.find('tr').length === 0) {
                table.slideUp(50);
            }
        });
    });
}

/* addcourse()
 * Adds course from course input (typeahead) box to list of courses
 */
function addcourse(course) {
    "use strict";
    var tbody = $('#courses'),
        icon = $('<span>').addClass('glyphicon glyphicon-remove-circle remove-icon').attr('aria-hidden', true).click(removecourse),
        tr = $('<tr>').html('<td style="width:100%">' + course + '</td>').append($('<td>').append(icon)),
        h = tr.height();
    tbody.append(tr);
    $('#course-table').show();
    tr.hide().fadeIn(200);
    /* TODO: add slideDown too? - bit tricky to do with table rows... */
}
