#!/usr/bin/env python3

from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import json
import re

URL = 'https://nss.cse.unsw.edu.au/sitar/classes2018/index.html'

class Parser():
    def __init__(self, parser='lxml', windowSize=20, timeout=5):
        self.parser = parser
        self.windowSize = windowSize
        self.timeout = timeout

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
                        'classes': []
                    }
                else:
                    # Handle general course
                    course['classes'].append({
                        'component': cells[0].get_text().strip(),
                        'status': cells[4].get_text().strip(),
                        'enrols': cells[5].get_text().strip(),
                        'times': cells[7].get_text().strip()
                    })

        return courses

    def getFacultyPages(self, startUrl):
        soup = self.loadPages(startUrl).__next__()
        links = soup.find_all(href=re.compile('[^Z][A-Z]{3}_[ST][1-3].html$'))
        links = [link.get('href') for link in links]

        # Convert to urls and load the pages
        urls = [urljoin(startUrl, link) for link in links]
        soups = self.loadPages(*urls)

        return soups

    def loadPages(self, *urls):
        with ThreadPoolExecutor(max_workers=self.windowSize) as executor:
            tasks = (executor.submit(requests.get, url, timeout=self.timeout) for url in urls)
            for future in as_completed(tasks):
                response = future.result()
                yield BeautifulSoup(response.content, features=self.parser)

    def dump(self, data):
        with open('tmp.json', 'w') as f:
            json.dump(courses, f, separators=(',', ':'))

if __name__ == '__main__':
    parser = Parser()
    parser.scrape(URL)
