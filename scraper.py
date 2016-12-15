#!/usr/bin/python3

from lxml import html
import requests
import json
import time

YEAR = '2017'
bytecount = 0

def main():
    global YEAR, bytecount
    
    courses = {}
    timetable = {}
    
    # Get faculty pages
    fpages = getPages()
    for fpage in fpages:
        # Get course pages
        pages = getPages(fpage)
        
        for uri_end in pages:
            page = loadPage('http://timetable.unsw.edu.au/' + YEAR + '/' + uri_end)
            course = getCourseName(page)
            courses[course[0]] = course[1]
            data = getTimetable(page)
            timetable[course[0]] = data
            print('Completed course', course[0], '(' + str(bytecount) + ' bytes downloaded)', end='\r')
            
        if len(courses) != 0:
            with open('data/courses.json', 'w') as f:
                json.dump(courses, f)
            with open('data/timetable.json', 'w') as f:
                json.dump(timetable, f)
        
        # ... a polite little delay
        politeDelay()
    
    print()

#
# getPages(): finds all subpages linked in tables (works for either faculty or course pages)
#             NB: a faculty page contains a list of all courses in the faculty, while a course page contains the timetable data for that course
#
def getPages(fpage='subjectSearch.html'):
    global YEAR
    tree = loadPage('http://timetable.unsw.edu.au/' + YEAR + '/' + fpage)
    links = tree.xpath('//tr/td[1][@class="data"]/a[contains(@href,".html")]/@href')
    return links

#
# getCourseName(): takes an HTML tree as input and searches it to find the course code + name
#
def getCourseName(page):
    text = page.xpath('//td[@class="classSearchMinorHeading"]/text()')
    return text[0].split(' ', 1)

#
# getTimetable(): takes an HTML tree as input and searches it to find the timetable data for this course
# Return format:  ((activity-type, teaching-period, enrols/capacity, timetable), ...)
#
def getTimetable(page):
    activity = page.xpath('//tr[count(td)=7]/td[1][@class="data"]//text()')
    period   = page.xpath('//tr[count(td)=7]/td[2][@class="data"]//text()')
    space    = page.xpath('//tr[count(td)=7]/td[6][@class="data"]//text()')
    times    = page.xpath('//tr[count(td)=7]/td[7][@class="data"]//text()')
    smalltime= [time.replace('Weeks:', '').replace('(','').replace(')','') for time in times]
    return tuple(zip(activity, period, space, smalltime))

#
# loadPage(): takes a URI and returns an HTML tree from the page data at that URI
# NB:         this is synchronous
#
def loadPage(uri):
    page = getURI(uri)
    tree = html.fromstring(page.content)
    return tree

#
# getURI(): synchronously gets the contents of the page at the given URI
#
def getURI(uri):
    global bytecount
    response = requests.get(uri)
    bytecount += len(response.content)
    return response

#
# politeDelay(): a little small talk while we temporarily stop spamming UNSW's servers
#
def politeDelay(s=1):
    time.sleep(s)

if __name__ == '__main__':
    main()
