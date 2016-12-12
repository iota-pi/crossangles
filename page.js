/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true*/
/*global $, jQuery, alert*/

(function () {
    "use strict";
    var courses;
    
    function init() {
        var matcher = function (strs) {
            return function findMatches(q, cb) {
                var matches = [];
                $.each(strs, function (i, str) {
                    if (str.toLowerCase().indexOf(q.toLowerCase()) !== -1) {
                        matches.push(str);
                    }
                });
                cb(matches);
            };
        };
        $('.typeahead#coursein').typeahead({
            hint: true,
            highlight: true,
            minLength: 1
        }, {
            name: 'courses',
            source: matcher(courses)
        });
    }
    
    // Load course data from courses.json
    $.getJSON('courses.json', function (json) {
        courses = json;
        $(document).ready(function () {
            init();
        });
    });
    
    function addcourse() {
        var inputfield = $('input#coursein');
    }
}());
