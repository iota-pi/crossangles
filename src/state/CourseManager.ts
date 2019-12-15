import { CustomCourse } from ".";
import Course, { CourseId, CourseData } from "./Course";

export interface StoredCourseManager {
  official: CourseData[],
  additional: CourseData[],
  custom: CourseData[],
};

const customSort = (a: Course, b: Course) => +(a.name > b.name) - +(a.name < b.name);

export class CourseManager {
  private _official: Course[];
  private _additional: Course[];
  private _custom: CustomCourse[];
  private _all: (Course | CustomCourse)[];
  private map: Map<CourseId, Course | CustomCourse>;
  private update_lock: boolean = false;

  constructor (data?: CourseManager) {
    if (data) {
      this._official = data._official;
      this._additional = data._additional;
      this._custom = data._custom;
      this._all = data._all;
      this.map = new Map(data.map);
    } else {
      this._official = [];
      this._additional = [];
      this._custom = [];
      this._all = [];
      this.map = new Map();
    }
  }

  get (key: string) {
    return this.map.get(key);
  }

  has (key: string) {
    return this.map.has(key);
  }

  get size () {
    return this.map.size;
  }

  get official () {
    return this._official.slice();
  }

  get additional () {
    return this._additional.slice();
  }

  get custom () {
    return this._custom.slice();
  }

  get all () {
    return this._all.slice();
  }

  update_official (official: Course[]) {
    this._official = official;
    this.update();
  }

  update_additional (additional: Course[]) {
    this._additional = additional;
    this.update();
  }

  update_custom (custom: CustomCourse[]) {
    this._custom = custom.sort(customSort);
    this.update();
  }

  update_all (official: Course[], additional: Course[], custom: CustomCourse[]) {
    this.update_lock = true;
    this.update_official(official);
    this.update_additional(additional);
    this.update_custom(custom);
    this.update_lock = false;
    this.update();
  }

  private update () {
    if (this.update_lock) return;

    this._all = [...this._official, ...this._additional, ...this._custom];
    this.map = new Map(this.all.map(c => [c.id, c]));
  }

  store (): StoredCourseManager {
    return {
      official: this._official.map(c => c.data),
      additional: this._additional.map(c => c.data),
      custom: this._custom.map(c => c.data),
    };
  }

  static load (data: StoredCourseManager) {
    const cm = new CourseManager();
    const official = data.official.map(c => new Course(c));
    const additional = data.additional.map(c => new Course(c));
    const custom = data.custom.map(c => new CustomCourse(c));
    cm.update_all(official, additional, custom);
    return cm;
  }
}

export default CourseManager;
