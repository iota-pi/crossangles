/* page.js
 *
 * JS file to handle animations, etc.
 *
 * Authors: David Adams
 */

/* --- JSHint Options --- */
/*jshint browser: true, regexp: true */
/*global $, console, domtoimage, download, Cookies, generate, objectFitImages */

var finishedInit = false,
    courseList = ['CBS'],
    classList = [],
    shadowList = {},
    classLocations = {},
    ttCellHeight = 50,
    ttHeadHeight = 40,
    waitingScripts = 0,
    timetableData = {},
    components_index = {},
    locations_index = {},
    times_index = {},
    metadata = {},
    customClasses = [],
    optionMemory = {};

/* init_typeahead()
 * Initialises the linked input and dropdown list used for entering courses
 */
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

/* restoreState()
 * Restores the page to a previously saved state (i.e. by calling saveState)
 * Mostly used during page load
 */
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

/* saveState()
 * Uses cookies to store chosen courses, options, and class locations
 */
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

/* restoreClasses()
 * Restore classes to their previous locations
 * Called after generate() on a page load if there is previous class location data
 */
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

/* removeCourse()
 * Removes a course from the selected courses list
 */
function removeCourse(e) {
    'use strict';

    var row = $(e.currentTarget).parents('.course'),
        div = row.children().first(),
        course = div.html().replace(/ -.+/, '');

    // Remove this course from the list of courses
    if (row.data('custom') !== false) {
        for (var i = 0; i < customClasses.length; i += 1) {
            if (customClasses[i].course === row.data('custom')) {
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
        row.slideUp(200, function () {
            row.remove();

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
        edit = $('<span>').addClass('glyphicon glyphicon-edit glyphicon-clickable edit-icon')
                          .attr('data-toggle', 'tooltip').attr('title', 'Edit')
                          .attr('aria-hidden', true)
                          .attr('data-toggle', 'modal')
                          .attr('data-target', '#customClass')
                          .click(showEdit),
        rightCol = $('<div>').append(remove),
        bothIcons = (custom !== true) ? rightCol : rightCol.prepend(edit),
        div = $('<div class="course">').html('<div>' + course + '</div>')
                        .append(bothIcons)
                        .data('custom', false);

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

/* to24H()
 * Turns a time string in the format of '11:00 AM' into a number in the range of 0..23.5
 */
function to24H(time) {
    if (time === undefined || time.length === 0) { return undefined; }

    var hour = parseInt(time.replace(/\D.*/, '')) % 12,
        halfHour = parseInt(time.replace(/\d+:/, '').replace(/ .M/, '')) !== 0;
    return hour + ((time.indexOf('PM') !== -1) ? 12 : 0) + (halfHour ? 0.5 : 0);
}

/* to12H()
 * Turns a number in the range of 0..23.5 into a time string in the format of '11:00 AM'
 */
function to12H(hour_24) {
    if (hour_24 === undefined || hour_24 === '') { return undefined; }

    var hour = Math.floor((hour_24 % 12 === 0) ? 12 : hour_24 % 12),
        minutes = (hour_24 % 1 === 0) ? '00' : '30',
        time = ((hour < 10) ? '0' + hour : hour) + ':' + minutes + ' ' + ((hour_24 >= 12) ? 'PM' : 'AM');
    return time;
}

/* getRandomInt()
 * Gets a ... random int!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min || 0);
    max = Math.floor(max || 1e6);
    return Math.floor(Math.random() * (max - min)) + min;
}

/* uniqueID()
 * Generates a unique ID for a custom course
 * Unique IDs are an integer in range 0..1e6
 */
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

/* addCustom()
 * Adds a custom course using data taken from the respective modal form
 */
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

/* showEdit()
 * Displays modal for editing custom classes
 */
function showEdit(e) {
    'use strict';

    var row = $(e.target).parents('.course'),
        title = row.children().first().html(),
        course = row.data('custom'),
        data;
    for (var i = 0; i < customClasses.length; i += 1) {
        if (customClasses[i].course === course) {
            data = customClasses[i];
            break;
        }
    }
    if (data === undefined) {
        pageError('Oops!', 'The list of your courses has become a bit confused. Please try reloading the page, or adding your courses again.');
    }

    // Retrieve start and end times and the day of the week
    var time = data.time.replace(/.* /, '').split('-'),
        day = data.time.replace(/ .*/, '');
    if (time.length === 1) {
        time[1] = +time[0] + 1;
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

/* checkFields()
 * Checks if all the fields in the custom class modal are validly filled in
 */
function checkFields() {
    var start = document.getElementById('startTime'),
        end = document.getElementById('endTime'),
        startTime = to24H(start.value),
        endTime = to24H(end.value),
        day = $('input[type="radio"][name="customDay"]').parent('.active').data('day'),
        title = document.getElementById('customTitle').value,
        button = document.getElementById('addcustom');

    // If start time has just been set, but no end time yet, initialise end time to startTime + 1 hour
    if (endTime === undefined && startTime !== undefined) {
        endTime = to12H(startTime + 1);
        end.value = endTime;
    }

    // Make sure both a start and end time has been chosen
    if (startTime === undefined || endTime === undefined) {
        button.disabled = true;
        return false;
    }

    // Make end-time be red if it is before (or the same time as) the start time
    if (endTime <= startTime) {
        end.style.color = 'red';
        button.disabled = true;
        return false;
    } else {
        end.style.color = '';
    }

    // Make sure day is set
    // NB: should be done after colour setting
    if (day === undefined || title === undefined || title === '') {
        button.disabled = true;
        return false;
    }

    // No problems found
    button.disabled = false;
    return true;
}

/* canSaveTimetable()
 * Returns whether timetableToPNG can be run in this browser
 */
function canSaveTimetable() {
    //jshint ignore:start
    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    var isIE = /*@cc_on!@*/false || !!document.documentMode; // IE 6-11
    var isEdge = !isIE && !!window.StyleMedia;
    return !isSafari && !isEdge && !isIE;
    //jshint ignore:end
}

/* timetableToPNG()
 * Turns timetable DOM into a PNG and downloads it
 * NB: no IE or Safari support!
 */
function timetableToPNG() {
    'use strict';

    var el = document.getElementById('timetable'),
        width = $(el).width();
    // Standardize timetable export size
    $(el).removeClass('scroll-x');
    $(el).width(720);

    var topng = canSaveTimetable();

    if (topng) {
        domtoimage.toPng(el).then(function (png) {
            // Revert timetable properties
            $(el).css('width', 'auto');
            $(el).addClass('scroll-x');

            // Download the png image
            download(png, 'timetable.png', 'image/png');
        });
    } else {
        domtoimage.toSvg(el).then(function (svg) {
            // Revert timetable properties
            $(el).addClass('scroll-x');
            $(el).css('width', 'auto');

            // Download the svg image
            download(svg, 'timetable.svg', 'image/svg+xml');
        });
    }
}

/* hasClass()
 * Checks if given DOM element has a particular class applied to it
 */
function hasClass(el, aclass) {
    'use strict';

    var str = ' ' + el.className + ' ';
    return str.indexOf(' ' + aclass + ' ') !== -1;
}

/* createTable()
 * Creates the many <div>s in the timetable
 */
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

    // Build up an HTML string containing all of the component <div>s
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

    // Fill the timetable element with these <div>s
    table.html(head + newline + body);
}

/* showEmpty()
 * Makes all rows in the timetable visible
 */
function showEmpty() {
    'use strict';

    // Show all timetable rows initially
    $('#timetable').find('.body').css('display', null);
}

/* hideEmpty()
 * Hides any rows in the timetable which have no possible classes in them
 */
function hideEmpty(minY, maxY) {
    'use strict';
    var timetablebody = $('#timetable').find('.body');

    // Hide all cells outside of the max and min Y offsets
    var i;
    for (i = 0; i < timetablebody.length; i += 1) {
        var cell = timetablebody[i],
            y = ttHeadHeight + ttCellHeight * (+cell.id.replace(/\D+_/, '').replace('_30', ''));
        if (y < minY || y >= maxY) {
            cell.style.display = 'none';
        }
    }
}

/* clearWarning()
 * Called in preparation for timetable generation
 * Stores option status as of the beginning of timetable generation and hides the warning message about not yet active options
 */
function clearWarning() {
    var warning = document.getElementById('generateWarning');

    // update optionsMemory
    optionMemory.fullclasses = document.getElementById('fullclasses').checked;
    optionMemory.canclash = document.getElementById('canclash').checked;

    updateWarning(); // since we just updated our optionsMemory variable, this will remove the warning
}

/* updateWarning()
 * Shows or hides the warning about not yet active options depending on if they have been changed since last generation or not
 */
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

/* getColour()
 * Returns a colour for a class
 * There are only 7 colours, after colour #7, they will loop around
 */
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

/* startDrag()
 * Handler for when a class starts being dragged around
 * Shows shadows for the relevant course, and displays the class and other linked classes as 'locked' (i.e. stripy)
 */
function startDrag(e, ui) {
    'use strict';

    var el = $(e.target),
        key = el.attr('id'),
        shadows = shadowList[key];
    shadows.fadeIn(200);

    // Mark locked classes
    $('.class-drag[id^="' + key.replace(/\d$/, '') + '"]').addClass('locked');
}

/* startDrag()
 * Handler for when a class stops being dragged around
 * Snap to nearest shadow (if there is one near enough), hide shadows, update data fields such as class capacity/location, etc.
 */
function stopDrag(e, ui) {
    'use strict';

    // Snap element a to element b
    function snapTo($a, b) {
        // Detach a, then append it to b, then also set the positioning to be at an offset of (0, 0) from the parent
        // NB: null will make it revert to its default value of 0
        $a.detach().appendTo(b).css({left: 0, top: 0, position: null});
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

            // Update z-index if this class has moved
            if (classLocations[matchingClass.attr('id')] !== shadow.parent().attr('id')) {
                matchingClass.css('z-index', drag.css('z-index'));
            }

            // Store class location (used when calling saveState)
            classLocations[matchingClass.attr('id')] = shadow.parent().attr('id');
        });
    }

    // Hide visible all shadows
    $('.class-shadow').fadeOut(200);

    // Remove locked effect
    $('.class-drag.locked').removeClass('locked');

    // Save new state
    saveState();
}

// Add push functionality to jQuery objects
$.fn.push = function (selector) {
    'use strict';

    Array.prototype.push.apply(this, $.makeArray($(selector)));
    return this;
};

/* unique()
 * Modifies given array to remove all elements where, when cast to a string, there are no duplicates
 * A second array can be provided, and it shall have corresponding elements removed.
 * e.g. unique([0,1,2,1], [1,1,5,2]) -> [0,1,2], [1,1,5]
 * NB: it doesn't matter what values the second array contains
 */
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

/* createClassDiv()
 * Creates the DOM for the draggable <div> for a class
 */
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

    return $div;
}

/* createClass()
 * Creates the draggable div for a class
 */
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
            if (capacity === '') {
                div.addClass('nocapacity');
            }
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

/* createShadow()
 * Creates shadows for course streams
 */
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
        div.data('capacity', capacity.replace(',', ' / '));
        div.data('location', location.replace(',', ' / '));
        div.appendTo(parent);

        // Add to shadowList
        if (shadowList.hasOwnProperty(key)) {
            shadowList[key] = shadowList[key].push(div);
        } else {
            shadowList[key] = div;
        }

        minY = Math.min(minY, (parentID.indexOf('_30') === -1) ? y : y - ttCellHeight / 2);
        maxY = Math.max(maxY, y + shadowHeight);
    }

    return {min: minY, max: maxY};
}

/* pageError()
 * Displays an error on the page (visible to user)
 * Display is just above timetable. Limit of 3 messages in the alert space
 */
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

/* pageNotice()
 * Displays a notice (green) on the page
 * Display is just above timetable
 */
function pageNotice(title, body) {
    var alert = $('<div>').addClass('alert alert-success alert-dismissible fade show').attr('role', 'alert'),
        close = $('<button type="button" data-dismiss="alert" aria-label="Close">').addClass('close').html('<span aria-hidden="true">&times;</span>'),
        message = '<strong>' + title + '</strong> ' + body,
        space = $('#alert-space');
    alert.html(message).prepend(close);
    alert.appendTo(space);
    if (space.children().length > 3) {
        space.children().first().alert('close');
    }
}

/* clearLists()
 * Clears lists of classes and shadows
 */
function clearLists(pageload) {
    'use strict';

    classList = [];
    shadowList = {};
    if (pageload !== true) { classLocations = {}; }
}

/* checkVisible()
 * Checks if the given DOM element is visible (optionally, if it is fully visible)
 * Used by moveClockPicker
 */
function checkVisible(elm, full) {
    var rect = elm.getBoundingClientRect(),
        viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    if (full) {
        return !(rect.top < 0 || rect.bottom >= viewHeight);
    }
    return !(rect.bottom < 0 || rect.top >= viewHeight);
}


/* checkVisible()
 * Checks if the clockpicker is fully visible (and moves it such that it is)
 * Without this, on mobile devices, the clock face is only partially visible
 */
function moveClockPicker(cp) {
    // Find correct clockpicker element
    var popovers = $('.popover.clockpicker-popover'),
        popover;
    if (cp[0].id === 'cp_start') {
        popover = popovers.first()[0];
    } else {
        popover = popovers.last()[0];
    }

    // Do some maths
    var bb = popover.getBoundingClientRect(),
        viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight),
        diff = bb.bottom - viewHeight;

    // Move clockpicker up if it's below the bottom of the screen
    console.log(popover, diff);
    if (diff > 0) {
        console.log(popover.style.top);
        popover.style.top = +popover.style.top.replace('px', '') - diff + 'px';

        // Hide arrow unless whole of clockpicker is visible
        $(popover).find('.arrow').hide();
    } else {
        $(popover).find('.arrow').show();
    }
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

        if (canSaveTimetable()) {
            // Add save as image event
            $('#saveimage').click(function () {
                timetableToPNG();
            });
        } else {
            document.getElementById('saveimage').style.display = 'none';
            document.getElementById('noTimetableDownload').style.display = 'block';
        }

        // Add custom class onclick event
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

        // Check if all fields are valid in custom modal
        $('#customClass input').change(function () { checkFields(); });
        $('#customClass input[type="text"]').keyup(function () { checkFields(); });

        // Initialise tooltips
        $('[data-toggle="tooltip"]').tooltip({
            container: 'body'
        });

        // Initialise IE/Edge object-fit polyfill
        objectFitImages();
    });

    // Load course data from courses.json
    $.getJSON('data/timetable.json', function (data) {
        function zfill(str, n) {
            str = '' + str; // Make sure str is actually a string
            while (str.length < n) {
                str += '0';
            }
            return str;
        }

        var faculty, course;
        for (faculty in data[0]) {
            if (data[0].hasOwnProperty(faculty)) {
                for (course in data[0][faculty]) {
                    if (data[0][faculty].hasOwnProperty(course)) {
                        timetableData[faculty + zfill(course, 4)] = data[0][faculty][course];
                    }
                }
            }
        }
        components_index = data[1];
        locations_index = data[2];
        times_index = data[3];
        metadata = data[4];

        $(document).ready(function () {
            var previousVisit;
            document.getElementById('meta-sem').innerHTML = metadata.sem;
            document.getElementById('meta-year').innerHTML = metadata.year;
            document.getElementById('meta-update').innerHTML = metadata.updated + ' at ' + metadata.uptimed;

            // Initialise typeahead (linked text and dropdown list)
            init_typeahead();

            // Check if this user has visited the page before
            previousVisit = Cookies.getJSON('prevVisit') || false;
            if (previousVisit === false) {
                // Show help page on first visit
                var visitorID = getRandomInt();
                Cookies.set('prevVisit', [visitorID, 1], { expires: 7 * 26 });
                $('#helppanel').modal('show');

                // Remind users that they can drag classes around
                pageNotice('Did you know?', 'You can move classes around in the timetable below to suit you better!');
            } else {
                // Restore previous state on later visits
                previousVisit[1] += 1;

                if (previousVisit[1] % 3 === 0) {
                    pageNotice('Did you know?', 'You can move classes around in the timetable below to suit you better!');
                }

                Cookies.set('prevVisit', previousVisit, { expires: 7 * 26 });
                restoreState(data);
            }

            // Initialise clockpickers
            // TODO: move this to when modal is first displayed
            var start = $('#cp_start').clockpicker({
                placement: 'bottom',
                align: 'left',
                'default': 12,
                twelvehour: true,
                amOrPm: 'PM',
                breakHour: 9,
                afterShow: function () { moveClockPicker(start); },
                afterUpdate: function() { checkFields(); }
            });
            var end = $('#cp_end').clockpicker({
                placement: 'bottom',
                align: 'left',
                'default': 12,
                twelvehour: true,
                amOrPm: 'PM',
                breakHour: 9.5,
                afterShow: function () { moveClockPicker(end); },
                afterUpdate: function() { checkFields(); }
            });

            finishedInit = true;
        });
    });
}());
