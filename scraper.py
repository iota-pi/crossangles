#!/usr/bin/python3
#
# scraper.py
#
# This Python script scrapes timetable data from the classutil site ('http://classutil.unsw.edu.au/')
# and stores it in a JSON file (timetable.json)
#
# NB: Approx. bandwidth used by this script while running = 3.3MB
#
# Authors: David Adams
#

from lxml import html, etree
from collections import defaultdict
import requests, grequests
import json
import time
import re
import os

# Semester and year to scrape data for
SEMESTER = 'S2'
YEAR = 2017

# Whether to only include classes in the data which are either Open, or Full (i.e. remove Cancelled, Tentative, Stopped classes)
OPEN_AND_FULL_ONLY = True

# Whether to download data fresh or not (should always be True unless testing)
DOWNLOAD = True

#
# main(): Scrape data, parse it and write it to JSON files
#
def main():
    global NEW_COMPONENTS, NEW_LOCATIONS, NEW_TIMES

    courses = {}
    timetables = {}
    
    faculties = getPages()
    for faculty, page in faculties.items():
        page = stripComments(html.fromstring(page))
        
        # Get course codes (and names)
        cc = getCourses(page)
        
        # Update dict of courses
        courses.update(dict(cc))
        
        # Get the timetable data
        timetableRaw = getTimetable(page)
        
        # Work out how many classes correspond to each of the courses
        prev = 0
        classCounts = []
        table = page.xpath('//table[3]')[0]
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
            courseCode = cc[i][0]
            facultyCode = courseCode[:4]
            courseNumbers = courseCode[4:]

            # Initialise this element of the timetable
            if facultyCode not in timetable:
                timetable[facultyCode] = {}

            courseRawData = timetableRaw[:count]
            courseData = [courses[courseCode]]
            if sum(map(len, courseRawData)) != 0:
                courseData += [item for item in courseRawData if len(item) != 0]

            timetable[facultyCode][courseNumbers] = courseData
            del timetableRaw[:count]
        
        # Update dict of timetables
        timetables.update(timetable)
        
        # Some progress output
        #print('Completed faculty', faculty)
    

    # Record time of update
    now = time.time()
    os.environ['TZ'] = 'Australia/Sydney' # Force Sydney timezone
    update_date = time.strftime('%d/%m/%Y', time.localtime(now))
    update_time = time.strftime('%H:%M', time.localtime(now))

    # Save timetable data as a JSON file
    with open('data/timetable.json', 'w') as f:
        json.dump([timetables, COMPONENTS, LOCATIONS, TIMES, { 'sem': SEMESTER, 'year': YEAR, 'updated': update_date, 'uptimed': update_time }], f, separators=(',',':'))
    
    print()
    print('Done.', '(' + str(sum(map(lambda x: len(x[1]), faculties.items()))) + ' bytes downloaded in total)')

    # Update components, locations and times index
    updateIndex('data/components.json', NEW_COMPONENTS)
    updateIndex('data/locations.json', NEW_LOCATIONS)
    updateIndex('data/times.json', NEW_TIMES)


#
# getPages(): finds all the faculty pages for the current semester
#
def getPages():
    if DOWNLOAD == False:
        try:
            with open('data/htmlcache.json') as f:
                faculties = json.load(f)
                print('Loaded faculty data from file')
                return faculties
        except:
            pass

    print('Downloading faculty data')
    tree = loadPage('http://classutil.unsw.edu.au/')
    links = tree.xpath('//td[' + str(SEM_CODE) + '][@class="data"]/a[contains(@href,".html")]/@href')

    # Filter ADFA courses (all courses which start with a 'Z')
    links = [link for link in links if link[0] != 'Z']

    reqs = (grequests.get('http://classutil.unsw.edu.au/' + urlend) for urlend in links)
    pages = grequests.map(reqs)
    faculties = { links[i].split('_')[0]: str(pages[i].content, encoding='utf-8') for i in range(len(pages)) }
    with open('data/html.json', 'w') as f:
        json.dump(faculties, f)

    return faculties

#
# getCourses(): scrapes the course codes and names from the page with the given tree structure
#
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

#
# getTimetable(): scrapes the timetable data from the page with the given tree structure
#
def getTimetable(tree):
    # Get course components and names in a list.
    component = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[1]/text()')
    status    = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[5]/text()')
    capacity  = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[6]/text()')
    timetable = tree.xpath('//tr[@class="rowLowlight" or @class="rowHighlight"]/td[8]')

    # Update components hash
    for c in component:
        NEW_COMPONENTS[c] += 1

    # Replace components with their indexes (for all those with indexes)
    component = list(map(subcomponent, component))
    
    # Clean statuses
    status = list(map(lambda x: substatus(x.strip('*')), status))

    # Clean up capacity strings
    capacity = list(map(lambda x: x.split()[0].split('/'), capacity))
    capacityLow = list(int(x[0]) for x in capacity)
    capacityHigh = list(int(x[1]) for x in capacity)

    # Get all the text from each of the elements with timetable data
    timetable = list(map(lambda e: etree.XPath("string()")(e), timetable))

    data = []
    for i in range(len(timetable)):
        timestring = timetable[i]
        timetableData = splitTimetableData(timestring)
        if len(timetableData) != 0 and (not OPEN_OR_FULL_ONLY or status[i] <= 1):
            data.append([component[i], status[i], capacityLow[i], capacityHigh[i]] + timetableData)
        else:
            data.append([])
    
    return data

