#!/usr/bin/python3

from lxml import html
import requests
import json
import time

def main():
    scrape()

def scrape():
    courses = {}
    
    # Get faculty pages
    fpages = getPages()
    for fpage in fpages:
        # Get course pages
        pages = getPages(fpage)
        
        for page in pages:
            course = getCourseName(page)
            print(*course)
            courses[course[0]] = course[1]
            
        if len(courses) != 0:
            with open('data/courses.json', 'w') as f:
                json.dump(courses, f)
                print("JSON dumped")
            
        # ... a polite little delay
        politeDelay()

def getPages(fpage='subjectSearch.html'):
    global YEAR
    page = getURI('http://timetable.unsw.edu.au/' + YEAR + '/' + fpage)
    tree = html.fromstring(page.content)
    links = tree.xpath('//tr/td[1][@class="data"]/a[contains(@href,".html")]/@href')
    return links
    
def getCourseName(cpage):
    global YEAR
    page = getURI('http://timetable.unsw.edu.au/' + YEAR + '/' + cpage)
    tree = html.fromstring(page.content)
    text = tree.xpath('//td[@class="classSearchMinorHeading"]/text()')
    return text[0].split(' ', 1)
    
def getURI(uri):
    return requests.get(uri)

def politeDelay(s=1):
    time.sleep(s)

if __name__ == '__main__':
    YEAR = '2017'
    main()
