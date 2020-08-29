import { notUndefined } from '../../typeHelpers';
import { SessionPlacement } from './SessionPlacement';
import { TimetablePosition, Dimensions } from './timetableTypes';
import {
  CourseMap,
  CourseData,
  getCourseId,
  AdditionalEvent,
  getEventId,
  SessionId,
  LinkedSession,
  getComponentId,
} from '../../state';
import { sessionClashLength, getClashInfo } from '../../timetable/getClashInfo';
import { DropzonePlacement } from './DropzonePlacement';
import { SessionManagerData, SessionManagerEntriesData } from './SessionManagerTypes';
import { TimetableScorer } from '../../timetable/scoreTimetable';

export * from './SessionManagerTypes';


export class SessionManager {
  private map: Map<SessionId, SessionPlacement>;
  private _renderOrder: SessionId[];
  private _order: SessionId[];
  private _version: number;
  private _score: number;
  private _changing: number;
  callback: ((timetable: SessionManagerData) => void) | undefined;

  constructor(base?: SessionManager) {
    if (base) {
      this.map = new Map(base.map);
      this._order = base._order.slice();
      this._renderOrder = base._renderOrder.slice();
      this._version = base._version;
      this._score = base._score;
      this._changing = 0;
    } else {
      this.map = new Map<SessionId, SessionPlacement>();
      this._order = [];
      this._version = 0;
      this._score = 0;
      this._changing = 0;
      this._renderOrder = [];
    }
  }

  get data(): SessionManagerData {
    const mapData: SessionManagerEntriesData = [];
    this.map.forEach((placement, sessionId) => {
      mapData.push([sessionId, placement.data]);
    });
    return {
      map: mapData,
      order: this._order.slice(),
      renderOrder: this._renderOrder.slice(),
      version: this.version,
      score: this._score,
    };
  }

  static from(data: SessionManagerData, courses: CourseMap): SessionManager {
    const mapData: [SessionId, SessionPlacement][] = [];
    for (const item of data.map.entries()) {
      const [sid, s] = item[1];
      const course = courses[s.session.course];
      const placement = SessionPlacement.from(s, course);
      if (placement !== null) {
        mapData.push([sid, placement]);
      }
    }

    const sm = new SessionManager();
    sm.map = new Map(mapData);
    sm._order = data.order.filter(sid => sm.map.has(sid));
    sm._renderOrder = data.renderOrder.filter(sid => sm.map.has(sid));
    sm._version = data.version;
    sm._score = data.score;
    return sm;
  }

  get version() {
    return this._version;
  }

  get score() {
    return this._score;
  }

  get order() {
    return this._order;
  }

  get renderOrder() {
    return this._renderOrder;
  }

  get renderOrderSessions(): LinkedSession[] {
    return this._renderOrder.map(sid => this.getSession(sid));
  }

  getTouchedSessions(allCourses: CourseData[], events: AdditionalEvent[]) {
    const allCourseIds = allCourses.map(c => getCourseId(c));
    const touchedSessions = this.renderOrderSessions.filter(s => this.get(s.id).touched);
    const eventIds = events.map(e => e.id);

    // Filter by included courses and events
    const fixedSessions = touchedSessions.filter(session => {
      const eventId = getEventId(session.course, session.stream.component);
      if (session.course.isAdditional && !eventIds.includes(eventId)) {
        return false;
      }

      if (!allCourseIds.includes(getCourseId(session.course))) {
        return false;
      }

      return true;
    });

    return fixedSessions;
  }

  getOrder(sessionId: SessionId) {
    return this._order.indexOf(sessionId);
  }

  get(sessionId: SessionId): SessionPlacement {
    return notUndefined(this.getMaybe(sessionId));
  }

  getMaybe(sessionId: SessionId): SessionPlacement | undefined {
    return this.map.get(sessionId);
  }

  getSession(sessionId: SessionId): LinkedSession {
    return this.get(sessionId).session;
  }

  has(sessionId: SessionId): boolean {
    return this.map.has(sessionId);
  }

  set(sessionId: SessionId, placement: SessionPlacement): void {
    this.map.set(sessionId, placement);

    if (!this._order.includes(sessionId)) {
      this._order = [...this._order, sessionId];
    }
    if (!this._renderOrder.includes(sessionId)) {
      this._renderOrder = [...this._renderOrder, sessionId];
    }

    this.next();
  }

