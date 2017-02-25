/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true, regexp: true */
/*global $, jQuery, console */

(function () {
    "use strict";
    var courses;
    
    /* initialise typeahead */
    function init() {
        var matcher = function (hash) {
            return function findMatches(q, cb) {
                var matches = [],
                    initial = [];
                $.each(hash, function (key, val) {
                    var str = (key + ' - ' + val),
                        index = str.toLowerCase().indexOf(q.toLowerCase());
                    if (index > 0) {
                        matches.push(str);
                    } else if (index === 0) {
                        initial.push(str);
                    }
                });
                matches.sort();
                initial.sort();
                cb(initial.concat(matches).slice(0, 10));
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

/* removeCourse()
 * Removes a course from the selected courses list
 */
function removeCourse(e) {
    "use strict";

    var tr = $(e.currentTarget).parents('tr'),
        td = tr.find('td'),
        h = tr.height();

    td.fadeOut(200, function () {
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

/* addCourse()
 * Adds the course from course input (typeahead) box to list of courses
 */
function addCourse(course) {
    "use strict";
    var tbody = $('#courses'),
        icon = $('<span>').addClass('glyphicon glyphicon-remove-circle remove-icon').attr('aria-hidden', true).click(removeCourse),
        tr = $('<tr>').html('<td style="width:100%">' + course + '</td>').append($('<td>').append(icon)),
        h = tr.height();
    tbody.append(tr);
    $('#course-table').show();
    tr.hide().fadeIn(200);
    /* TODO: add slideDown too? - bit tricky to do with table rows... */
}

/* getCourses()
 * Gets a list of chosen courses
 */
function getCourses() {
    'use strict';

    var courses = [];
    $('#courses').find('tr').each(function () {
        courses.push($(this).find('td').first().html().replace(/ .*/, ''));
    });

    return courses;
}

$(document).ready(function () {
    "use strict";
    
    // Add noselect styling to checkboxes
    $('.checkbox-inline').addClass('noselect');
});
