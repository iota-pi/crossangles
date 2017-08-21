# CrossAngles
~~Soon to be~~ The best UNSW timetabling program in existance!

## Ideas to implement

  * Better favicon
  * Prettier "create timetable" button

## How it works
The timetable data is scraped from a UNSW service called [classutil](http://classutil.unsw.edu.au). This tool is updated at 5am, 12pm, and 6pm. As such the scraping script (`scraper.py`) is run five minutes after those times. This is achieved via a Cron job.

## The purpose
The goal of this project is to provide UNSW students, and particularly those involved in Campus Bible Study, a tool to help them to create their timetable in a way which best suits them, and helps them to be able to attend Campus Bible Study events.

We aim to generate a reasonably good timetable for users, however because everyone has their own preferences, we simply try to do a "good enough" job of this. Users are able to easily customise their timetable by dragging their classes around. Since people seem to enjoy the feeling of improving their timetable in this way, I don't expect that we will need to add more options to customise the generation process.
