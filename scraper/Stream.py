from typing import List, Tuple, Dict, Set, Optional, Union
import re

TimeStr = List[Tuple[str, str, str]]


class Stream:
    def __init__(self, component: str, status: str, enrols: str, times: str, section: str):
        # Set stream component (e.g. LEC, TUT, etc.)
        self.component = component

        # Set stream status
        status = status.strip('*')
        codes = {'Full': 0, 'Open': 1}
        self.status = codes.get(status)

        # Set stream enrolment status
        enrols = enrols.split()[0]
        self.enrols = enrols

        # Handle times and web stream
        self.times: Optional[TimeStr] = None
        self.web = False
        if 'WEB' not in section:
            self.times = parse_time_str(times)
        else:
            self.web = True

            # Standardise all web streams as having component 'LEC'
            self.component = 'LEC'

    @property
    def included(self):
        if self.component == 'CRS':
            return False
        if self.status is None:
            return False
        if self.enrols[-2:] == '/0':
            return False
        if (not self.web) and len(self.times) == 0:
            return False

        return True

    def to_dict(self) -> Dict[str, Union[str, int, Optional[TimeStr]]]:
        result: Dict[str, Union[str, int, Optional[TimeStr]]] = {
            'c': self.component,
            's': self.status,
            'e': self.enrols,
            't': self.times
        }

        # if self.times is not None:
        #     result['t'] = self.times

        if self.web:
            result['w'] = 1 if self.web else 0

        return result


def parse_time_str(string: str) -> TimeStr:
    # Remove /odd and /even, as well as Comb/w descriptors
    string = re.sub(r'/odd|/even|Comb/w.*', '', string).strip()

    # Return empty list if no time data is given
    if string == '':
        return []

    # Split into individual class times
    if '; ' in string:
        # Split into substrings and parse them individually
        times: TimeStr = []
        for subString in string.split('; '):
            times += __parse_time_str(subString)

        # Remove any duplicate times
        seen_times: Set[str] = set()
        final: TimeStr = []
        for time in times:
            if time[0] not in seen_times:
                seen_times.add(time[0])
                final.append(time)

        return final
    else:
        return __parse_time_str(string)


def __parse_time_str(string: str) -> TimeStr:
    time = tidyUpTime(string.split('(', maxsplit=1)[0].strip())
    if time is None:
        return []

    location = ''
    weeks: Optional[str] = ''

    if '(' in string:
        # Keep only the text within the brackets
        string = string[string.find('(') + 1:string.find(')')]
        weeks = getWeeks(string)

        if weeks is None:
            return []

        if ', ' in string:
            location = string[string.find(', '):].strip(', ')
        # NB: No buildings start with lowercase 'w', only week ranges
        elif len(string) and string[0] != 'w':
            location = string

        # Standardise 'See School' locations to be blank
        if location.lower() == 'see school':
            location = ''

    return [(time, location, weeks or '')]


def tidyUpTime(time_str: str) -> Optional[str]:
    # Return None for strings with no distinct time
    if time_str == '' or '00-00' in time_str:
        return None

    # Change day TLAs to single letters
    days = {'Mon': 'M', 'Tue': 'T', 'Wed': 'W', 'Thu': 'H', 'Fri': 'F', 'Sat': 'S', 'Sun': 's'}
    for day, letter in days.items():
        time_str = time_str.replace(day + ' ', letter)

    # Use decimal notation for half-hours
    time_str = time_str.replace(':30', '.5')

    # Remove leading zeros
    time_str = re.sub(r'(?<=[MTWHF])0(?=[0-9])', '', time_str)

    # Don't include anything with multiple days (usually intensives) or on which runs on weekends
    if time_str[:2].isalpha() or 's' in time_str.lower():
        return None

    return time_str


def getWeeks(week_string: str) -> Optional[str]:
    weeks = week_string.split(', ')[0].strip(', ')

    if weeks == '':
        return weeks

    # Week data always begins with a 'w', so don't continue with anything else
    if weeks[0] != 'w':
        return ''

    # Remove the 'w' now
    weeks = weeks.lstrip('w')

    # # Replace ranges that extend outside the semester with the final week of semester ()
    # weeks = re.sub(r'(?<!10)-N[0-9]+', '-10', weeks)

    # Remove any weeks that aren't in the main semester timetable
    weeks = weeks.replace('< 1', '')
    # weeks = re.sub(r'-?N[0-9]+', '', weeks)
    # weeks = re.sub(r'(?<!-)N[0-9]+', '', weeks)

    # Remove excess commas and spaces
    weeks = re.sub(r',[, ]*', ',', weeks).strip(', ')

    # Don't include classes that only run in week 11
    if weeks == '11':
        return None

    # If weeks is now empty, then this class runs entirely outside of
    # the main term weeks; return None so as to not include this class
    if weeks == '':
        return None

    return weeks