  remove(sessionId: SessionId): void {
    this.startChange();
    const index = this._order.indexOf(sessionId);
    if (index !== -1) {
      this._order = [
        ...this._order.slice(0, index),
        ...this._order.slice(index + 1),
      ];

      const renderIndex = this._renderOrder.indexOf(sessionId);
      this._renderOrder = [
        ...this._renderOrder.slice(0, renderIndex),
        ...this._renderOrder.slice(renderIndex + 1),
      ];
    }

    this.map.delete(sessionId);
    this.stopChange();
  }

  removeStream(sessionId: SessionId): void {
    this.startChange();
    const sessions = this.getSession(sessionId).stream.sessions;
    for (const session of sessions) {
      this.remove(session.id);
    }
    this.stopChange();
  }

  replace(oldSessionId: SessionId, placement: SessionPlacement) {
    this.startChange();
    const index = this._order.indexOf(oldSessionId);
    this._order = [
      ...this._order.slice(0, index),
      ...this._order.slice(index + 1),
      placement.session.id,
    ];
    const renderIndex = this._renderOrder.indexOf(oldSessionId);
    this._renderOrder = [
      ...this._renderOrder.slice(0, renderIndex),
      placement.session.id,
      ...this._renderOrder.slice(renderIndex + 1),
    ];
    this.map.delete(oldSessionId);
    this.map.set(placement.session.id, placement);
    this.stopChange();
  }

  replaceStream(sessionId: SessionId, nextSessions: LinkedSession[], touchPlacements = true) {
    this.startChange();
    const oldStream = this.get(sessionId).session.stream;
    for (const oldSession of oldStream.sessions) {
      if (oldSession.index < nextSessions.length) {
        // Replace old session with new one
        const session = nextSessions[oldSession.index];
        const placement = new SessionPlacement(session);
        this.replace(oldSession.id, placement);
        if (touchPlacements) {
          placement.touch();
        }
      } else {
        // No corresponding new session, remove old one
        this.remove(oldSession.id);
      }
    }

    // No corresponding old session, just add new ones
    const remainingSessions = nextSessions.slice(oldStream.sessions.length);
    for (const newSession of remainingSessions) {
      const placement = new SessionPlacement(newSession);
      this.set(newSession.id, placement);
    }
    this.stopChange();
  }

  drag(sessionId: SessionId, shouldCallback = false): void {
    this.startChange();

    const session = this.get(sessionId);
    session.drag();

    const stream = session.session.stream;
    for (const otherSession of stream.sessions) {
      const otherId = otherSession.id;
      if (otherId !== sessionId) {
        this.raise(otherId);
      }
    }

    this.stopChange(shouldCallback);
  }

  move(sessionId: SessionId, delta: TimetablePosition, shouldCallback = false): void {
    const session = this.get(sessionId);
    session.move(delta);
    this.next(shouldCallback);
  }

  drop(
    sessionId: SessionId,
    dropzone: DropzonePlacement | null,
    timetableDimensions: Dimensions,
    firstHour: number,
    compact: boolean,
    shouldCallback = true,
  ): void {
    this.startChange();

    // Drop this placement
    const session = this.get(sessionId);
    session.drop(timetableDimensions, firstHour, compact);

    // Lower all linked placements
    const stream = session.session.stream;
    for (const linkedSession of stream.sessions) {
      const linkedId = linkedSession.id;
      if (linkedId !== sessionId) {
        this.lower(linkedId);
      }
    }

    // Snap to nearest dropzone (if there is one near enough)
    if (dropzone) {
      this.snapSessionTo(
        sessionId,
        dropzone.session.stream.sessions,
      );
    }

    // Update clash depths
    this.updateClashDepths();

    // Update timetable score
    this.updateScore();

    this.stopChange(shouldCallback);
  }

  private raise(sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.raise();
    this.next();
  }

  private lower(sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.lower();
    this.next();
  }

  snapAll(): void {
    this.startChange();
    for (const placement of this.map.values()) {
      placement.snap();
    }
    this.stopChange();
  }

  snapStream(sessionId: SessionId): void {
    this.startChange();
    const stream = this.get(sessionId).session.stream;
    for (const linkedSession of stream.sessions) {
      this.snap(linkedSession.id);
    }
    this.stopChange();
  }

  snap(sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.snap();
    this.next();
  }

  displace(sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.displace();
    this.next();
  }

  bumpSession(sessionId: SessionId): void {
    const index = this._order.indexOf(sessionId);
    if (index > -1) {
      this._order = [
        ...this._order.slice(0, index),
        ...this._order.slice(index + 1),
        sessionId,
      ];
    } else {
      throw Error(`Cannot bump unknown session id ${sessionId}`);
    }
    this.next();
  }

