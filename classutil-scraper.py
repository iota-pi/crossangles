#!/usr/bin/python3

from lxml import html
import requests
import json
import time
import re

bytecount = 0
semcodes = {'sem1': 2, 'sem2': 3, 'summer': 1}
semester = semcodes['sem1']

def main():
    courses = {}
    timetable = {}
    
    faculties = getPages()
    for faculty in faculties:
        tree = loadPage('http://classutil.unsw.edu.au/' + faculty)
        
        courses.update(getCourses(tree))
        timetable.update(getTimetable(tree))
        break
    
    #print(courses)

def getPages():
    global semester
    tree = loadPage('http://classutil.unsw.edu.au/')
    links = tree.xpath('//td[' + str(semester) + '][@class="data"]/a[contains(@href,".html")]/@href')
    return links

def getCourses(tree):
    # Get course codes and names in a list.
    # NB: this retrieves in a single list, with alternating course code and name
    courses = tree.xpath('//td[@class="cucourse"]//text()')
    
    # Remove strange characters (&nbsp;) from course codes
    courses = map(lambda s: s.replace('\xa0',''), courses)
    
    # Convert to dict with course codes as keys and names as values
    iterator = iter(courses)
    course_dict = dict(zip(iterator, iterator))
    
    return course_dict

def getTimetable(tree):
    # Get course codes and names in a list.
    # NB: this retrieves in a single list, with alternating course code and name
    component = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[1]/text()')
    status    = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[5]/text()')
    capacity  = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[6]/text()')
    timetable = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[8]/text()')
    
    temp = []
    for timestring in timetable:
        # Skip any classes without timetable data
        if timestring.strip() == '':
            continue
        
        # Get first half of timetable string containing day of week and time of day info
        time = timestring.split('(', maxsplit=1)[0].strip()
        
        # Process weeks where class is running
        weeks = timestring.split('(', maxsplit=1)[1].split(' ')[0].strip('w,)')
        weeks = expandRanges(weeks)
        
        # Get location if available
        if ')' in timestring:
            location = re.sub(r'.*, ', '', timestring[timestring.index('('):-1])
        
        print(time, '>', weeks, '>', location)
    
    #print(component)
    #print(status)
    #print(capacity)
    #print(timetable)
    
    # component, status, capacity, day&time, weeks, location
    
    return {}

#
# loadPage(): takes a URL and returns an HTML tree from the page data at that URL
# NB:         this is synchronous
#
def loadPage(url):
    page = getURL(url)
    tree = html.fromstring(page.content)
    return tree

#
# getURL(): synchronously gets the contents of the page at the given URL
#
def getURL(url):
    global bytecount
    response = requests.get(url)
    bytecount += len(response.content)
    return response

#
# politeDelay(): a little small talk while we temporarily stop spamming UNSW's servers
#
def politeDelay(s=1):
    time.sleep(s)

#
# expandRanges(): changes strings of format e.g. "1-4,6,10-12" to "1,2,3,4,6,10,11,12"
#
def expandRanges(string):
    expanded = []
    for x in string.split(','):
        if '-' not in x:
            expanded.append(x)
        else:
            a, b = x.split('-')
            expanded.append(','.join(map(str, list(range(int(a), int(b) + 1)))))
    return ','.join(expanded)

if __name__ == '__main__':
    main()
