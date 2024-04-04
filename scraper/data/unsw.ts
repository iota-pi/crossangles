import type { MinistryMeta } from '../../app/src/state/Meta';
import type { CampusAdditional } from './types';


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
  HANG = 'Sport + Hangs',
  SIMPLY_JESUS = 'Simply Jesus',
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
        signupURL: 'https://campusbiblestudy.org/signup',
        signupValidFor: [{ year: 2024, term: 2 }],
      },
      streams: [
        {
          component: CBSComponent.TBT,
          times: [{ time: 'T13' }],
        },
        {
          component: CBSComponent.TBT,
          times: [{ time: 'W13' }],
        },
        {
          component: CBSComponent.TBT,
          times: [{ time: 'H13' }],
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
          times: [{ time: 'T11' }],
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
          times: [{ time: 'H11' }],
        },
        {
          component: CBSComponent.BS_PAD,
          times: [{ time: 'H13' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'F11' }],
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
          times: [{ time: 'M12', weeks: '2-10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'T12', weeks: '2-10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'W12', weeks: '2-10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'H12', weeks: '2-10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'F12', weeks: '2-10' }],
        },
        {
          component: CBSComponent.HANG,
          times: [{ time: 'W16' }],
        },
        {
          component: CBSComponent.SIMPLY_JESUS,
          times: [{ time: 'W12' }],
        },
      ],
    },
  ],
};

export default unsw;
