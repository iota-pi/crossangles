/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true, regexp: true */
/*global $, jQuery, console */

var courseList = [],
    classList = [],
    shadowList = {};

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

    var row = $(e.currentTarget).parents('div.row'),
        parent = row.parent(),
        div = row.children().first(),
        course = div.html().replace(/ -.+/, ''),
        i = courseList.indexOf(course);

    // Remove this course from the list of courses
    if (i !== -1) {
        courseList.splice(i, 1);
    }

    // Fade out and slide up neatly
    row.children().fadeOut(200, function () {
        row.children().show().css('visibility', 'hidden');
        parent.slideUp(200, function () {
            parent.remove();

            // Put the extra -10px back at bottom of courses element when it's empty
            if ($('#courses').children().length === 0) {
                $('#courses').css('margin-bottom', '-10px');
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

    var holder = $('#courses'),
        icon = $('<span>').addClass('glyphicon glyphicon-remove-circle remove-icon').attr('aria-hidden', true).click(removeCourse),
        div = $('<div>').append($('<div class="row">')
                                .html('<div class="col-10">' + course + '</div>')
                                .append($('<div class="col-2" style="text-align: right;">').append(icon))
                               );

    // Add this new item to the course holder and ensure the bottom margin is removed
    holder.append(div)
        .css('margin-bottom', 0);

    div.children().hide();
    div.hide().slideDown(200, function () {
        div.children().fadeIn(200);
    });
}

function startDrag(e, ui) {
    'use strict';

    var el = $(e.target),
        key = el.attr('id'),
    // Select corresponding shadows and fade them in
        //shadows = $(shadowList[key]).map(function () { return this.toArray(); });
        shadows = shadowList[key];
    shadows.fadeIn(100);    // quite a quick fade

    // CSS positioning must be relative while dragging
    el.css({position: 'relative'});
}

function stopDrag(e, ui) {
    'use strict';

    // Snap element a to element b
    function snapTo($a, b) {
        // Detach a, then append it to b, then also set the positioning to be at an offset of (0, 0) from the parent
        $a.detach().appendTo(b).css({position: 'absolute', left: 0, top: 0});
    }

    // Snap dragged item to nearest visible shadow
    var drag = $(e.target),
        least = drag.width() / 2 * drag.width() / 2, // initial value = min_range ^ 2
        best = null,
        key,
        index;
    $('.class-shadow:visible').each(function () {
        var offsetA = $(this).offset(),
            offsetB = drag.offset(),
            // NB: dist is squared
            dist = Math.pow(offsetA.left - offsetB.left, 2) + Math.pow(offsetA.top - offsetB.top, 2);

        if (dist < least) {
            least = dist;
            best = $(this);
        }
    });
    if (best !== null) {
        // Find the index of the current class in the stream
        key = drag.attr('id');
        index = shadowList[key].index(best);

        // Update all linked classes
        $('.class-drag[id^="' + key.replace(/\d+$/, '') + '"]').each(function () {
            var otherClass = $(this),
            // Find the corresponding shadow
                shadow = $(shadowList[$(this).attr('id')][index]);

            // Snap this class to it's shadow
            snapTo(otherClass, shadow.parent());
        });
    }

    // Hide visible all shadows
    $('.class-shadow').fadeOut(200);
}

function createClass(timestr, text) {
    'use strict';

    var times = timestr.split(','),
        time,
        i,
        div,
        parent,
        ends,
        duration,
        id,
        title;
    for (i = 0; i < times.length; i += 1) {
        // Generate the id for this class
        id = text.replace(': ', '') + i;

        // Put class title together
        title = text;
//        if (times.length > 1) {
//            title += ' (' + (i + 1) + ')';
//        }

        // Calculate the duration of the class
        time = times[i];
        ends = time.replace(/. /, '').split('-');
        duration = (ends.length > 1) ? ends[1] - ends[0] : 1; // default duration = 1 hour

        // Get the parent element
        parent = $('#' + time[0] + (+ends[0]));

        // Create the class div
        div = $('<div class="class-drag" id="' + id + '">').append($('<div>').html(title))
            .draggable({
                stack: '.class-drag',
                scroll: true,
                containment: parent.parents('.row'),
                start: startDrag,
                stop: stopDrag
            })
            .css({
                position: 'absolute'
            });
        div.appendTo(parent);
        div.height(parent.outerHeight() * duration);

        // Add this div to the classList (TODO: is this used?)
        classList.push(div);
    }
}

function createShadow(timestr, group) {
    'use strict';

    var times, time, i, div, parent, ends, duration;
    times = timestr.split(',');
    for (i = 0; i < times.length; i += 1) {
        time = times[i];
        ends = time.replace(/. /, '').split('-');
        duration = (ends.length > 1) ? ends[1] - ends[0] : 1; // default
        parent = $('#' + time[0] + (+ends[0]));
        div = $('<div class="class-shadow">');
        div.appendTo(parent);
        div.height(parent.outerHeight() * duration);

        // Add to list of shadows
        if (shadowList.hasOwnProperty(group + i)) {
            shadowList[group + i] = shadowList[group + i].add(div);
        } else {
            shadowList[group + i] = div;
        }
    }
}
