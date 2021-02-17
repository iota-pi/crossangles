import { CourseData, getCourseId } from '../../app/src/state/Course';
import { MinistryMeta } from '../../app/src/state/Meta';
import { DeliveryType } from '../../app/src/state/Stream';

type CampusAdditional = { default: CourseData[], [campus: string]: CourseData[] };

const CBS_BASE_META: MinistryMeta = {
  promoText: "This tool is provided by {link} — a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
  website: 'https://www.campusbiblestudy.org',
  signupURL: '',
  signupValidFor: [],
};
const EU_BASE_META: MinistryMeta = {
  promoText: "This tool is provided by {link} — a group of people at USYD who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, {link} is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
  website: 'https://sueu.org.au/',
  signupURL: '',
  signupValidFor: [],
};

const unsw: CampusAdditional = {
  default: [
    {
      code: 'CBS',
      name: 'Campus Bible Study',
      isAdditional: true,
      autoSelect: true,
      defaultColour: 'indigo',
      description: "Campus Bible Study is a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
      metadata: { ...CBS_BASE_META },
      streams: [
        {
          component: 'Growth Groups',
          times: [{ time: 'M12-14' }],
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'T11-13' }],
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'W12-14' }],
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'H9-11' }],
        },
        {
          component: 'Core Theology',
          times: [{ time: 'T15' }],
        },
        {
          component: 'Core Theology',
          times: [{ time: 'H12' }],
        },
        {
          component: 'Core Training',
          times: [{ time: 'T14' }],
        },
        {
          component: 'Core Training',
          times: [{ time: 'H13' }],
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
          times: [{ time: 'M14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'T14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'W14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'H14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'F14' }],
        },
      ],
    },
  ],
  '2020~3': [
    {
      code: 'CBS',
      name: 'Campus Bible Study',
      metadata: {
        ...CBS_BASE_META,
        signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/655/responses/new',
        signupValidFor: [{ year: 2020, term: 3 }],
      },
      streams: [
        {
          component: 'Growth Groups',
          times: [{ time: 'M12-14' }],
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'T11-13' }],
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'W12-14' }],
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'H9-11' }],
        },
        {
          component: 'Core Theology',
          times: [{ time: 'T15' }],
        },
        {
          component: 'Core Theology',
          times: [{ time: 'H12' }],
        },
        {
          component: 'Core Training',
          times: [{ time: 'T14' }],
        },
        {
          component: 'Core Training',
          times: [{ time: 'H13' }],
        },
      ],
    },
  ],
  '2021~1': [
    {
      code: 'CBS',
      name: 'Campus Bible Study',
      metadata: {
        ...CBS_BASE_META,
        signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/698/responses/new',
        signupValidFor: [{ year: 2021, term: 1 }],
      },
      streams: [
        {
          component: 'The Bible Talks',
          times: [{ time: 'T13' }],
          delivery: DeliveryType.either,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'W13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'H12' }],
          delivery: DeliveryType.either,
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'M12.5-14' }],
          delivery: DeliveryType.either,
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'T11-12.5' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'W11-12.5' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'H10-11.5' }],
          delivery: DeliveryType.either,
        },
        {
          component: 'Growth Groups',
          times: [{ time: 'F11-12.5' }],
          delivery: DeliveryType.either,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'T16' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'H14' }],
          delivery: DeliveryType.either,
        },
        {
          component: 'Core Training',
          times: [{ time: 'T15' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'H13' }],
          delivery: DeliveryType.either,
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
          times: [{ time: 'M14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'T14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'W14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'H14' }],
        },
        {
          component: 'Street Talk',
          times: [{ time: 'F14' }],
        },
      ],
    },
  ],
};

const usyd: CampusAdditional = {
  default: [
    {
      code: 'EU',
      name: 'Evangelical Union',
      isAdditional: true,
      autoSelect: true,
      defaultColour: 'lightGreen',
      description: "Evangelical Union is a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Evangelical Union is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
      metadata: { ...EU_BASE_META },
      streams: [
        {
          component: 'Weekly Talks',
          times: [{ time: 'M20' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'T17' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'T20' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'W17' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'H8.5' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'H13' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'H15' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'H17.5' }],
        },
        {
          component: 'Weekly Talks',
          times: [{ time: 'H20' }],
        },
        {
          component: 'Equip Training',
          times: [{ time: 'W9' }],
        },
        {
          component: 'Equip Training',
          times: [{ time: 'W15' }],
        },
        {
          component: 'Equip Training',
          times: [{ time: 'H9' }],
        },
        {
          component: 'Equip Training',
          times: [{ time: 'H15' }],
        },
      ],
    },
  ],
};

const additional = {
  unsw,
  usyd,
};

/**
 * Returns the additional data for the given campus and term. If there is
 * specific data for the given term, it is merged with the campus default data.
 * @param campus the name of the campus
 * @param term the year and term in the form of e.g. "2020~3"
 */
function getAdditional(campus: keyof typeof additional, term?: string): CourseData[] {
  const baseData = additional[campus].default;
  const override = term !== undefined ? additional[campus][term] : undefined;
  if (override === undefined) return baseData;
  return override.map(course => {
    const baseCourse = baseData.find(c => getCourseId(c) === getCourseId(course));
    return { ...baseCourse, ...course };
  });
}

export default getAdditional;
