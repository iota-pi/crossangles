import { CourseData } from '../../app/src/state/Course';

const unsw: CourseData[] = [
  {
    code: 'CBS',
    name: 'Campus Bible Study',
    isAdditional: true,
    autoSelect: true,
    defaultColour: '#303F9F',
    description: "Campus Bible Study is a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
    metadata: {
      promoText: "This tool is provided by {link} — a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
      website: 'https://www.campusbiblestudy.org',
      signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/605/responses/new',
      signupValidFor: [{ year: 2020, term: 1 }],
    },
    streams: [
      {
        component: 'The Bible Talks',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T12' }],
      },
      {
        component: 'The Bible Talks',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T13' }],
      },
      {
        component: 'The Bible Talks',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'W12' }],
      },
      {
        component: 'The Bible Talks',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'H12' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'M11' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'M12' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'M13' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'M14' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T11' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T14' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'W11' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'W13' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'H11' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'H13' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'F12' }],
      },
      {
        component: 'Bible Study',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'F13' }],
      },
      {
        component: 'Core Theology',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T16' }],
      },
      {
        component: 'Core Theology',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'W14' }],
      },
      {
        component: 'Core Training',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T15' }],
      },
      {
        component: 'Core Training',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T17' }],
      },
      {
        component: 'Core Training',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'W15' }],
      },
      {
        component: 'Core Training',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'H14' }],
      },
    ],
  },
  {
    code: 'Street Talk',
    name: 'Street Talk',
    isAdditional: true,
    streams: [
      {
        component: 'Street Talk',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'M15' }],
      },
      {
        component: 'Street Talk',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T15' }],
      },
      {
        component: 'Street Talk',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'W15' }],
      },
      {
        component: 'Street Talk',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'H15' }],
      },
      {
        component: 'Street Talk',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'F15' }],
      },
    ],
  },
];

const additional = {
  unsw,
};

export default additional;
