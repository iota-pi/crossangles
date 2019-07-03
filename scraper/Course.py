from typing import List, Tuple, Dict, DefaultDict, Union, Optional
from collections import defaultdict
import math
import json
import re
import os
from Stream import Stream

__all__ = ['Course']

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with open('courses.json') as f:
    COURSE_NAMES = json.load(f)


class Course:
    def __init__(self, code: str, name: str, streams: List[Stream]) -> None:
        self.code = code
        self.name = name
        self.streams = streams

        # Get term disambiguation
        self.term: Optional[str] = None
        termMatch = re.search(r' \(([A-Z][A-Z0-9]{2})\)', name)
        if termMatch is not None:
            self.term = termMatch.group(1)

    @property
    def full_name(self):
        if self.code in COURSE_NAMES:
            return COURSE_NAMES[self.code]

        # If no full name is found, fall back to the initial (abridged) name
        return self.name

    def add_stream(self, component, section, status, enrols, times):
        # Create stream object
        stream = Stream(
            component=component,
            section=section,
            status=status,
            enrols=enrols,
            times=times
        )

        # Include the stream iff all it's attributes are valid
        if stream.included:
            self.streams.append(stream)

        return stream

    def remove_duplicates(self):
        # Group streams into sets by component and time
        stream_sets: DefaultDict[Tuple[str, Tuple[str]], List[Stream]] = defaultdict(list)
        for stream in self.streams:
            # Get stream times
            if not stream.web:
                # Extract just the times
                # (there is also location and weeks data in the tuples that we
                #  don't want to group on)
                times = tuple(time[0] for time in stream.times)
            else:
                # Web streams don't have any associated time
                times = None

            stream_sets[(stream.component, times)].append(stream)

        # Remove all duplicate streams (same course, component, and time)
        to_delete = []
        for streams in stream_sets.values():
            # Get the stream with the emptiest class (emptiest by ratio)
            best_stream = None
            best_ratio = math.inf
            for stream in streams:
                enrols, capacity = stream.enrols.split('/')
                ratio = float(enrols) / float(capacity)

                if ratio < best_ratio:
                    best_ratio = ratio
                    best_stream = stream

            # Remove every other stream
            to_delete.extend(stream for stream in streams if stream is not best_stream)

        # Remove streams marked for deletion
        for stream in to_delete:
            self.streams.remove(stream)

    def to_dict(self) -> Dict[str, Union[str, List[Dict[str, str]]]]:
        result = {
            'c': self.code,
            'n': self.full_name,
            's': [stream.to_dict() for stream in self.streams]
        }

        if self.term is not None:
            result['t'] = self.term

        return result
