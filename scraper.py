#!/usr/bin/python3

from lxml import html, etree

class Scraper:
	def __init__(self):
		self.removeADFA = True
	
	def scrape(self):
        pass
    
    def loadFacultyPages(self):
        pass
    
    def getFacultyLinks(self):
        page = html.fromstring(requests.get('http://classutil.unsw.edu.au/').content)
    
    def loadPages(self, *args, **kwargs):
        if 'prefix' in **kwargs:
            urls = (kwargs['prefix'] + arg for arg in args)
        else:
            urls = args
        
        requests = (grequests.get(url) for url in urls)
        pages = grequests.map(requests)
    
    def removeComments(self, *pages):
        for page in pages:
            pass
        
