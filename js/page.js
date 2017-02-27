/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true, regexp: true */
/*global $, jQuery, console */

/* getCourses()
 * Gets a list of chosen courses
 */

/*function getCourses() {
    'use strict';

    var courses = [];
    $('#courses').find('tr').each(function () {
        courses.push($(this).find('td').first().html().replace(/ .*\/, ''));
    });

    return courses;
}
*/

var courseList = [];

(function () {
    "use strict";
    var courses;
    
    /* initialise typeahead */
    function init() {
        var matcher = function (hash) {
            return function findMatches(q, cb) {
                var matches = [],
                    initial = [],
                    courses = courseList;
                q = q.toLowerCase();
                $.each(hash, function (key, val) {
                    // Skip any courses which have already been chosen
                    if (courses.indexOf(key) >= 0) {
                        return true; // continue
                    }

                    var str = (key + ' - ' + val),
                        index = str.toLowerCase().indexOf(q);
                    if (index > 0) {
                        matches.push(str);
                    } else if (index === 0) {
                        initial.push(str);
                    }
                });

                // Sort the found matches
                initial.sort();

                // Add non-initial matches if there are fewer than 10 initial matches
                if (initial.length < 10 && matches.length > 0) {
                    // Sort the other matches
                    matches.sort();

                    // Add them to initial
                    initial.concat(matches);
                }

                cb(initial.slice(0, 10));
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
        h = tr.height(),
        course = td.html().replace(/ -.*/, ''),
        i = courseList.indexOf(course);

    // Remove this course from the list of courses
    if (i !== -1) {
        courseList.splice(i, 1);
    }

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

    courseList.push(course.replace(/ -.*/, ''));

    var tbody = $('#courses'),
        icon = $('<span>').addClass('glyphicon glyphicon-remove-circle remove-icon').attr('aria-hidden', true).click(removeCourse),
        tr = $('<tr>').html('<td style="width:100%">' + course + '</td>').append($('<td>').append(icon)),
        h = tr.height();
    tbody.append(tr);
    $('#course-table').show();
    tr.hide().fadeIn(200);
    /* TODO: add slideDown too? - bit tricky to do with table rows... */
}

$(document).ready(function () {
    "use strict";
    
    // Add noselect styling to checkboxes
    $('.checkbox-inline').addClass('noselect');
});
