import { MinistryMeta } from '../../app/src/state/Meta';
import { CampusAdditional } from './types';


const CBS_BASE_META: MinistryMeta = {
  promoText: "This tool is provided by {link} — a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
  website: 'https://www.campusbiblestudy.org',
  signupURL: '',
  signupValidFor: [],
};

// CBS event names
// To add a new event, add the name here before adding times below
enum CBSComponent {
  TBT = 'The Bible Talks',
  BS = 'Bible Study',
  BS_PAD = 'Bible Study (Paddington)',
  CORE_THEO = 'Core Theology',
  CORE_TRAIN = 'Core Training',
  PRAYER = 'Prayer Group',
  LUNCH = 'Lunch',
}


const unsw: CampusAdditional<CBSComponent> = {
  default: [
    {
      code: 'CBS',
      name: 'Campus Bible Study',
      isAdditional: true,
      autoSelect: true,
      defaultColour: 'indigo',
      metadata: {
        ...CBS_BASE_META,
        signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/876/responses/new',
        signupValidFor: [{ year: 2022, term: 3 }],
      },
      streams: [
        {
          component: CBSComponent.TBT,
          times: [{ time: 'T12' }],
        },
        {
          component: CBSComponent.TBT,
          times: [{ time: 'W12' }],
        },
        {
          component: CBSComponent.TBT,
          times: [{ time: 'H12' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'M11' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'M13' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'T10' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'T14' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'W11' }],
        },
        {
          component: CBSComponent.BS_PAD,
          times: [{ time: 'W13' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'H10' }],
        },
        {
          component: CBSComponent.BS_PAD,
          times: [{ time: 'H13' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'F12' }],
        },
        {
          component: CBSComponent.CORE_THEO,
          times: [{ time: 'T16', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_THEO,
          times: [{ time: 'W14', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_TRAIN,
          times: [{ time: 'T15', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_TRAIN,
          times: [{ time: 'W15', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_TRAIN,
          times: [{ time: 'H14', weeks: '2-10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'M12' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'T11' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'W10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'H11' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'F13' }],
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'T13' }],
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'W13' }],
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'H13' }],
        },
      ],
    },
  ],
};

export default unsw;
