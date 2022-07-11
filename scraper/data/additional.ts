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
      metadata: {
        ...CBS_BASE_META,
        signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/813/responses/new',
        signupValidFor: [{ year: 2022, term: 1 }],
      },
      streams: [
        {
          component: 'The Bible Talks',
          times: [{ time: 'T12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'W12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'H12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'M12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'T10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T14' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'W11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'W16' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'H11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'H15' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'F12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'T16', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'W14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'T15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'W15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'H14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'M11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'T17' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'W10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'F13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'T13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'W13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'H13' }],
          delivery: DeliveryType.person,
        },
      ],
    },
  ],
  '2022~1': [
    {
      code: 'CBS',
      name: 'Campus Bible Study',
      isAdditional: true,
      autoSelect: true,
      defaultColour: 'indigo',
      metadata: {
        ...CBS_BASE_META,
        signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/813/responses/new',
        signupValidFor: [{ year: 2022, term: 1 }],
      },
      streams: [
        {
          component: 'The Bible Talks',
          times: [{ time: 'T12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'W12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'H12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'M12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'T10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T14' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'W11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'W16' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'H11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'H15' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'F12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'T16', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'W14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'T15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'W15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'H14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'M11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'T17' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'W10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'F13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'T13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'W13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'H13' }],
          delivery: DeliveryType.person,
        },
      ],
    },
  ],
  '2022~2': [
    {
      code: 'CBS',
      name: 'Campus Bible Study',
      isAdditional: true,
      autoSelect: true,
      defaultColour: 'indigo',
      metadata: {
        ...CBS_BASE_META,
        signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/849/responses/new',
        signupValidFor: [{ year: 2022, term: 2 }],
      },
      streams: [
        {
          component: 'The Bible Talks',
          times: [{ time: 'T12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'W12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'H12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'T10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T14' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'W11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'H11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'H13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'H15' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'F12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'T16', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'W14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'T15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'W15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'H14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'M11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'T10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'W10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'F13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'T13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'W13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'H13' }],
          delivery: DeliveryType.person,
        },
      ],
    },
  ],
  '2022~3': [
    {
      code: 'CBS',
      name: 'Campus Bible Study',
      isAdditional: true,
      autoSelect: true,
      defaultColour: 'indigo',
      metadata: {
        ...CBS_BASE_META,
        signupURL: 'https://campusbiblestudy.ccbchurch.com/goto/forms/849/responses/new',
        signupValidFor: [{ year: 2022, term: 2 }],
      },
      streams: [
        {
          component: 'The Bible Talks',
          times: [{ time: 'T12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'W12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'The Bible Talks',
          times: [{ time: 'H12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'M13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'T10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'T14' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'W11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'H11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study (Art & Design)',
          times: [{ time: 'H13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Bible Study',
          times: [{ time: 'F12' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'T16', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Theology',
          times: [{ time: 'W14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'T15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'W15', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Core Training',
          times: [{ time: 'H14', weeks: '2-10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'M11' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'T10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'W10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'H10' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Prayer Group',
          times: [{ time: 'F13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'T13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'W13' }],
          delivery: DeliveryType.person,
        },
        {
          component: 'Lunch',
          times: [{ time: 'H13' }],
          delivery: DeliveryType.person,
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
