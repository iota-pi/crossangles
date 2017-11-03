/* typeahead.js
 *
 * Connected text input and dropdown list.
 * Similar to https://github.com/twitter/typeahead.js (but better!)
 * 
 * Authors: David Adams
 */

/* --- JSLint Options --- */
/*jslint browser: true*/
/*global $, jQuery, addCourse */

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
        
        this.keydown(function (e) {
            // Check for Up and Down keypresses
            var focus;
            if (e.which === 38 || e.which === 40) {
                if ($('.dropdown-menu').find('div.focus').length !== 0) {
                    focus = $('.dropdown-menu').find('div.focus');
                    if (e.which === 38) {
                        if (focus.prev('div.dd-item').length !== 0) {
                            focus.removeClass('focus');
                            focus.prev('div.dd-item').addClass('focus');
                        }
                    }
                    if (e.which === 40) {
                        if (focus.next('div.dd-item').length !== 0) {
                            focus.removeClass('focus');
                            focus.next('div.dd-item').addClass('focus');
                        }
                    }
                }
                e.preventDefault();
            }
        });
        
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
                        str = item.replace(re, '<strong>$1</strong>').replace('-', '&mdash;');
                        dditem = $('<div class="dd-item"></div>');
                        dditem.html(str);
                        dditem.addClass('noselect');
                        dditem.click(function () { el.val(''); addCourse(item); menu.slideUp(200); });
                        dditem.mousemove(function (e) { $('div.dd-item').removeClass('focus'); $(e.currentTarget).addClass('focus'); });
                        menu.append(dditem);
                        
                        // Ensure the menu is being shown
                        menu.show();
                    });
                    $('div.dd-item').first().addClass('focus');
                };
            // Check for Enter keypresses
            if (e.which === 13) {
                if ($('.dropdown-menu').find('div.focus').length !== 0) {
                    el.val('');
                    addCourse($('.dropdown-menu').find('div.focus').html().replace(/<\/?strong>/gi, ''));
                    menu.slideUp(200);
                }
            }
            
            // Check for Up and Down keypresses
            if (e.which === 38 || e.which === 40) {
                e.preventDefault();
                return;
            }
            if (e.which === 27) {
                cb();
            }
            
            if (val) {
                data.source(val, cb);
            } else {
                cb();
            }
        });
        
        // Hide dropdown menu when focus is lost
        this.focusout(function () {
            var el = $(this);
            if ($('.dd-item:active').length === 0) {
                menu.slideUp(200);
            } else {
                menu.mouseout(function (e) {
                    if (!el.is(':focus')) {
                        menu.slideUp(200);
                    }
                });
            }
        });
    };
    
}());
