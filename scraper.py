#!/usr/bin/python3

from lxml import html
import requests
import json
import time

YEAR = '2017'

def main():
    # TEMP
    page = loadPage('http://timetable.unsw.edu.au/2017/ACCT1501.html')
    getTimetable(page)
    return
    # END TEMP
    scrape()

def scrape():
    global YEAR
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
            
        if len(courses) != 0:
            with open('data/courses.json', 'w') as f:
                json.dump(courses, f)
                print("JSON dumped")
        
        # ... a polite little delay
        politeDelay()

def getPages(fpage='subjectSearch.html'):
    global YEAR
    tree = loadPage('http://timetable.unsw.edu.au/' + YEAR + '/' + fpage)
    links = tree.xpath('//tr/td[1][@class="data"]/a[contains(@href,".html")]/@href')
    return links

def getCourseName(page):
    text = page.xpath('//td[@class="classSearchMinorHeading"]/text()')
    return text[0].split(' ', 1)

def getTimetable(page):
    activity = tree.xpath('//tr/td[1][@class="data"]/a[contains(@href,".html")]/text()')
    period   = tree.xpath('//tr/td[2][@class="data"]/a[contains(@href,".html")]/text()')
    space    = tree.xpath('//tr/td[6][@class="data"]/text()')
    time     = tree.xpath('//tr/td[7][@class="data"]/text()')
    print(activity, period, space, time)

def loadPage(uri):
    page = getURI(uri)
    tree = html.fromstring(page.content)
    return tree

def getURI(uri):
    return requests.get(uri)

def politeDelay(s=1):
    time.sleep(s)

if __name__ == '__main__':
    main()
