#!/usr/bin/python3

from lxml import html, etree
from collections import defaultdict
import grequests
import json
import time
import os
import re

class Scraper:
    def __init__(self, sem, year):
        self.removeADFA = True
        SEM_CODES = { 'S1': 2, 'S2': 3 }
        self.semester = sem
        self.year = year
        self.semID = str(SEM_CODES[self.semester])
        self.data = None

    def scrape(self):
        self.data = defaultdict(dict)
        for page in self.loadFacultyPages():
            # Get relevant table
            table = page.xpath('//table[3]')[0]
            faculty = None
            course = None
            for tr in table:
                # Check if useful part of table has finished
                # NB: signalled by tr with single child
                if len(tr) == 1:
                    break
                
                # Check if this is a course heading
                if tr[0].get('class') == 'cucourse':
                    # Update course info
                    code = tr[0].xpath('.//text()')[0].strip()
                    faculty = code[:4]
                    course = code[4:]
                    self.data[faculty][course] = [tr[1].xpath('.//text()')[0].strip()]
                    continue
                
                # If we haven't started on a course yet
                if faculty == None:
                    continue
                
                # Scrape class info
                component = tr[0].text
                status = tr[4].text
                
                if status[0] not in ['O', 'F']:
                    continue
                status = int(status[0].replace('O', '0').replace('F', '1'))
                
                enrol = map(int, tr[5].text.split(' ')[0].split('/'))
                ttdata = self.parseTimeStr(tr[7].text)
                self.data[faculty][course].append([component, status, *enrol, *ttdata])
        
        self.index()
        self.saveJSON()

    
    def parseTimeStr(self, string):
        # Remove /odd and /even, as well as Comb/w descriptors
        string = re.sub(r'Comb/w.*', '', string.replace('/odd', '').replace('/even', '')).strip()

        # Return empty list if no time data is given
        if string == '':
            return []

        # Split into individual class times
        if '; ' in string:
            output = []
            for x in string.split('; '):
                output += self.parseTimeStr(x)
            return output

        time = self.subtime(string.split('(', maxsplit=1)[0].strip())
        if time == None:
            return []

        location = ''

        if '(' in string:
            # Keep only the text within the brackets
            string = string[string.find('(') + 1 : string.find(')')]

            if not self.validWeeks(string):
                return []

            if ', ' in string:
                location = string[string.find(', '):].strip(', ')
            elif string[0] != 'w':  # No buildings start with lowercase 'w', only week ranges
                location = string

            # Standardise 'See School' locations to be blank
            if location.lower == 'see school':
                location = ''

        return [time, location]

    # Replace components, times and labs with indexes
    def index(self):
        components = defaultdict(int)
        times      = defaultdict(int)
        locations  = defaultdict(int)
        for faculty in self.data.keys():
            for courseData in self.data[faculty].values():
                for courseClass in courseData[1:]:
                    components[courseClass[0]] += 1
                    for time in courseClass[4::2]:
                        times[time] += 1
                    for location in courseClass[5::2]:
                        locations[location] += 1

        # Sort these hashes into lists in descending order of # of uses
        self.components = self.sortHash(components)
        self.times = self.sortHash(times)
        self.locations = self.sortHash(locations)

        # Use indexes into these lists in the main data structure
        for faculty in self.data.keys():
            for courseCode, courseData in self.data[faculty].items():
                for i in range(1, len(courseData)):
                    courseClass = courseData[i]
                    self.data[faculty][courseCode][i][0] = self.components.index(courseData[i][0])

                    for j in range(4, len(courseClass), 2):
                        time = courseClass[j]
                        self.data[faculty][courseCode][i][j] = self.times.index(time)

                    for j in range(5, len(courseClass), 2):
                        location = courseClass[j]
                        self.data[faculty][courseCode][i][j] = self.locations.index(location)

    def sortHash(self, index):
        index = sorted(index.items(), key=lambda x: x[1], reverse=True)
        index = list(map(lambda x: x[0], index))
        return index

    def subtime(self, timestr):
        # If the class runs on Saturday or Sunday, don't include it
        if timestr[0].lower() == 's':
            return None

        # Change day TLAs to letters
        timestr = timestr.replace('Mon ', 'M').replace('Tue ', 'T').replace('Wed ', 'W').replace('Thu ', 'H').replace('Fri ', 'F')

        # Use decimal notation for half-hours
        timestr = timestr.replace(':30', '.5')

        # If more than one day is included, we consider it to be an "intensive" and don't include it
        if timestr[:2].isalpha():
            return None

        # We don't know how to deal with the time "00-00" so, don't bother including it!
        if '00-00' in timestr:
            return None

        return timestr

    def validWeeks(self, string):
        weeks = string.split(', ')[0].strip(', ')
        if weeks[0] == 'w': #confirm that we are actually looking at weeks
            weeks = weeks.strip('w')

            # Remove any weeks that aren't in the main semester timetable
            weeks = weeks.replace('< 1', '').strip(',')
            weeks = weeks.replace('N1', '').strip(',')
            weeks = weeks.replace('N2', '').strip(',')
            weeks = re.sub(r',[, ]*', ',', weeks)
            if weeks.strip() == '':
                return False

        return True
    
    def loadFacultyPages(self):
        page = self.loadPages('http://classutil.unsw.edu.au/')[0]
        links = page.xpath('//td[' + self.semID + '][@class="data"]/a[contains(@href,".html")]/@href')

        # Filter out ADFA courses
        if self.removeADFA:
            links = [link for link in links if link[0] != 'Z']

        return self.loadPages(*links, prefix='http://classutil.unsw.edu.au/')

    def loadPages(self, *args, **kwargs):
        if 'prefix' in kwargs:
            urls = (kwargs['prefix'] + arg for arg in args)
        else:
            urls = args
        
        requests = (grequests.get(url) for url in urls)
        pages = grequests.map(requests)
        pages = (str(page.content, encoding='utf-8') for page in pages)
        pages = self.parseHTML(pages)
        
        return pages
    
    def parseHTML(self, pages):
        trees = []
        for page in pages:
            tree = html.fromstring(page)

            # Remove all comments
            # Comments in strange places can mess up scraping process later
            comments = tree.xpath('//comment()')

            for c in comments:
                p = c.getparent()
                if p is not None:
                    p.remove(c)
            
            trees.append(tree);

        return trees

    #
    # getSydneyTime(): returns the date (dd/mm/yy) and time (hh:mm) in Sydney
    #  (this is particularly useful for when script is being run on a webserver in another location)
    #
    def getSydneyTime(self):
        now = time.time()
        os.environ['TZ'] = 'Australia/Sydney' # Force Sydney timezone
        thedate = time.strftime('%d/%m/%Y', time.localtime(now))
        thetime = time.strftime('%H:%M', time.localtime(now))
        return thedate, thetime

    def getMeta(self):
        update_date, update_time = self.getSydneyTime()
        self.meta = {
            'sem': self.semester,
            'year': self.year,
            'updated': update_date,
            'uptimed': update_time
        }

    def saveJSON(self):
        self.getMeta()
        allData = [self.data, self.components, self.locations, self.times, self.meta]

        with open('data/tt.json', 'w') as f:
            # Write file with maximum compression
            json.dump(allData, f, separators=(',', ':'))


if __name__ == '__main__':
    sc = Scraper('S1', 2018)
    sc.scrape()
