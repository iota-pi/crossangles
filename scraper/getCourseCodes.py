#!/usr/bin/env python3

import json
import requests

def getUGCourses():
    with open('handbook-request.json') as f:
        payload = json.load(f)
    r = requests.post('https://www.handbook.unsw.edu.au/api/es/search', json=payload)
    handbook = json.loads(str(r.content, encoding='utf-8'))

    mappingUG = {}
    for course in handbook['contentlets']:
        code = course['code']
        name = course['name']
        mappingUG[code] = name

    return mappingUG

if __name__ == '__main__':
    print('Loading handbook')
    mapping = getUGCourses()
    print('Writing output file')
    with open('courses.json', 'w') as f:
        json.dump(mapping, f)
    print('Done')