#
# splitTimetableData(): splits up a string of timetable data into an array of [(time, weeks, location), ...]
# NB:                   any unknown values will be stored as '?'
#
def splitTimetableData(string):
    # Remove /odd and /even, as well as Comb/w descriptors
    string = re.sub(r'Comb/w.*', '', string.replace('/odd', '').replace('/even', '')).strip()

    # Handle blank strings - just return a tuple of empty strings
    if string == '':
        return []
    
    # Split up the parts of a string detailing multiple class times for one stream
    if '; ' in string:
        output = []
        for x in string.split('; '):
            output += splitTimetableData(x)
        #return list(zip(time, weeks, location))
        return output
    
    # Get first half of timetable string containing day of week and time of day info
    time = string.split('(', maxsplit=1)[0].strip().replace('09', '9').replace('08', '8')
    weeks = ''
    location = ''
    
    # Keep only the text within the brackets
    if '(' in string:
        string = string[string.find('(') + 1 : string.find(')')]

        # Process weeks where class is running
        weeks = string.split(', ')[0].strip(', ')
        if weeks[0] == 'w': #confirm that we are actually looking at weeks
            weeks = weeks.strip('w')

            # Remove any weeks that aren't in the main semester timetable
            weeks = weeks.replace('< 1', '').strip(',')
            weeks = weeks.replace('N1', '').strip(',')
            weeks = weeks.replace('N2', '').strip(',')
            if weeks == '':
                weeks = None
        #weeks = expandRanges(weeks)

        # Get location if available
        # NB: take from ', ' to end
        if string.find(', ') != -1:
            location = string[string.find(', '):].strip(', ')
        elif string[0] != 'w': # if it starts with 'w' it is a week range, not location
            location = string
        else:
            location = ''

        # Replace 'See School' locations with an empty string for uniformity
        if location == 'See School':
            location = ''

    time = subday(time)
    if time is None or weeks is None:
        return []

    # Replace times with their indexes (and update the index)
    NEW_TIMES[time] += 1
    time = subtimes(time)

    # Replace locations with their indexes (and update the index)
    NEW_LOCATIONS[location] += 1
    location = sublocation(location)

    return [time, location]

#
# stripComments(): removes all HTML comments from parsed HTML (required for traversing child nodes without error)
#
def stripComments(tree):
    comments = tree.xpath('//table[3]//comment()')

    for c in comments:
        p = c.getparent()
        p.remove(c)
    
    return tree

#
# expandRanges(): changes strings of format e.g. "1-3,6,10-12" to "1,2,3,6,10,11,12"
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

#
# subday(): gives a single-character representation of the day (also replace ":30" with ".5")
#
def subday(timestr):
    # Change day TLAs to letters
    timestr = timestr.replace('Mon ', 'M').replace('Tue ', 'T').replace('Wed ', 'W').replace('Thu ', 'H').replace('Fri ', 'F').replace('Sat ', 'S').replace('Sun ', 's')

    # Use decimal notation for half-hours
    timestr = timestr.replace(':30', '.5')

    # If more than one day is included, we consider it to be an "intensive" and don't include it
    if timestr[:2].isalpha():
        return None

    # If the class runs on Saturday or Sunday, don't include it
    if timestr[0].lower() == 's':
        return None

    # We don't know how to deal with the time "00-00" so, don't bother including it!
    if '00-00' in timestr:
        return None

    return timestr

#
# substatus(): gives a single-digit representation of the status
#
def substatus(string):
    return int(string.replace('Open', '0').replace('Full', '1').replace('Closed', '2').replace('Stop', '3').replace('Tent', '4').replace('Canc', '5'))

#
# subcomponent(): replaces components with an index
#
def subcomponent(c):
    if c in COMPONENTS:
        return COMPONENTS.index(c)
    else:
        return c

#
# sublocation(): replaces locations with an index
#
def sublocation(l):
    if l in LOCATIONS:
        return LOCATIONS.index(l)
    else:
        return l

#
# subtimes(): replaces locations with an index
#
def subtimes(t):
    if t in TIMES:
        return TIMES.index(t)
    else:
        return t

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
# getURL(): synchronously gets the contents of the page at the given URL
#
def getURL(url):
    global bytecount
    response = requests.get(url)
    #bytecount += len(response.content)
    return response

#
# updateIndex(): updates an index file to be used next time the scraper is run
#
def updateIndex(fname, index):
    index = sorted(index.items(), key=lambda x: x[1], reverse=True)
    index = list(map(lambda x: x[0], index))
    with open(fname, 'w') as f:
        json.dump(index, f)

#
# loadJSON(): tries to load a JSON file, but doesn't throw an exception if it fails
#
def loadJSON(fname):
    try:
        with open(fname) as f:
            return json.load(f)
    except:
        return []


# Load indexes from JSON files and do some other initialisation of variables
COMPONENTS = loadJSON('data/components.json')
LOCATIONS = loadJSON('data/locations.json')
TIMES = loadJSON('data/times.json')
NEW_COMPONENTS = defaultdict(int)
NEW_LOCATIONS = defaultdict(int)
NEW_TIMES = defaultdict(int)
semcodes = {'S1': 2, 'S2': 3, 'Summer': 1}
SEM_CODE = semcodes[SEMESTER]


if __name__ == '__main__':
    main()
