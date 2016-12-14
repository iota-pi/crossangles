/* typeahead.js
 *
 * JS to do a better job than https://github.com/twitter/typeahead.js
 *
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true*/
/*global $, jQuery, console, addcourse, setTimeout */

(function () {
    "use strict";
    
    function escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
    
    $.fn.typeahead = function (data) {
        var wrapper, menu;
        wrapper = $('<div class="typeahead-container"></div>');
        menu = $('<div class="dropdown-menu"></div>');
        
        // Add elements to DOM
        this.wrap(wrapper);
        menu.insertAfter(this);
        
        this.keyup(function (e) {
            var el = $(this),
                val = el.val(),
                re = new RegExp('(' + escapeRegExp(val) + ')', 'gi'),
                cb = function (data) {
                    menu.hide();
                    menu.empty();
                    $.each(data, function (i, item) {
                        var str, dditem, skip;
                        // Skip already complete ones
                        if (val.toLowerCase() === item.toLowerCase()) { return true; }
                        
                        // Skip already added courses
                        skip = false;
                        $('#courses').find('td').each(function () {
                            if ($(this).html() === item) {
                                skip = true;
                                return false;
                            }
                        });
                        if (skip) { return true; }
                        
                        // Add this course to the dropdown
                        str = item.replace(re, '<strong>$1</strong>');
                        dditem = $('<div class="dd-item"></div>');
                        dditem.html(str);
                        dditem.click(function () { el.val(''); addcourse(item); menu.slideUp(200); });
                        menu.append(dditem);
                        
                        // Ensure the menu is being shown
                        menu.show();
                    });
                };
            if (val) {
                data.source(val, cb);
            } else {
                cb();
            }
        });
        
        this.focusout(function () {
            menu.slideUp(200);
        });
    };
    
}());
