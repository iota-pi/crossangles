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
                    var str = (key + ' - ' + val);
                    if (str.toLowerCase().indexOf(q.toLowerCase()) !== -1) {
                        matches.push(str);
                    }
                });
                cb(matches);
            };
        };
        $('.typeahead.coursein').typeahead({
            name: 'courses',
            source: matcher(courses)
        });
    }
    
    // Load course data from courses.json
    $.getJSON('courses.json', function (data) {
        courses = data;
        $(document).ready(function () {
            init();
        });
    });
}());
    
/* addcourse()
 * Adds course from course input (typeahead) box to list of courses
 */
function addcourse(course) {
    "use strict";
    var tbody = $('#courses'),
        icon = $('<div class="btn-lg">').append($('<span>').addClass('glyphicon glyphicon-remove-circle remove-icon').attr('aria-hidden', true)),
        tr = $('<tr>').html('<td>' + course + '</td>').append(icon);
    tbody.append(tr);
    $('#course-table').show();
}
