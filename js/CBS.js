
function weeks(start, end) {
    return (Math.pow(2, end) - 1) - (Math.pow(2, start) - 1);
}

var CBS = {
    TBT: [
            { time: 'T 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: [''], weeks: weeks(1, 13) },
            { time: 'T 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: [''], weeks: weeks(1, 13) },
            { time: 'H 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: [''], weeks: weeks(1, 13) },
            { time: 'H 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'The Bible Talks', location: [''], weeks: weeks(1, 13) }
        ],
    CoreTheo: [
            { time: 'T 17', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Theology', location: [''], weeks: weeks(2, 12) },
            { time: 'W 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Theology', location: [''], weeks: weeks(2, 12) }
        ],
    CoreTrain: [
            { time: 'T 16', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial'], weeks: weeks(2, 12) },
            { time: 'T 18', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial'], weeks: weeks(2, 12) },
            { time: 'W 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial'], weeks: weeks(2, 12) },
            { time: 'W 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Core Training', location: ['Quad Sundial'], weeks: weeks(2, 12) }
        ],
    BibleStudy: [
            { time: 'M 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'M 12', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'M 13', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'M 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'T 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'T 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'W 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'H 11', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) },
            { time: 'H 14', status: 'O', enrols: '0,1', course: 'CBS', component: 'Bible Study', location: ['Quad Sundial'], weeks: weeks(1, 13) }
        ]
};
