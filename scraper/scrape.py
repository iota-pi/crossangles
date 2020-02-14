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
from typing import Optional, Union, Dict, List, Tuple, Iterator
from Course import Course


class Parser:
    def __init__(
                self,
                term: int,
                engine: str = 'lxml',
                window: int = 20,
                timeout: int = 20,
                cache: Optional[str] = None
            ) -> None:
        self.parser = engine
        self.windowSize = window
        self.timeout = timeout
        self.cacheName = cache
        self.cache: Dict[str, str] = {}
        self.term = str(term)

        # Load the cache file (if it is required, and if it exists)
        if cache is not None:
            try:
                with open(cache) as f:
                    self.cache = json.load(f)
            except (FileNotFoundError, TypeError):
                pass

    def scrape(self, startUrl: str) -> List[Course]:
        # Extract course information from each faculty page
        courses: List[Course] = []
        for soup in self.getFacultyPages(startUrl):
            rows = soup.select('table')[2].find_all('tr', recursive=False)[1:]
            courses += self.parseRows(rows)

        # Remove all duplicate streams
        for course in courses:
            course.remove_duplicates()

        return courses

    def parseRows(self, rows) -> List[Course]:
        courses = []

        # Extract course data from each row
        for row in rows:
            # Find all cells in this row
            cells = row.find_all('td', recursive=False)

            if len(cells) == 1:
                # A row with a single cell marks the end of the table
                break
            elif len(cells) == 2:
                # A row with 2 cells marks the start of a new course
                courses.append(Course(
                    code=cells[0].get_text().strip(),
                    name=cells[1].get_text().strip(),
                    streams=[]
                ))
            else:
                # Every other row contains standard stream data
                courses[-1].add_stream(
                    component=cells[0].get_text().strip(),
                    section=cells[1].get_text().strip(),
                    status=cells[4].get_text().strip(),
                    enrols=cells[5].get_text().strip(),
                    times=cells[7].get_text().strip()
                )

        return courses

    def getFacultyPages(self, start_url: str) -> Iterator[BeautifulSoup]:
        soup = self.loadPages(start_url).__next__()
        regex = re.compile('[A-Y][A-Z]{3}_[ST]' + self.term + '.html$')
        links = soup.find_all(href=regex)
        links = [link.get('href') for link in links]

        # Convert to urls and load the pages
        urls = [urljoin(start_url, link) for link in links]
        soups = self.loadPages(*urls)

        return soups

    def loadHTML(self, url: str, timeout: Optional[int] = None) -> str:
        # Return cached response (if response is in cache)
        if self.cache and url in self.cache:
            return self.cache[url]

        content = requests.get(url, timeout=timeout).content
        html = str(content, encoding='utf-8')

        # Cache then return HTML
        self.cache[url] = html
        return html

    def loadPages(
        self, *urls: str, prefix='', postfix=''
    ) -> Iterator[BeautifulSoup]:
        with ThreadPoolExecutor(max_workers=self.windowSize) as executor:
            tasks = (executor.submit(
                self.loadHTML,
                ''.join((prefix, url, postfix)),
                timeout=self.timeout
            ) for url in urls)
            for future in as_completed(tasks):
                response = future.result()
                yield BeautifulSoup(response, features=self.parser)

    def writeCache(self):
        if self.cacheName:
            # Write a cache of all loaded pages to speed up next run
            # NB: for testing purposes only
            with open(self.cacheName, 'w') as f:
                json.dump(self.cache, f, separators=(',', ':'))


# Returns the date (dd/mm/yy) and time (hh:mm) in Sydney
def getSydneyTime() -> Tuple[str, str]:
    # Force Sydney timezone
    os.environ['TZ'] = 'Australia/Sydney'

    # Get properly formatted date & time
    now = time.time()
    updateDate = time.strftime('%d/%m/%Y', time.localtime(now))
    updateTime = time.strftime('%H:%M', time.localtime(now))

    return updateDate, updateTime


def getMeta(year: int, term: int, signup: str) -> Dict[str, Union[int, str]]:
    updateDate, updateTime = getSydneyTime()
    return {
        'term': term,
        'year': year,
        'updateDate': updateDate,
        'updateTime': updateTime,
        'signup': signup
    }


def scrapeTerm(term: int, cache: str, url: str) -> List[Course]:
    parser = Parser(term=term, cache=cache)
    courses = parser.scrape(url)
    parser.writeCache()

    return courses


if __name__ == '__main__':
    # Ensure script always runs in its own directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    with open('.config.json') as f:
        config = json.load(f)

    # Scrape each term until one has enough data
    data = None
    currentTerm = -1
    for term in config['terms']:
        courses = scrapeTerm(term, config['cache'], config['url'])

        # Try to find a Term with at least 20% of courses having stream data
        hasStreamData = sum(len(course.streams) > 0 for course in courses)
        if hasStreamData / len(courses) >= 0.2:
            data = [course.to_dict() for course in courses]
            currentTerm = term
            break

    if data is not None:
        # Include Campus Bible Study event data
        with open('cbs.json') as f:
            data.append(json.load(f))

        # Get meta data
        meta = getMeta(config['year'], currentTerm, config['signup'])

        # Save scraped data
        with open(config['output'], 'w') as f:
            json.dump(
                {'courses': data, 'meta': meta},
                f,
                separators=(',', ':')
            )
    else:
        # Leave data unchanged if no such Term exists
        sys.stderr.write(
            'No Term with enough data found. Tried {}\n'.format(
                config["terms"]
            )
        )
