#!/usr/bin/env python3

from cleaner import Cleaner
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import json
import time
import re
import os

class Parser():
    def __init__(self, term, engine='lxml', windowSize=20, timeout=5, cache=None):
        self.parser = engine
        self.windowSize = windowSize
        self.timeout = timeout
        self.cacheName = cache
        self.cache = {}
        self.term = str(term)

        if cache:
            try:
                with open(cache) as f:
                    self.cache = json.load(f)
            except FileNotFoundError:
                pass

    def scrape(self, startUrl):
        courses = []
        for soup in self.getFacultyPages(startUrl):
            rows = soup.select('table')[2].find_all('tr', recursive=False)[1:]
            course = None
            for row in rows:
                cells = row.find_all('td', recursive=False)

                if len(cells) == 1:
                    # A row with a single cell marks the end of the table
                    break
                elif len(cells) == 2:
                    # Store previous course
                    if course is not None:
                        courses.append(course)

                    # Start a new course
                    course = {
                        'code': cells[0].get_text().strip(),
                        'name': cells[1].get_text().strip(),
                        'streams': []
                    }
                else:
                    # Handle general course
                    course['streams'].append({
                        'component': cells[0].get_text().strip(),
                        'section': cells[1].get_text().strip(),
                        'status': cells[4].get_text().strip(),
                        'enrols': cells[5].get_text().strip(),
                        'times': cells[7].get_text().strip()
                    })

            # Append the last course
            courses.append(course)

        # Use full course names for courses (where we have them)
        mappingUG = self.getUGCourses()
        for course in courses:
            if course['code'] in mappingUG:
                course['name'] = mappingUG[course['code']]

        return courses

    def getFacultyPages(self, startUrl):
        soup = self.loadPages(startUrl).__next__()
        links = soup.find_all(href=re.compile('[A-Y][A-Z]{3}_[ST]' + self.term + '.html$'))
        links = [link.get('href') for link in links]

        # Convert to urls and load the pages
        urls = [urljoin(startUrl, link) for link in links]
        soups = self.loadPages(*urls)

        return soups

    def loadHTML(self, url, timeout=None):
        if self.cache and url in self.cache:
            return self.cache[url]

        html = requests.get(url, timeout=timeout).content

        self.cache[url] = str(html, encoding='utf-8')

        return html

    def loadPages(self, *urls, prefix='', postfix=''):
        with ThreadPoolExecutor(max_workers=self.windowSize) as executor:
            tasks = (executor.submit(
                self.loadHTML,
                prefix + url + postfix,
                timeout=self.timeout
            ) for url in urls)
            for future in as_completed(tasks):
                response = future.result()
                yield BeautifulSoup(response, features=self.parser)

    def getUGCourses(self):
        with open('courses.json') as f:
            courses = json.load(f)
        return courses

    def writeCache(self):
        if self.cacheName:
            with open(self.cacheName, 'w') as f:
                json.dump(self.cache, f, separators=(',', ':'))

#
# getSydneyTime(): returns the date (dd/mm/yy) and time (hh:mm) in Sydney
#
def getSydneyTime():
    # Force Sydney timezone
    os.environ['TZ'] = 'Australia/Sydney'

    # Get properly formatted date & time
    now = time.time()
    updateDate = time.strftime('%d/%m/%Y', time.localtime(now))
    updateTime = time.strftime('%H:%M', time.localtime(now))

    return updateDate, updateTime

def getMeta(year, term):
    updateDate, updateTime = getSydneyTime()
    return {
        'term': term,
        'year': year,
        'updateDate': updateDate,
        'updateTime': updateTime
    }

if __name__ == '__main__':
    # Ensure script always runs in its own directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with open('.config.json') as f:
        config = json.load(f)

    parser = Parser(term=config['term'], cache=config['cache'])
    courses = parser.scrape(config['url'])
    meta = getMeta(config['year'], config['term'])
    parser.writeCache()

    cleaner = Cleaner()
    data = cleaner.process(courses)

    everything = {
        'courses': data,
        'meta': meta
    }

    cleaner.dump(everything, config['output'])
