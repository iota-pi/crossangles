/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true, regexp: true */
/*global $, jQuery, console, html2canvas, download */

var courseList = ['CBS'],
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
                    initial = initial.concat(matches);
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

            $('#showcap').change(function () {
                var divs = $('.class-capacity');
                if (document.getElementById('showcap').checked === true) {
                    divs.show();
                } else {
                    divs.hide();
                }
            });
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

function timetableToPNG() {
    'use strict';

    var el = document.getElementById('timetable');
    html2canvas(el, {
        onrendered: function (canvas) {
            var ctx = canvas.getContext('2d'),
                png = ctx.toDataURL('image/png');
            download(png);
        }
    });
}


function getColour(index) {
    'use strict';

	// Colour definitions (format: [highlight, normal]; 'r,g,b')
    var colours = [
        [19, 111, 225], // mid blue
        [160, 29, 33], // crimson
        [0, 140, 72], // green
        [102, 44, 145], // purple
        [255, 107, 0], // orange
        [10, 28, 210], // deep blue
        [238, 46, 20] // red (slightly pinked)
    ];
	return colours[index % colours.length].join(',');
}

function startDrag(e, ui) {
    'use strict';

    var el = $(e.target),
        key = el.attr('id'),
        shadows = shadowList[key];
    shadows.fadeIn(100);    // quite a quick fade

    // CSS positioning must be relative while dragging
    el.css({position: 'relative'});
}

// End-of-drag callback function
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
        $('.class-drag[id^="' + key.replace(/\d$/, '') + '"]').each(function () {
            var otherClass = $(this),
            // Find the corresponding shadow
                shadow = $(shadowList[$(this).attr('id')][index]);

            // Snap this class to it's shadow
            snapTo(otherClass, shadow.parent());

            // Update the class capacity
            otherClass.find('.class-capacity').html(shadow.data('capacity'));
        });
    }

    // Hide visible all shadows
    $('.class-shadow').fadeOut(200);
}

// Add push functionality to jQuery objects
$.fn.push = function (selector) {
    'use strict';

    Array.prototype.push.apply(this, $.makeArray($(selector)));
    return this;
};

// Returns an array containing all elements in arr where, when cast to a string, there are no duplicates
function unique(arr) {
    'use strict';

    var uniqueArr = [],
        strs = [],
        i;
    for (i = 0; i < arr.length; i += 1) {
        if (strs.indexOf(String(arr[i])) === -1) {
            uniqueArr.push(arr[i]);
            strs.push(String(arr[i]));
        }
    }

    return uniqueArr;
}

// Creates a draggable class element
function createClass(times, capacity, course, component, courseID, done) {
    'use strict';

    var time,
        i,
        id,
        duration,
        parent,
        div,
        title = '<div>' + ((course !== 'CBS') ? course + ': ' + component : component) + '</div>',
        skips = 0;

    if (course !== 'CBS') {
        capacity = '<div class="class-capacity">' + capacity.replace(',', ' / ') + '</div>';
    } else {
        capacity = '<div class="class-capacity"></div>';
    }

    for (i = 0; i < times.length; i += 1) {
        time = times[i];
        // Check that we haven't already created a shadow for this course, component and time
        // NB: checking the time is necessary for when there is messy data
        if (done.indexOf(time.join(',') + course + component) === -1) {
            done.push(time.join(',') + course + component);

            // Generate the id for this class
            id = course + component + (i - skips);

            // Calculate the duration of the class
            duration = time[2] - time[1];

            // Get the parent element
            parent = $('#' + (time[0] + time[1]).replace('.5', '_30'));

            // Create the class div
            div = $('<div class="class-drag" id="' + id + '">').append($('<div>').html(title + capacity))
                .draggable({
                    stack: '.class-drag',
                    scroll: true,
                    containment: parent.parents('.row'),
                    start: startDrag,
                    stop: stopDrag
                })
                .css({
                    position: 'absolute',
                    'background-color': 'rgb(' + getColour(courseID) + ')'
                });
            div.appendTo(parent);

            // Fix div height
            div.height(parent.outerHeight() * duration * 2);

            // Add this div to the classList
            classList.push(div);
        } else {
            skips += 1;
        }
    }

    // Hide capacity if it shouldn't be showing
    if (!document.getElementById('showcap').checked) {
        $('.class-capacity').hide();
    }
}

function createShadow(times, group, courseID, capacity, done) {
    'use strict';

    // No capacity for CBS events!
    if (group.indexOf('CBS') === 0) {
        capacity = '';
    }

    times = unique(times);

    var time, timestr, i, j, index, div, parent, duration, key;

    for (i = 0; i < times.length; i += 1) {
        time = times[i];
        timestr = time.join(',');

        // Put together key to be used for shadowList hash
        key = group + i;

        // Check that we haven't already created a shadow for this course, component and time
        if (done.hasOwnProperty(group)) {
            done[group].push(timestr);
        } else {
            done[group] = [timestr];
        }

        duration = time[2] - time[1];
        parent = $('#' + (time[0] + time[1]).replace('.5', '_30'));
        div = $('<div class="class-shadow">').css({
            'background-color': 'rgba(' + getColour(courseID) + ', 0.7)'
        });
        div.data('capacity', capacity.replace(',', ' / '));
        div.appendTo(parent);
        div.height(parent.outerHeight() * duration * 2);

        // Add to shadowList
        if (shadowList.hasOwnProperty(key)) {
            shadowList[key] = shadowList[key].push(div);
        } else {
            shadowList[key] = div;
        }
    }
}

function clearLists() {
    'use strict';

    classList = [];
    shadowList = {};
}
