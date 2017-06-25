/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSHint Options --- */
/*jshint browser: true, regexp: true */
/*global $, console, domtoimage, download, Cookies, generate */

var finishedInit = false,
    courseList = ['CBS'],
    classList = [],
    shadowList = {},
    classLocations = {},
    ttCellHeight = 50,
    ttHeadHeight = 40,
    waitingScripts = 0,
    timetableData = {},
    metadata = {},
    customClasses = [],
    optionMemory = {};

function init_typeahead() {
    'use strict';

    /* initialise typeahead */
    var matcher = function (courseCodes) {
        return function findMatches(q, cb) {
            var matches = [],
                initial = [],
                courses = courseList,
                i;
            q = q.toLowerCase();

            for (i = 0; i < courseCodes.length; i += 1) {
                var key = courseCodes[i];
                // Skip any courses which have already been chosen
                if (courses.indexOf(key) >= 0) {
                    continue;
                }

                var str = (key + ' - ' + timetableData[key][0]),
                    index = str.toLowerCase().indexOf(q);
                if (index > 0) {
                    matches.push(str);
                } else if (index === 0) {
                    initial.push(str);
                }
            }

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

    // Wait to ensure typeahead has loaded
    while ($().typeahead === undefined);

    // Initialise typeahead
    $('.typeahead.coursein').typeahead({
        name: 'courses',
        source: matcher(Object.keys(timetableData))
    });
}

function restoreState(courseHash) {
    'use strict';

    // Get previously chosen options and courses from cookies
    var options = Cookies.getJSON('options'),
        courses = Cookies.getJSON('courses') || [],
        i;

    // Restore class locations
    classLocations = Cookies.getJSON('classLocations') || {};

    // Restore custom courses
    customClasses  = Cookies.getJSON('custom') || [];

    if (options !== undefined) {
        // Restore courses
        for (i = 0; i < courses.length; i += 1) {
            if (courses[i] !== 'CBS') { // NB: even though CBS is in courseList, it shouldn't be added in the DOM list of courses
                if (timetableData.hasOwnProperty(courses[i])) {
                    addCourse(courses[i] + ' - ' + timetableData[courses[i]][0], false, false);
                }
            }
        }
        for (i = 0; i < customClasses.length; i += 1) {
            var courseDiv = addCourse(customClasses[i].component, true, false);
            courseDiv.data('custom', customClasses[i].course);
        }

        // Restore CBS items
        document.getElementById('tbt').checked = options.cbs.tbt;
        document.getElementById('bib').checked = options.cbs.bib;
        document.getElementById('ctr').checked = options.cbs.ctr;
        document.getElementById('cth').checked = options.cbs.cth;

        // Restore misc other options
        document.getElementById('showcap').checked = options.showcap;
        document.getElementById('fullclasses').checked = options.fullclasses;
        document.getElementById('showloc').checked = options.showloc;
        document.getElementById('canclash').checked = options.canclash;

        // Call generate to recreate previous timetable
        if (JSON.stringify(classLocations) !== '{}') {
            generate(true, true);
        }
    }
}

function saveState(generated) {
    'use strict';

    if (!finishedInit) { return; }

    // Save courses
    Cookies.set('courses', courseList, { expires: 7 * 26 }); // 1/2 a year
    Cookies.set('custom', customClasses, { expires: 7 * 26 }); // 1/2 a year

    // Save CBS items
    var options = { cbs: {} };
    options.cbs.tbt = document.getElementById('tbt').checked;
    options.cbs.bib = document.getElementById('bib').checked;
    options.cbs.ctr = document.getElementById('ctr').checked;
    options.cbs.cth = document.getElementById('cth').checked;

    // Save generation specific options
    options.fullclasses = optionMemory.fullclasses;
    options.canclash = optionMemory.canclash;

    // Save misc other options
    options.showcap = document.getElementById('showcap').checked;
    options.showloc = document.getElementById('showloc').checked;
    Cookies.set('options', options, { expires: 7 * 26 });

    // Save class locations
    Cookies.set('classLocations', classLocations, { expires: 7 * 26 });
}

/* removeCourse()
 * Removes a course from the selected courses list
 */
function removeCourse(e) {
    'use strict';

    var row = $(e.currentTarget).parents('div.row'),
        parent = row.parent(),
        div = row.children().first(),
        course = div.html().replace(/ -.+/, '');

    // Remove this course from the list of courses
    if (parent.data('custom') !== false) {
        for (var i = 0; i < customClasses.length; i += 1) {
            if (customClasses[i].course === parent.data('custom')) {
                customClasses.splice(i, 1);
                break;
            }
        }
    } else if (courseList.indexOf(course) !== -1) {
        courseList.splice(courseList.indexOf(course), 1);
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

    saveState();
}

/* addCourse()
 * Adds the course from course input (typeahead) box to list of courses
 */
function addCourse(course, custom, fade) {
    'use strict';

    // Add this course to our list of courses (provided it is not a custom class)
    if (custom !== true) {
        courseList.push(course.replace(/ -.*/, ''));
    }

    // Create DOM structure for course display list
    var holder = $('#courses'),
        remove = $('<span>').addClass('glyphicon glyphicon-remove-circle glyphicon-clickable remove-icon').attr('aria-hidden', true).attr('data-toggle', 'tooltip').attr('title', 'Remove').click(removeCourse),
        edit = $('<span>').attr('data-toggle', 'tooltip').attr('title', 'Edit').append(
               $('<span>').addClass('glyphicon glyphicon-edit glyphicon-clickable edit-icon')
                          .attr('aria-hidden', true)
                          .attr('data-toggle', 'modal')
                          .attr('data-target', '#customClass')
                          .click(showEdit)),
        rightCol = $('<div>').addClass('col-4 col-sm-2 button-col').css('text-align', 'right').append($('<div class="vert-holder">').append(remove)),
        bothIcons = (custom !== true) ? rightCol : rightCol.prepend($('<div class="vert-holder">').append(edit)),
        row = $('<div>').addClass('row')
                                .html('<div class="col-8 col-sm-10">' + course + '</div>')
                                .append(rightCol),
        div = $('<div>').append(row).data('custom', false);

    // Add this new item to the course holder and ensure the bottom margin is removed
    holder.append(div)
        .css('margin-bottom', 0);

    if (fade !== false) {
        div.children().hide();
        div.hide().slideDown(200, function () {
            div.children().fadeIn(200);
        });
    }

    // Save current page state
    saveState();

    return div;
}

function to24H(time) {
    if (time === undefined || time.length === 0) { return undefined; }

    var hour = parseInt(time.replace(/\D.*/, '')) % 12;
    return hour + ((time.indexOf('PM') !== -1) ? 12 : 0);
}

function to12H(hour_24) {
    if (hour_24 === undefined || hour_24 === '') { return undefined; }

    var hour = (hour_24 % 12 === 0) ? 12 : hour_24 % 12,
        time = ((hour < 10) ? '0' + hour : hour) + ':00 ' + ((hour_24 >= 12) ? 'PM' : 'AM');
    return time;
}

function getRandomInt(min, max) {
    min = Math.ceil(min || 0);
    max = Math.floor(max || 1e6);
    return Math.floor(Math.random() * (max - min)) + min;
}

function uniqueID() {
    var id = 'custom' + getRandomInt() + '_',
        i;
    for (i = 0; i < customClasses.length; i += 1) {
        if (customClasses[i].course === id) {
            return uniqueID(); // recursively call till we get a unique ID
        }
    }
    return id;
}

function addCustom() {
    'use strict';

    var title = document.getElementById('customTitle').value,
        location = document.getElementById('customLocation').value,
        start = to24H(document.getElementById('startTime').value),
        end = to24H(document.getElementById('endTime').value),
        day = $('input[type="radio"][name="customDay"]').parent('.active').data('day'),
        time = day + ' ' + start + ((end - start !== 1) ? '-' + end : ''),
        cid = document.getElementById('customID').value || uniqueID(),
        colour = getComputedStyle(document.querySelector('input[type="radio"][name="customColour"]:checked'), ':before').getPropertyValue('background-color').replace(/rgba\(|, 0\.85\)/g, ''),
        data = { time: time, status: 'O', enrols: '0,1', course: cid, component: title, location: [location], colour: colour };
    console.log(start, end);

    // Remove this course from customClasses list if it already exists
    for (var i = 0; i < customClasses.length; i += 1) {
        if (customClasses[i].course === cid) {
            customClasses.splice(i, 1);
            break;
        }
    }

    // Add this course to customClasses
    customClasses.push(data);

    // Add this to our visible course listing
    var courseDiv;

    // If the button is an 'Edit' button, remove the previous course
    if (document.getElementById('addcustom').innerHTML === 'Edit') {
        // Replace course
        $('#courses').children().filter(function (i, e) { return $(e).data('custom') === cid; }).remove();
        courseDiv = addCourse(title, true, false);
    } else {
        // Add new course
        courseDiv = addCourse(title, true);
    }

    courseDiv.data('custom', cid);
}

function showEdit(e) {
    'use strict';

    var row = $(e.target).parents('.row'),
        title = row.children().first().html(),
        div = row.parent(),
        course = div.data('custom'),
        data;
    for (var i = 0; i < customClasses.length; i += 1) {
        if (customClasses[i].course === course) {
            data = customClasses[i];
            break;
        }
    }

    // Retrieve start and end times and the day of the week
    var time = data.time.replace(/.* /, '').split('-'),
        day = data.time.replace(/ .*/, '');
    if (time.length === 1) {
        time[1] = time[0] + 1;
    }

    // Set customID to match
    document.getElementById('customID').value = course;

    // Change 'Add' button to 'Edit'
    document.getElementById('addcustom').innerHTML = 'Edit';

    // Update modal fields to match this data
    document.getElementById('customTitle').value = title;
    document.getElementById('customLocation').value = data.location;
    document.getElementById('startTime').value = to12H(time[0]);
    document.getElementById('endTime').value = to12H(time[1]);
    $('input[type="radio"][name="customColour"]').attr('checked', false).each(function (a, el) {
        if (getComputedStyle(el, ':before').getPropertyValue('background-color').replace(/rgba\(|, 0\.85\)/g, '') === data.colour) {
            $(el).attr('checked', true);
            return false;
        }
    });
    $('input[type="radio"][name="customDay"]').parent().removeClass('active'); // may not be needed?
    $('input[type="radio"][name="customDay"]').parent('[data-day="' + day + '"]').addClass('active');

    // Activate 'Add' button if necessary
    checkFields();
}

function timetableToPNG() {
    'use strict';

    var el = document.getElementById('timetable'),
        width = $(el).width();
    // Standardize timetable export size
    $(el).removeClass('scroll-x');
    $(el).width(720);

    domtoimage.toPng(el).then(function (png) {
        // Revert timetable properties
        $(el).addClass('scroll-x');
        $(el).css('width', 'auto');

        // Download the png image
        download(png, 'timetable.png', 'image/png');
    });
}


function hasClass(el, aclass) {
    'use strict';

    var str = ' ' + el.className + ' ';
    return str.indexOf(' ' + aclass + ' ') !== -1;
}

function createTable() {
    'use strict';

    var table = $('#timetable').find('.row'),
        head = '<div class="col col-1 head first"></div>' +
               '<div class="col head">Monday</div>' +
               '<div class="col head">Tuesday</div>' +
               '<div class="col head">Wednesday</div>' +
               '<div class="col head">Thursday</div>' +
               '<div class="col head">Friday</div>',
        body = '',
        newline = '<div class="w-100"></div>',
        startHour = 8,
        endHour   = 21,
        bodyFirst = function (hour, half) {
            var halfclass = 'small',
                hourID = hour;
            hour += ':00';
            if (half === true) {
                hourID += '_30';
                hour = '';
                halfclass = 'half';
            }
            return '<div class="col col-1 body first ' + halfclass + '" id="ttrow_' + hourID + '">' + (half ? '' : '<div>' + hour.replace('_', ':') + '</div>') + '</div>';
        },
        bodyNorm = function (hour, day, half) {
            var halfclass = '';
            if (half === true) {
                hour += '_30';
                halfclass = ' half';
            }
            return '<div class="col body' + halfclass + '" id="' + day + '_' + hour + '"></div>';
        },
        days = ['M', 'T', 'W', 'H', 'F'],
        i,
        hour,
        day,
        half;

    for (i = 0; i < (endHour - startHour) * 2; i += 1) {
        hour = startHour + Math.floor(i / 2);
        half = (i % 2 === 1);
        body += bodyFirst(hour, half);
        for (day = 0; day < days.length; day += 1) {
            body += bodyNorm(hour, days[day], half);
        }
        if (i !== (endHour - startHour) * 2 - 1) {
            body += newline;
        }
    }

    table.html(head + newline + body);
}

function showEmpty() {
    'use strict';

    // Show all timetable rows initially
    $('#timetable').find('.body').css('display', 'block');
}

function hideEmpty(minY, maxY) {
    'use strict';
    var timetablebody = $('#timetable').find('.body'),
        shadows = timetablebody.find('.class-shadow');

    // Hide all cells outside of the max and min Y offsets
    var i;
    for (i = 0; i < timetablebody.length; i += 1) {
        var cell = timetablebody[i],
            y = ttHeadHeight + ttCellHeight * (+cell.id.replace(/\D+_/, '').replace('_30', '') + 1);
        // NB: this Y value is actually the Y value for the hour after, so as to prevent rows from being hidden if a class starts on the halfhour
        if (y < minY || y > maxY) {
            cell.style.display = 'none';
        }
    }
}

function clearWarning() {
    var warning = document.getElementById('generateWarning');

    // update optionsMemory
    optionMemory.fullclasses = document.getElementById('fullclasses').checked;
    optionMemory.canclash = document.getElementById('canclash').checked;

    updateWarning(); // since we just updated our optionsMemory variable, this will remove the warning
}

function updateWarning() {
    var warning = document.getElementById('generateWarning');

    if (document.getElementById('fullclasses').checked !== optionMemory.fullclasses || document.getElementById('canclash').checked !== optionMemory.canclash) {
        warning.innerHTML = 'Some options have not yet taken effect. Please generate a new timetable to include these options.';
        warning.style.display = 'block';
    } else {
        warning.innerHTML = '';
        warning.style.display = 'none';
    }
}

function getColour(index) {
    'use strict';

	// Colour definitions (format: [highlight, normal]; 'r,g,b')
    var colours = [
        [19, 111, 225], // mid blue
        [160, 29, 33], // crimson
        [14, 147, 40], // green
        [102, 44, 145], // purple
        [255, 107, 0], // orange
        [10, 28, 210], // deepblue
        [238, 46, 20], // red (slightly pinked)
        [27, 98, 46] // darkgreen
    ];
	return colours[index % colours.length].join(',');
}

function startDrag(e, ui) {
    'use strict';

    var el = $(e.target),
        key = el.attr('id'),
        shadows = shadowList[key];
    shadows.fadeIn(200);
}

// End-of-drag callback function
function stopDrag(e, ui) {
    'use strict';

    // Snap element a to element b
    function snapTo($a, b) {
        // Detach a, then append it to b, then also set the positioning to be at an offset of (0, 0) from the parent
        $a.detach().appendTo(b).css({left: 0, top: 0});
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
            var matchingClass = $(this),
            // Find the corresponding shadow
                shadow = $(shadowList[matchingClass.attr('id')][index]);

            // Snap this class to it's shadow
            snapTo(matchingClass, shadow.parent());

            // Update the class capacity
            matchingClass.find('.class-capacity').html(shadow.data('capacity'));
            matchingClass.find('.class-location').html(shadow.data('location'));

            classLocations[matchingClass.attr('id')] = shadow.parent().attr('id');
        });
    }

    // Hide visible all shadows
    $('.class-shadow').fadeOut(200);
    saveState();
}

// Add push functionality to jQuery objects
$.fn.push = function (selector) {
    'use strict';

    Array.prototype.push.apply(this, $.makeArray($(selector)));
    return this;
};

// Returns an array containing all elements in arr where, when cast to a string, there are no duplicates
function unique(arr1, arr2) {
    'use strict';

    var uniqueArr1 = [],
        uniqueArr2 = [],
        strs = [],
        i;
    for (i = 0; i < arr1.length; i += 1) {
        if (strs.indexOf(String(arr1[i])) === -1) {
            uniqueArr1.push(arr1[i]);
            strs.push(String(arr1[i]));

            // Add arr2 element to keep in sync
            if (arr2 !== undefined) {
                uniqueArr2.push(arr2[i]);
            }
        }
    }

    // Replace passed in arrays with the unique versions
    for (i = 0; i < uniqueArr1.length; i += 1) {
        arr1[i] = uniqueArr1[i];
        if (arr2 !== undefined) {
            arr2[i] = uniqueArr2[i];
        }
    }

    // Remove extra items
    while (i < arr1.length) {
        arr1.pop();
        if (arr2 !== undefined) {
            arr2.pop();
        }
    }
}

function createClassDiv(title, location, capacity, id, colour, duration, container) {
    'use strict';
    var $div = $('<div>').attr('id', id).addClass('class-drag').draggable({
            stack: '.class-drag',
            scroll: true,
            containment: container,
            start: startDrag,
            stop: stopDrag
        }),
        div = $div[0];
    div.innerHTML = '<div>' + title + location + capacity + '</div>';
    div.style.position = 'absolute';
    div.style.backgroundColor = 'rgb(' + colour + ')';
    div.style.height = (ttCellHeight * duration) + 'px';

    return $div;
}

// Creates a draggable class element
function createClass(stream, courseID, done) {
    'use strict';

    var times = stream.time,
        capacity = stream.enrols,
        course = stream.course,
        component = stream.component,
        locations = stream.location,
        colour = stream.colour || getColour(courseID),
        time,
        location,
        i,
        id,
        duration,
        parentId,
        parent,
        div,
        title = '<div style="font-weight: bold">' + ((course.indexOf('custom') !== 0 && course !== 'CBS') ? course + ': ' + component : component) + '</div>',
        skips = 0,
        container = $('#timetable').find('.row');

    if (course.indexOf('custom') !== 0 && course !== 'CBS') {
        capacity = '<div class="class-capacity">' + capacity.replace(',', ' / ') + '</div>';
    } else {
        capacity = '';
    }

    for (i = 0; i < times.length; i += 1) {
        time = times[i];
        location = '<div class="class-location">' + locations[i] + '</div>';

        // Check that we haven't already created a shadow for this course, component and time
        // NB: checking the time is necessary for when there is messy data
        var key = time.join(',') + course + component;
        if (done.indexOf(key) === -1) {
            done.push(key);

            // Generate the id for this class
            id = course + component + '_' + (i - skips);

            // Calculate the duration of the class
            duration = time[2] - time[1];

            // Get the parent element
            parentId = (time[0] + '_' + time[1]).replace('.5', '_30');
            parent = $('#' + parentId);

            // Create the class div
            div = createClassDiv(title, location, capacity, id, colour, duration, container);
            div.appendTo(parent);

            // Add this div to the classList
            classList.push(div);

            if (!classLocations.hasOwnProperty(id)) {
                classLocations[id] = parentId;
            }
        } else {
            skips += 1;
        }
    }

    // Hide capacity if it shouldn't be showing
    if (!document.getElementById('showcap').checked) {
        $('.class-capacity').hide();
    }
    if (!document.getElementById('showloc').checked) {
        $('.class-location').hide();
    }
}

function createShadow(stream, courseID) {
    'use strict';

    var times = stream.time,
        group = stream.course + stream.component + '_',
        capacity = stream.enrols,
        locations = stream.location,
        colour = stream.colour || getColour(courseID),
        minY = Infinity,
        maxY = -Infinity;

    // No capacity for CBS events! (or custom events)
    if (group.indexOf('CBS') === 0 || stream.course.indexOf('custom') === 0) {
        capacity = '';
    }

    // Remove any duplicate times that might be hiding in there
    unique(times, locations);

    var i;
    for (i = 0; i < times.length; i += 1) {
        var time = times[i],
            timestr = time.join(','),
            location = locations[i],
            key = group + i,
            duration = time[2] - time[1],
            shadowHeight = ttCellHeight * duration,
            parentID = (time[0] + '_' + time[1]).replace('.5', '_30'),
            parent = $('#' + parentID),
            y = ttHeadHeight + time[1] * ttCellHeight,
            div;

        // Create the shadow div
        div = $('<div class="class-shadow">');
        div[0].style.backgroundColor = 'rgba(' + colour + ', 0.7)';
        div[0].style.height = shadowHeight + 'px';
        div.data('capacity', capacity.replace(',', ' / '));
        div.data('location', location.replace(',', ' / '));
        div.appendTo(parent);

        // Add to shadowList
        if (shadowList.hasOwnProperty(key)) {
            shadowList[key] = shadowList[key].push(div);
        } else {
            shadowList[key] = div;
        }

        minY = Math.min(minY, (parentID.indexOf('_30') === -1) ? y : y - ttCellHeight);
        maxY = Math.max(maxY, y + shadowHeight);
    }

    return {min: minY, max: maxY};
}

function restoreClasses() {
    'use strict';

    // Snap element a to element b
    function snapTo($a, b) {
        // Detach a, then append it to b, then also set the positioning to be at an offset of (0, 0) from the parent
        $a.detach().appendTo(b).css({position: 'absolute', left: 0, top: 0});
    }

    var key, currentClass, shadows, parent, shadow;
    for (key in classLocations) {
        if (classLocations.hasOwnProperty(key)) {
            currentClass = $('[id="' + key + '"]'); // don't replace with ('#' + key), it won't work!
            shadows = shadowList[key];
            parent = $('#' + classLocations[key]);
            shadow = parent.find(shadows);

            // Snap this class to it's shadow
            snapTo(currentClass, parent);

            // Update the class capacity
            currentClass.find('.class-capacity').html(shadow.data('capacity'));
        }
    }
}

function checkFields() {
    var start = document.getElementById('startTime'),
        end = document.getElementById('endTime'),
        startTime = to24H(start.value.replace(':00 ', '')),
        endTime = to24H(end.value.replace(':00 ', '')),
        day = $('input[type="radio"][name="customDay"]').parent('.active').data('day'),
        title = document.getElementById('customTitle'),
        button = document.getElementById('addcustom');

    if (endTime === undefined) {
        endTime = to12H(startTime + 1);
        end.value = endTime;
    }

    if (startTime === undefined || endTime === undefined || day === undefined) {
        return false;
    }

    if (endTime <= startTime) {
        end.style.color = 'red';
        button.disabled = true;
        return false;
    }

    button.disabled = false;
    end.style.color = '';
    return true;
}

function pageError(title, body) {
    var alert = $('<div>').addClass('alert alert-warning alert-dismissible fade show').attr('role', 'alert'),
        close = $('<button type="button" data-dismiss="alert" aria-label="Close">').addClass('close').html('<span aria-hidden="true">&times;</span>'),
        message = '<strong>' + title + '</strong> ' + body,
        space = $('#alert-space');
    alert.html(message).prepend(close);
    alert.appendTo(space);
    if (space.children().length > 3) {
        space.children().first().alert('close');
    }
}

function clearLists(pageload) {
    'use strict';

    classList = [];
    shadowList = {};
    if (pageload !== true) { classLocations = {}; }
}

(function () {
    "use strict";

    $(document).ready(function () {
        createTable();

        // Add event to toggle class capacities
        $('#showcap').change(function () {
            var divs = $('.class-capacity:parent');
            if (document.getElementById('showcap').checked === true) {
                divs.show();
            } else {
                divs.hide();
            }
        });

        // Add event to toggle class capacities
        $('#showloc').change(function () {
            var divs = $('.class-location:parent');
            if (document.getElementById('showloc').checked === true) {
                divs.show();
            } else {
                divs.hide();
            }
        });

        // Add events to save the state when options are changed
        $('.savedOption').change(function () {
            saveState();
        });

        // Add generateOption handler
        $('.generateOption').change(function () {
            updateWarning();
        });

        // Add save as image event
        $('#saveimage').click(function () {
            timetableToPNG();
        });

        // Add save as image event
        $('#addcustom').click(function () {
            addCustom();
        });

        // Always fix up customID and edit/add button in modal when closed
        $('#customClass').on('hidden.bs.modal', function () {
            // Set button text to "Add"
            document.getElementById('addcustom').innerHTML = 'Add';

            // Set customID to be empty
            document.getElementById('customID').value = '';
        });

        // Add save as image event
        $('.clockpicker input[type="text"]').change(function () {
            checkFields();
        });

        // Initialise tooltips
        $('[data-toggle="tooltip"]').tooltip({
            container: 'body'
        });
    });

    // Load course data from courses.json
    $.getJSON('data/timetable.json', function (data) {
        timetableData = data[0];
        metadata = data[1];

        $(document).ready(function () {
            var previousVisit;
            document.getElementById('meta-sem').innerHTML = metadata.sem;
            document.getElementById('meta-year').innerHTML = metadata.year;
            document.getElementById('meta-update').innerHTML = metadata.updated + ' at ' + metadata.uptimed;

            init_typeahead();

            // Check if this user has visited the page before
            previousVisit = Cookies.getJSON('prevVisit') || false;
            if (previousVisit === false) {
                // Show help page on first visit
                var visitorID = getRandomInt();
                Cookies.set('prevVisit', [visitorID, 1], { expires: 7 * 26 });
                $('#helppanel').modal('show');
            } else {
                // Restore previous state on later visits
                previousVisit[1] += 1;
                Cookies.set('prevVisit', previousVisit, { expires: 7 * 26 });
                restoreState(data);
            }

            // Initialise clockpickers (asynchronously)
            var start = $('#cp_start').clockpicker({
                placement: 'bottom',
                align: 'left',
                'default': 12,
                donetext: 'Done',
                twelvehour: true,
                amOrPm: 'PM',
                breakHour: 9,
                afterHourSelect: function () { start.clockpicker('update'); },
                afterUpdate: function() { checkFields(); }
            });
            var end = $('#cp_end').clockpicker({
                placement: 'bottom',
                align: 'left',
                'default': 12,
                donetext: 'Done',
                twelvehour: true,
                amOrPm: 'PM',
                breakHour: 10,
                afterHourSelect: function () { end.clockpicker('update'); },
                afterUpdate: function() { checkFields(); }
            });

            finishedInit = true;
        });
    });
}());
