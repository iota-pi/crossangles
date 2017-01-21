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
    timetables = {}
    
    faculties = getPages()
    for faculty in faculties:
        html = loadPage('http://classutil.unsw.edu.au/' + faculty)
        
        # Get course codes (and names)
        cc = getCourses(html)
        
        # Update dict of courses
        courses.update(dict(cc))
        
        # Get the timetable data
        timetableRaw = getTimetable(html)
        
        # Work out how many classes correspond to each of the courses
        prev = 0
        classCounts = []
        table = html.xpath('//table[3]')[0]
        for child in table:
            # NB: child here is a <tr> element, the course dividers have <td> children with class="cucourse"
            if child[0].get('class') == 'cucourse':
                i = table.index(child)
                if i - prev - 1 != 0:
                    classCounts.append(i - prev - 1)
                prev = i
            # Check for the end of the table (signalled by unclassed row without it being a table header or course divider)
            elif child.get('class') == None and child[0].get('class') != 'cutabhead':
                i = table.index(child)
                classCounts.append(i - prev - 1)
                break
        
        # Reconcile timetable data with course codes
        timetable = {}
        for i in range(len(classCounts)):
            count = classCounts[i]
            timetable[cc[i][0]] = timetableRaw[:count]
            del timetableRaw[:count]
        
        # Update dict of timetables
        timetables.update(timetable)
        break
    
    # TEMP, debugging only
    for key, val in timetables.items():
        print(key, '->', val)
    # END TEMP

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
    
    # Convert to array of pairs course codes first and names second (i.e. ready to be put into a dict)
    iterator = iter(courses)
    courses = list(zip(iterator, iterator))
    
    return courses

def getTimetable(tree):
    # Get course components and names in a list.
    component = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[1]/text()')
    status    = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[5]/text()')
    capacity  = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[6]/text()')
    timetable = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[8]/text()')
    
    times = []
    weeks = []
    locations = []
    for timestring in timetable:
        # Skip any classes without timetable data
        if timestring.strip() == '':
            continue
        
        time, running, location = splitTimetableData(timestring)
        
        times.append(time)
        weeks.append(running)
        locations.append(location)
    
    return list(zip(component, status, capacity, times, weeks, locations))

def splitTimetableData(string):
    # Get first half of timetable string containing day of week and time of day info
    time = string.split('(', maxsplit=1)[0].strip()

    # Process weeks where class is running
    weeks = string.split('(', maxsplit=1)[1].split(' ')[0].strip('w,)')
    weeks = expandRanges(weeks)

    # Get location if available
    if ')' in string:
        location = re.sub(r'.*, ', '', string[string.index('('):-1])

    return time, weeks, location

#
# loadPage(): takes a URL and returns an HTML tree from the page data at that URL
# NB:         this is synchronous
#
def loadPage(url):
    page = getURL(url)
    tree = html.fromstring(page.content)
    tree = stripComments(tree)
    return tree

#
# stripComments(): removes all HTML comments from parsed HTML (required for traversing child nodes without error)
#
def stripComments(tree):
    comments = tree.xpath('//comment()')

    for c in comments:
        p = c.getparent()
        p.remove(c)
    
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
