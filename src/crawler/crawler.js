"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
process.env.APIFY_LOCAL_STORAGE_DIR = './apify_storage';
process.env.APIFY_LOG_LEVEL = 'WARNING';
var Apify = require("apify");
var Course_1 = require("../state/Course");
var state_1 = require("../state");
var fs_1 = require("fs");
var CBS_DATA = require('./cbs.json');
var OUTPUT_DATA_FILE = './public/data2.json';
var CLASSUTIL_BASE = 'http://classutil.unsw.edu.au';
var crawl = function (term) { return __awaiter(_this, void 0, void 0, function () {
    var findFacultyPages, crawlFacultyPages, generateMetaData, facultyPages, courses, meta, data;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                findFacultyPages = function () { return __awaiter(_this, void 0, void 0, function () {
                    var links, linkRegex;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                links = [];
                                linkRegex = new RegExp("[A-Y][A-Z]{3}_[ST]" + term + ".html$");
                                return [4 /*yield*/, crawlPages([CLASSUTIL_BASE], function (_a) {
                                        var $ = _a.$;
                                        return __awaiter(_this, void 0, void 0, function () {
                                            var matchingLinks;
                                            return __generator(this, function (_b) {
                                                matchingLinks = $('a').filter(function (i, e) { return linkRegex.test($(e).attr('href')); });
                                                links.push.apply(links, matchingLinks.map(function (i, e) { return $(e).attr('href'); }));
                                                return [2 /*return*/];
                                            });
                                        });
                                    })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, links];
                        }
                    });
                }); };
                crawlFacultyPages = function (pages) { return __awaiter(_this, void 0, void 0, function () {
                    var courses, urls, _i, courses_1, course;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                courses = [];
                                urls = pages.map(function (page) { return CLASSUTIL_BASE + "/" + page; });
                                return [4 /*yield*/, crawlPages(urls, function (_a) {
                                        var $ = _a.$;
                                        return __awaiter(_this, void 0, void 0, function () {
                                            var rows;
                                            return __generator(this, function (_b) {
                                                rows = $($('table').get(2)).find('tr').slice(1);
                                                rows.map(function (i, e) {
                                                    var cells = $(e).find('td');
                                                    if (cells.length === 1) {
                                                        // One cell in a row is the end of the table
                                                        return false;
                                                    }
                                                    else if (cells.length === 2) {
                                                        // Two cells in a row is the start of a course
                                                        courses.push(Course_1["default"].from({
                                                            code: $(cells.get(0)).text(),
                                                            name: $(cells.get(1)).text()
                                                        }));
                                                    }
                                                    else if (cells.length === 8) {
                                                        // Eight cells in a row is a stream of the most recent course
                                                        courses[courses.length - 1].addStream({
                                                            component: $(cells.get(0)).text(),
                                                            section: $(cells.get(1)).text(),
                                                            status: $(cells.get(4)).text(),
                                                            enrols: $(cells.get(5)).text(),
                                                            times: $(cells.get(7)).text()
                                                        });
                                                    }
                                                });
                                                return [2 /*return*/];
                                            });
                                        });
                                    })];
                            case 1:
                                _a.sent();
                                // Remove duplicate streams from each course
                                for (_i = 0, courses_1 = courses; _i < courses_1.length; _i++) {
                                    course = courses_1[_i];
                                    course.removeDuplicates();
                                }
                                // Add CBS "course" data
                                courses.push(new Course_1["default"](__assign({}, CBS_DATA, { streams: CBS_DATA.streams.map(function (s) { return new state_1.Stream(s); }) })));
                                // Sort courses for consistency
                                courses.sort(function (a, b) { return a.code.localeCompare(b.code); });
                                return [2 /*return*/, courses];
                        }
                    });
                }); };
                generateMetaData = function () {
                    var zfill = function (x, n) {
                        if (n === void 0) { n = 2; }
                        return x.toString().padStart(n, '0');
                    };
                    var now = new Date();
                    var currentYear = now.getFullYear();
                    var currentMonth = now.getMonth();
                    var currentDay = now.getDate();
                    return {
                        term: term,
                        signup: process.env.SIGN_UP,
                        year: term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear,
                        updateDate: zfill(currentDay) + "/" + zfill(currentMonth + 1) + "/" + currentYear,
                        updateTime: zfill(now.getHours()) + ":" + zfill(now.getMinutes())
                    };
                };
                return [4 /*yield*/, findFacultyPages()];
            case 1:
                facultyPages = _a.sent();
                return [4 /*yield*/, crawlFacultyPages(facultyPages)];
            case 2:
                courses = _a.sent();
                meta = generateMetaData();
                data = JSON.stringify({ courses: courses, meta: meta });
                fs_1.writeFileSync(OUTPUT_DATA_FILE, data, 'utf-8');
                return [2 /*return*/];
        }
    });
}); };
var crawlPages = function (urls, handler) { return __awaiter(_this, void 0, void 0, function () {
    var requestList, crawler;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestList = new Apify.RequestList({
                    sources: urls.map(function (url) { return ({ url: url }); })
                });
                return [4 /*yield*/, requestList.initialize()];
            case 1:
                _a.sent();
                crawler = new Apify.CheerioCrawler({
                    requestList: requestList,
                    handlePageFunction: handler
                });
                return [4 /*yield*/, crawler.run()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// TODO crawl multiple terms (in reverse order) to find most recent term with enough data
crawl(2).then(function () {
    console.log('done!!');
})["catch"](function (e) {
    console.log(e);
});
