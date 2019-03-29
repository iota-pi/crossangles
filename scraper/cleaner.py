#!/usr/bin/env python3

from collections import defaultdict
import re


def cleanStream(stream):
    # Skip course enrolment streams
    if stream['component'] == 'CRS':
        return None

    # Clean up status
    stream['status'] = stream['status'].strip('*')
    if stream['status'] not in ['Open', 'Full']:
        return None
    stream['status'] = 1 if stream['status'] == 'Open' else 0

    # Clean up enrolments
    stream['enrols'] = stream['enrols'].strip().split()[0]
    if stream['enrols'][-2:] == '/0':
        return None

    # Clean up session times (excluding WEB streams)
    if 'WEB' not in stream['section']:
        stream['times'] = parseTimeStr(stream['times'])
        if len(stream['times']) == 0:
            return None
    else:
        # Web streams don't need a time or place
        stream['times'] = None

    # Process WEB streams
    if 'WEB' in stream['section']:
        # Mark this as stream as a WEB stream
        stream['web'] = 1

        # Web streams are equivalent to lecture streams
        # NB: Some web streams have their component set to 'WEB' too
        # which would confuse JS timetable generation algorithm
        if stream['component'] == 'WEB':
            stream['component'] = 'LEC'
    del stream['section']

    return stream


def removeDuplicates(courses):
    for course in courses:
        # Group streams into sets by component and time
        streamSets = defaultdict(list)
        for stream in course['streams']:
            # Get stream times
            if 'web' in stream and stream['web']:
                # Web streams don't have any associated time
                times = None
            else:
                # Extract just the times
                # (there is also location and weeks data in the tuples that we
                #  don't want to group on)
                times = tuple(time[0] for time in stream['times'])
            streamSets[(stream['component'], times)].append(stream)

        # List of streams to delete
        toDelete = []

        # Remove all duplicate streams (same course, component, and time)
        for streams in streamSets.values():
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


def abbreviateKeys(data):
    courseKeys = ['code', 'name', 'streams', 'term']
    streamKeys = ['component', 'enrols', 'status', 'times', 'web']
    for course in data:
        for key in courseKeys:
            if key in course:
                course[key[0]] = course[key]
                del course[key]

        for stream in course['s']:
            for key in streamKeys:
                if key in stream:
                    stream[key[0]] = stream[key]
                    del stream[key]

    return data


def parseTimeStr(string):
    # Remove /odd and /even, as well as Comb/w descriptors
    string = string.replace('/odd', '').replace('/even', '')
    string = re.sub(r'Comb/w.*', '', string).strip()

    # Return empty list if no time data is given
    if string == '':
        return []

    # Split into individual class times
    if '; ' in string:
        # Split into substrings and parse them individually
        streams = []
        for subString in string.split('; '):
            streams += parseTimeStr(subString)

        # Remove any duplicate times
        final = {}
        for stream in streams:
            if stream[0] not in final:
                final[stream[0]] = list(stream)

        return list(map(tuple, final.values()))

    time = tidyUpTime(string.split('(', maxsplit=1)[0].strip())
    if time is None:
        return []

    location = ''
    weeks = ''

    if '(' in string:
        # Keep only the text within the brackets
        string = string[string.find('(') + 1:string.find(')')]
        weeks = getWeeks(string)

        if weeks is None:
            return []

        if ', ' in string:
            location = string[string.find(', '):].strip(', ')
        # NB: No buildings start with lowercase 'w', only week ranges
        elif string[0] != 'w':
            location = string

        # Standardise 'See School' locations to be blank
        if location.lower() == 'see school':
            location = ''

    return [(time, location, weeks)]


def tidyUpTime(timestr):
    # If the class runs on Saturday or Sunday, don't include it
    if timestr[0].lower() == 's':
        return None

    # Change day TLAs to single letters
    days = {'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'H', 'Fri': 'F'}
    for day, letter in days.items():
        timestr = timestr.replace(day + ' ', letter)

    # Use decimal notation for half-hours
    timestr = timestr.replace(':30', '.5')

    # Remove some extra zeros
    timestr = timestr.replace('08', '8').replace('09', '9')

    # Don't include anything with multiple days (usually intensives)
    if timestr[:2].isalpha():
        return None

    # Don't include anything with the time "00-00"
    if '00-00' in timestr:
        return None

    return timestr


def getWeeks(string):
    weeks = string.split(', ')[0].strip(', ')

    # Week data always begins with a 'w', so don't continue with anything else
    if weeks[0] != 'w':
        return ''

    # Remove the 'w' now
    weeks = weeks.strip('w')

    # Remove any weeks that aren't in the main semester timetable
    weeks = weeks.replace('< 1', '')
    weeks = weeks.replace('11', '')
    weeks = re.sub(r'-?N[0-9]+', '', weeks)
    weeks = re.sub(r',[, ]*', ',', weeks).strip(', ')

    # If weeks is now empty, then this class runs entirely outside of
    # the main term weeks; return None so as to not include this class
    if weeks == '':
        return None

    return weeks