  bumpStream(sessionId: SessionId): void {
    this.startChange();
    const stream = this.get(sessionId).session.stream;
    for (const linkedSession of stream.sessions) {
      this.bumpSession(linkedSession.id);
    }
    this.stopChange();
  }

  setClashDepth(sessionId: SessionId, depth: number): void {
    const placement = this.get(sessionId);
    placement.clashDepth = depth;
    this.next();
  }

  private updateScore() {
    this._score = getSessionManagerScore(this);
  }

  private snapSessionTo(
    sessionId: SessionId,
    nextSessions: LinkedSession[],
  ): void {
    this.startChange();

    // Get the session which initiated this move (i.e. the dragged/dropped session)
    const initiator = this.get(sessionId).session;

    // Mark new stream as touched iff stream has changed
    const nextStreamId = nextSessions[0].stream.id;
    const prevStreamId = initiator.stream.id;
    if (nextStreamId !== prevStreamId) {
      this.replaceStream(sessionId, nextSessions);
    } else {
      this.snapStream(sessionId);
    }

    this.stopChange();
  }

  updateClashDepths() {
    this.startChange();

    for (let i = 0; i < this._order.length; ++i) {
      const takenDepths = new Set<number>();
      const sessionId1 = this._order[i];
      const placement1 = this.get(sessionId1);

      // Only measure for sessions which are snapped
      if (placement1.isSnapped) {
        for (let j = 0; j < i; ++j) {
          const sessionId2 = this._order[j];
          const placement2 = this.get(sessionId2);

          // Skip checking other sessions which aren't snapped
          if (!placement2.isSnapped) continue;

          // Check if sessions clash
          if (sessionClashLength(placement1.session, placement2.session) > 0) {
            const jDepth = placement2.clashDepth;
            takenDepths.add(jDepth);
          }
        }
      }

      // Update clash depth
      const depth = this.findFreeDepth(takenDepths);
      this.setClashDepth(sessionId1, depth);
    }

    this.stopChange();
  }

  private findFreeDepth(takenDepths: Set<number>): number {
    for (let j = 0; j < takenDepths.size; ++j) {
      if (!takenDepths.has(j)) {
        return j;
      }
    }

    return takenDepths.size;
  }

  clear() {
    this.map.clear();
    this._order = [];
    this._renderOrder = [];
    this.next();
  }

  update(
    newSessions: LinkedSession[],
    score: number,
  ) {
    this.startChange();

    const newSessionIds = newSessions.map(s => s.id);
    const toRemoveIds = this._order.filter(s => !newSessionIds.includes(s));
    const toAdd = newSessions.filter(s => !this._order.includes(s.id));
    const newComponents = toAdd.map(s => `${getComponentId(s.course, s.stream)}~${s.index}`);

    for (const sessionId of toRemoveIds) {
      const oldSession = this.get(sessionId).session;
      const component = `${getComponentId(oldSession.course, oldSession.stream)}~${oldSession.index}`;
      const index = newComponents.indexOf(component);
      if (index > -1) {
        const newPlacement = new SessionPlacement(toAdd[index]);
        this.replace(sessionId, newPlacement);
      } else {
        this.remove(sessionId);
      }
    }

    const remainingToAdd = toAdd.filter(s => !this._order.includes(s.id));
    for (const session of remainingToAdd) {
      const placement = new SessionPlacement(session);
      this.set(session.id, placement);
    }

    this._score = score;

    this.updateClashDepths();

    this.stopChange();
  }

  private next(shouldCallback = false): void {
    if (this._changing === 0) {
      this._version += 1;
      if (shouldCallback && this.callback) {
        this.callback(this.data);
      }
    }
  }

  private startChange(): void {
    this._changing += 1;
  }

  private stopChange(shouldCallback?: boolean): void {
    this._changing -= 1;
    this.next(shouldCallback);
  }
}

export function getSessionManagerScore(sessionManager: SessionManager) {
  const allStreams = sessionManager.renderOrderSessions.map(s => s.stream);
  const streamIds = allStreams.map(s => s.id);
  const uniqueStreams = allStreams.filter((s, i) => streamIds.indexOf(s.id) === i);

  const clashInfo = getClashInfo(uniqueStreams);
  const score = new TimetableScorer(clashInfo, []).score(uniqueStreams);
  return score;
}

export default SessionManager;
