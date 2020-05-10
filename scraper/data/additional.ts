import { CourseData } from '../../app/src/state';

const unsw: CourseData[] = [
  {
    code: 'CBS',
    name: 'Campus Bible Study',
    isAdditional: true,
    autoSelect: true,
    defaultColour: 'indigo',
    description: "Campus Bible Study is a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
    metadata: {
      promoText: "This tool is provided by {link} — a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
      website: 'https://www.campusbiblestudy.org',
      signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/640/responses/new',
      signupValidFor: [{ year: 2020, term: 2 }],
    },
    streams: [
      {
        component: 'Growth Groups',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T11-13' }],
      },
      {
        component: 'Growth Groups',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'W12-14' }],
      },
      {
        component: 'Growth Groups',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'H10-12' }],
      },
      {
        component: 'Training',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'T14' }],
      },
      {
        component: 'Training',
        full: false,
        enrols: [0, 0],
        times: [{ 'time': 'H13' }],
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
