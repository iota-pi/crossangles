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

URL = 'https://nss.cse.unsw.edu.au/sitar/classes2018/index.html'
TERM = 1
YEAR = 2018

class Parser():
    def __init__(self, term, engine='lxml', windowSize=20, timeout=5, cache=None):
        self.parser = engine
        self.windowSize = windowSize
        self.timeout = timeout
        self.cacheName = cache
        self.cache = {}
        self.term = str(term)

        if cache is not None:
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
                        'status': cells[4].get_text().strip(),
                        'enrols': cells[5].get_text().strip(),
                        'times': cells[7].get_text().strip()
                    })

        # Remove all PG courses and use full course names
        mappingUG = self.getUGCourses()
        postgrad = []
        for course in courses:
            if course['code'] not in mappingUG:
                postgrad.append(course)
            else:
                course['name'] = mappingUG[course['code']]
        for course in postgrad:
            courses.remove(course)

        return courses

    def getFacultyPages(self, startUrl):
        soup = self.loadPages(startUrl).__next__()
        links = soup.find_all(href=re.compile('[^Z][A-Z]{3}_[ST]' + self.term + '.html$'))
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
        url = 'https://www.handbook.unsw.edu.au/api/es/search'

        if url in self.cache:
            handbook = json.loads(self.cache[url])
        else:
            print('Loading handbook')
            with open('handbook.json') as f:
                payload = json.load(f)
            handbook = requests.post(url, json=payload)
            text = str(handbook.content, encoding='utf-8')
            self.cache[url] = text
            handbook = json.loads(text)
            print('Done')

        mappingUG = {}
        for course in handbook['contentlets']:
            code = course['code']
            name = course['name']
            mappingUG[code] = name

        return mappingUG

    def writeCache(self):
        with open(self.cacheName, 'w') as f:
            json.dump(self.cache, f, separators=(',', ':'))

#
# getSydneyTime(): returns the date (dd/mm/yy) and time (hh:mm) in Sydney
# (this is particularly useful for when script is being run on a webserver in another location)
#
def getSydneyTime():
    # Force Sydney timezone
    os.environ['TZ'] = 'Australia/Sydney'

    # Get properly formatted date & time
    now = time.time()
    updateDate = time.strftime('%d/%m/%Y', time.localtime(now))
    updateTime = time.strftime('%H:%M', time.localtime(now))

    return updateDate, updateTime

def getMeta():
    updateDate, updateTime = getSydneyTime()
    return {
        'term': TERM,
        'year': YEAR,
        'updateDate': updateDate,
        'updateTime': updateTime
    }

if __name__ == '__main__':
    parser = Parser(term=TERM, cache='cache.json')
    courses = parser.scrape(URL)
    meta = getMeta()
    parser.writeCache()

    cleaner = Cleaner()
    data = cleaner.process(courses)

    everything = {
        'data': data,
        'meta': meta
    }

    cleaner.dump(everything, '../static/tt.json')
