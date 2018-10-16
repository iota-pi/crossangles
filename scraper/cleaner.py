
from collections import defaultdict
import json
import re

class Cleaner():
    def __init__(self):
        self.weekMax = 2 ** 13 - 1

    def process(self, courses):
        for course in courses:
            toDelete = []
            existing = defaultdict(list)
            for stream in course['streams']:
                # Process status
                stream['status'] = stream['status'].strip('*')
                if stream['status'] not in ['Open', 'Full']:
                    toDelete.append(stream)
                    continue
                stream['status'] = 1 if stream['status'] == 'Open' else 0

                # Process enrolments
                stream['enrols'] = stream['enrols'].strip().split()[0]
                if stream['enrols'][-2:] == '/0':
                    toDelete.append(stream)
                    continue

                # Process times
                stream['times'] = self.parseTimeStr(stream['times'])
                if len(stream['times']) == 0:
                    toDelete.append(stream)
                    continue

                existing[(stream['component'], tuple(stream['times']))].append(stream)

            # Remove all marked streams
            # NB: must be done before next filtering
            for stream in toDelete:
                course['streams'].remove(stream)

            # Reset toDelete list for next time
            toDelete = []

            # Remove all duplicate streams (same course, component, and time)
            for key, streams in existing.items():
                if len(streams) > 1:
                    bestStream = None
                    bestRatio = 2
                    for stream in streams:
                        enrols, capacity = stream['enrols'].split('/')
                        ratio = int(enrols) / int(capacity)

                        if ratio < bestRatio:
                            bestRatio = ratio
                            bestStream = stream

                    for stream in streams:
                        if stream is not bestStream:
                            toDelete.append(stream)

            # Remove any newly marked streams
            for stream in toDelete:
                course['streams'].remove(stream)

        return courses

    def parseTimeStr(self, string):
        # Remove /odd and /even, as well as Comb/w descriptors
        string = string.replace('/odd', '').replace('/even', '')
        string = re.sub(r'Comb/w.*', '', string).strip()

        # Return empty list if no time data is given
        if string == '':
            return []

        # Split into individual class times
        if '; ' in string:
            output = []
            for subString in string.split('; '):
                output += self.parseTimeStr(subString)
            return output

        time = self.tidyUpTime(string.split('(', maxsplit=1)[0].strip())
        if time == None:
            return []

        location = ''
        weeks = self.weekMax

        if '(' in string:
            # Keep only the text within the brackets
            string = string[string.find('(') + 1 : string.find(')')]
            weeks = self.getWeeks(string)

            if weeks is None:
                return []

            if ', ' in string:
                location = string[string.find(', '):].strip(', ')
            elif string[0] != 'w':  # No buildings start with lowercase 'w', only week ranges
                location = string

            # Standardise 'See School' locations to be blank
            if location.lower() == 'see school':
                location = ''

        return [(time, location, weeks)]

    def tidyUpTime(self, timestr):
        # If the class runs on Saturday or Sunday, don't include it
        if timestr[0].lower() == 's':
            return None

        # Change day TLAs to letters
        timestr = timestr.replace('Mon ', 'M').replace('Tue ', 'T')
        timestr = timestr.replace('Wed ', 'W').replace('Thu ', 'H').replace('Fri ', 'F')

        # Use decimal notation for half-hours
        timestr = timestr.replace(':30', '.5')

        # Skip anything with multiple days (usually intensives)
        if timestr[:2].isalpha():
            return None

        # We don't know how to deal with the time "00-00" so, don't bother including it!
        if '00-00' in timestr:
            return None

        return timestr

    def getWeeks(self, string):
        weeks = string.split(', ')[0].strip(', ')
        if weeks[0] == 'w': #confirm that we are actually looking at weeks
            weeks = weeks.strip('w')

            # Remove any weeks that aren't in the main semester timetable
            weeks = weeks.replace('< 1', '')
            weeks = re.sub(r'-?N[0-9]+', '', weeks)
            weeks = re.sub(r',[, ]*', ',', weeks).strip(', ')

            # If weeks is now empty, then that means that this class only runs outside of the main semester, so return None to not include this class
            if weeks == '':
                return None

            weeks = self.toInt(self.expandRanges(weeks))
            return weeks
        else:
            # Assume class runs on every week to be safe
            return self.weekMax

    def expandRanges(self, weeks):
        array = []

        for r in weeks.split(','):
            if '-' in r:
                a, b = r.split('-')
                array += list(range(int(a) - 1, int(b)))
            else:
                array.append(int(r) - 1)

        return array

    def toInt(self, weeksArray):
        num = sum(map(lambda x: 2**x, weeksArray))

        return num

    def dump(self, data, fname):
        with open(fname, 'w') as f:
            json.dump(data, f, separators=(',', ':'))
