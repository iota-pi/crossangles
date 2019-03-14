#!/usr/bin/env python3

from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import requests
import json
import time
import sys
import re
import os

from cleaner import cleanStream, removeDuplicates, abbreviateKeys


class Parser():
    def __init__(self, term, engine='lxml', window=20, timeout=20, cache=None):
        self.parser = engine
        self.windowSize = window
        self.timeout = timeout
        self.cacheName = cache
        self.cache = {}
        self.term = str(term)

        # Load the cache file (if it is required, and if it exists)
        if cache is not None:
            try:
                with open(cache) as f:
                    self.cache = json.load(f)
            except (FileNotFoundError, TypeError):
                pass

    def scrape(self, startUrl):
        # Extract course information from each faculty page
        courses = []
        for soup in self.getFacultyPages(startUrl):
            rows = soup.select('table')[2].find_all('tr', recursive=False)[1:]
            courses += self.parseRows(rows)

        # Remove all duplicate streams
        courses = removeDuplicates(courses)

        # Use full course names for courses
        courses = self.getFullNames(courses)

        return courses

    def parseRows(self, rows):
        courses = []

        # Extract course data from each row
        for row in rows:
            # Find all cells in this row
            cells = row.find_all('td', recursive=False)

            # A row with a single cell marks the end of the table
            if len(cells) == 1:
                # Append the last course and finish iteration
                break
            # A row with 2 cells marks the start of a new course
            elif len(cells) == 2:
                # Start a new course
                courses.append({
                    'code': cells[0].get_text().strip(),
                    'name': cells[1].get_text().strip(),
                    'streams': []
                })
            # Every other row contains standard course data
            else:
                stream = cleanStream({
                    'component': cells[0].get_text().strip(),
                    'section': cells[1].get_text().strip(),
                    'status': cells[4].get_text().strip(),
                    'enrols': cells[5].get_text().strip(),
                    'times': cells[7].get_text().strip()
                })

                if stream is not None:
                    courses[-1]['streams'].append(stream)

        return courses

    def getFacultyPages(self, startUrl):
        soup = self.loadPages(startUrl).__next__()
        regex = re.compile('[A-Y][A-Z]{3}_[ST]' + self.term + '.html$')
        links = soup.find_all(href=regex)
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

    def getFullNames(self, courses):
        # Load course code -> full name mapping
        with open('courses.json') as f:
            mappingUG = json.load(f)

        # Use each course's full name
        mappingUG = self.getUGCourses()
        for course in courses:
            if course['code'] in mappingUG:
                course['name'] = mappingUG[course['code']]

        return courses

    def writeCache(self):
        if self.cacheName:
            # Write a cache of all loaded pages to speed up next run
            # NB: for testing purposes only
            with open(self.cacheName, 'w') as f:
                json.dump(self.cache, f, separators=(',', ':'))


# Returns the date (dd/mm/yy) and time (hh:mm) in Sydney
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


def scrapeTerm(term, config):
    parser = Parser(term=term, cache=config['cache'])
    courses = parser.scrape(config['url'])
    parser.writeCache()

    return courses


if __name__ == '__main__':
    # Ensure script always runs in its own directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with open('.config.json') as f:
        config = json.load(f)

    # Scrape each term until one has enough data
    data = None
    currentTerm = None
    for term in config['terms']:
        courses = scrapeTerm(term, config)

        # Try to find a Term with at least 20% of courses having stream data
        if sum(len(course['streams']) > 0 for course in courses) / len(courses) >= 0.2:
            data = courses
            currentTerm = term
            break

    if data is not None:
        # Include Campus Bible Study event data
        with open('cbs.json') as f:
            data.append(json.load(f))

        # Abbreviate the keys used in the course and stream JSON objects
        # TODO: this shouldn't be necessary with Brotli/gzip
        abbreviateKeys(data)

        # Get meta data
        meta = getMeta(config['year'], currentTerm)

        # Save scraped data
        with open(config['output'], 'w') as f:
            json.dump({'courses': data, 'meta': meta}, f, separators=(',', ':'))
    else:
        # Leave data unchanged if no such Term exists
        sys.stderr.write('No Term with enough data found\n')
