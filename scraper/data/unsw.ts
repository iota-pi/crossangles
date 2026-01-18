import type { MinistryMeta } from '../../app/src/state/Meta'
import { ALL_DAYS } from '../../app/src/state/Session'
import type { CampusAdditional } from './types'


const CBS_BASE_META: MinistryMeta = {
  promoText: "This tool is provided by {link} — a group of people at UNSW who are interested in learning together about Jesus from the Bible. Whether you follow Jesus, or want to find out what he's all about, Campus Bible Study is a great place for you to learn more. If you've never come before, we recommend checking out the Bible talks.",
  website: 'https://www.campusbiblestudy.org',
  signupURL: '',
  signupValidFor: [],
}

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
  LUNCH = 'Lunch',
  BLT = 'Bible Study Leaders Training',
  OUTREACH = 'Outreach',
}


const BASE_UNSW_DATA: CampusAdditional<CBSComponent> = {
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
        signupValidFor: [{ year: 2026, term: 1 }],
      },
      streams: [
        {
          component: CBSComponent.TBT,
          times: [{ time: 'T12' }],
        },
        {
          component: CBSComponent.TBT,
          times: [{ time: 'T13' }],
        },
        {
          component: CBSComponent.TBT,
          times: [{ time: 'W12' }],
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
          times: [{ time: 'M12' }],
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
          times: [{ time: 'W11' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'H11' }],
        },
        {
          component: CBSComponent.BS_PAD,
          times: [{ time: 'W13' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'F12' }],
        },
        {
          component: CBSComponent.BS_PAD,
          times: [{ time: 'H13' }],
        },
        {
          component: CBSComponent.BS,
          times: [{ time: 'F13' }],
        },
        {
          component: CBSComponent.CORE_THEO,
          times: [{ time: 'T15', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_THEO,
          times: [{ time: 'W15', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_TRAIN,
          times: [{ time: 'T14', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_TRAIN,
          times: [{ time: 'W14', weeks: '2-10' }],
        },
        {
          component: CBSComponent.CORE_TRAIN,
          times: [{ time: 'H14', weeks: '2-10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'T10' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'W9' }],
        },
        {
          component: CBSComponent.PRAYER,
          times: [{ time: 'H15' }],
        },
        {
          component: CBSComponent.HANG,
          times: [{ time: 'T16' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.HANG,
          times: [{ time: 'W16' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'T12' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'T13' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'W12' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'W13' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.LUNCH,
          times: [{ time: 'H12' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.BLT,
          times: [{ time: 'T16' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.BLT,
          times: [{ time: 'W10' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.BLT,
          times: [{ time: 'H12' }],
          options: { notOnlyEvent: true },
        },
        {
          component: CBSComponent.OUTREACH,
          times: [],
          options: {
            placeHolder: true,
            notOnlyEvent: true,
          },
        },
      ],
    },
  ],
}

function transformCBSEvents(data: CampusAdditional<CBSComponent>): CampusAdditional<CBSComponent> {
  const updatedData: typeof data = { default: [] }
  for (const term of Object.keys(data)) {
    const updatedTerm: typeof data[typeof term] = []

    for (const course of data[term]) {
      const updatedCourse: typeof course = { ...course, streams: [] }
      for (const stream of course.streams) {
        if (stream.times.length > 0) {
          updatedCourse.streams.push(stream)
        } else if (stream.options?.placeHolder) {
          // Add a stream for every possible time slot if it's a placeholder event
          const startHour = 8
          const endHour = 21
          for (const day of ALL_DAYS) {
            for (let hour = startHour; hour < endHour; ++hour) {
              const time = `${day}${hour}`
              updatedCourse.streams.push({
                ...stream,
                times: [{ time }],
              })
            }
          }
        }
      }
      updatedTerm.push(updatedCourse)
    }
    updatedData[term] = updatedTerm
  }

  return updatedData
}

const unsw = transformCBSEvents(BASE_UNSW_DATA)

export default unsw
