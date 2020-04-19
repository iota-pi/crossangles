import { notUndefined } from '../../typeHelpers';
import { SessionPlacement, SessionPlacementData } from './SessionPlacement';
import { Position, Dimensions } from './timetableTypes';
import { SessionId, LinkedSession } from '../../state/Session';
import { CourseMap, CourseData, getCourseId } from '../../state/Course';
import { sessionClashLength } from '../../timetable/getClashInfo';
import { DropzonePlacement } from './DropzonePlacement';
import { AdditionalEvent, getEventId } from '../../state/Events';
import { getSessionManagerScore } from '../../timetable/scoreSessionManager';

export type SessionManagerEntriesData = Array<[SessionId, SessionPlacementData]>;

export interface SessionManagerData {
  map: SessionManagerEntriesData,
  order: SessionId[],
  version: number,
  score: number,
}


export class SessionManager {
  private map: Map<SessionId, SessionPlacement>;
  private _order: SessionId[];
  private _version: number;
  private _score: number;
  private _changing: number;
  callback: ((timetable: SessionManagerData) => void) | undefined;

  constructor (base?: SessionManager) {
    if (base) {
      this.map = new Map(base.map);
      this._order = base._order.slice();
      this._version = base._version;
      this._score = base._score;
      this._changing = 0;
    } else {
      this.map = new Map<SessionId, SessionPlacement>();
      this._order = [];
      this._version = 0;
      this._score = 0;
      this._changing = 0;
    }
  }

  get data (): SessionManagerData {
    const mapData: SessionManagerEntriesData = [];
    this.map.forEach((placement, sessionId) => {
      mapData.push([sessionId, placement.data]);
    });
    return {
      map: mapData,
      order: this.order.slice(),
      version: this.version,
      score: this._score,
    };
  }

  static from (data: SessionManagerData, courses: CourseMap): SessionManager {
    const sm = new SessionManager();
    const mapData: [SessionId, SessionPlacement][] = [];
    for (const [_, [sid, s]] of data.map.entries()) {
      const course = courses[s.session.course];
      const placement = SessionPlacement.from(s, course);
      if (placement !== null) {
        mapData.push([sid, placement]);
      }
    }
    sm.map = new Map(mapData);
    sm._order = data.order;
    sm._version = data.version;
    sm._score = data.score;
    return sm;
  }

  get version () {
    return this._version;
  }

  get score () {
    return this._score;
  }

  get order () {
    return this._order;
  }

  get orderSessions (): LinkedSession[] {
    return this._order.map(sid => this.getSession(sid));
  }

  getTouchedSessions (allCourses: CourseData[], events: AdditionalEvent[]) {
    const allCourseIds = allCourses.map(c => getCourseId(c));
    const touchedSessions = this.orderSessions.filter(s => this.get(s.id).touched);
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

  getOrder (sessionId: SessionId) {
    return this._order.indexOf(sessionId);
  }

  get (sessionId: SessionId): SessionPlacement {
    return notUndefined(this.getMaybe(sessionId));
  }

  getMaybe (sessionId: SessionId): SessionPlacement | undefined {
    return this.map.get(sessionId);
  }

  getSession (sessionId: SessionId): LinkedSession {
    return this.get(sessionId).session;
  }

  has (sessionId: SessionId): boolean {
    return this.map.has(sessionId);
  }

  set (sessionId: SessionId, session: SessionPlacement): void {
    this.map.set(sessionId, session);

    if (!this._order.includes(sessionId)) {
      this._order = [...this._order, sessionId];
    }

    this.next();
  }

  remove (sessionId: SessionId, hardDelete = true): void {
    const index = this._order.indexOf(sessionId);
    if (index !== -1) {
      this._order = [
        ...this._order.slice(0, index),
        ...this._order.slice(index + 1),
      ];
    }

    if (hardDelete) {
      this.map.delete(sessionId);
    }

    this.next();
  }

  removeStream (sessionId: SessionId, hardDelete = true): void {
    const sessions = this.getSession(sessionId).stream.sessions;
    for (let session of sessions) {
      this.remove(session.id, hardDelete);
    }
  }

  drag (sessionId: SessionId, shouldCallback=false): void {
    this.startChange();

    const session = this.get(sessionId);
    session.drag();

    const stream = session.session.stream;
    for (let session of stream.sessions) {
      let otherId = session.id;
      if (otherId !== sessionId) {
        this.raise(otherId);
      }
    }

    this.stopChange(shouldCallback);
  }

  move (sessionId: SessionId, delta: Position, shouldCallback=false): void {
    const session = this.get(sessionId);
    session.move(delta);
    this.next(shouldCallback);
  }

  drop (
    sessionId: SessionId,
    dropzone: DropzonePlacement | null,
    timetableDimensions: Dimensions,
    firsttHour: number,
    shouldCallback=true,
  ): void {
    this.startChange();

    // Drop this placement
    const session = this.get(sessionId);
    session.drop(timetableDimensions, firsttHour);

    // Lower all linked placements
    const stream = session.session.stream;
    for (let linkedSession of stream.sessions) {
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

  private raise (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.raise();
    this.next();
  }

  private lower (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.lower();
    this.next();
  }

  snapStream (sessionId: SessionId): void {
    this.startChange();
    const stream = this.get(sessionId).session.stream;
    for (let linkedSession of stream.sessions) {
      this.snap(linkedSession.id);
    }
    this.stopChange();
  }

  snap (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.snap();
    this.next();
  }

  displace (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.displace();
    this.next();
  }

  bumpSession (sessionId: SessionId): void {
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

  bumpStream (sessionId: SessionId): void {
    this.startChange();
    const stream = this.get(sessionId).session.stream;
    for (const linkedSession of stream.sessions) {
      this.bumpSession(linkedSession.id);
    }
    this.stopChange();
  }

  setClashDepth (sessionId: SessionId, depth: number): void {
    const placement = this.get(sessionId);
    placement.clashDepth = depth;
    this.next();
  }

  private updateScore () {
    this._score = getSessionManagerScore(this);
  }

  private snapSessionTo (
    sessionId: SessionId,
    nextSessions: LinkedSession[],
  ): void {
    this.startChange();

    // Get the session which initiated this move (i.e. the dragged/dropped session)
    const initiator = this.get(sessionId).session;
    const initiatorIndex = initiator.index;

    // Mark new stream as touched iff stream has changed
    let shouldTouch = false;
    const nextStreamId = nextSessions[0].stream.id;
    const prevStreamId = initiator.stream.id;
    if (nextStreamId !== prevStreamId) {
      shouldTouch = true;
    }

    // Remove old session placements
    this.removeStream(sessionId);

    // Add new session placements
    let replacementSession: LinkedSession | undefined;
    for (let session of nextSessions) {
      const newPlacement = new SessionPlacement(session);
      this.set(session.id, newPlacement);

      if (session.index === initiatorIndex) {
        replacementSession = session;
      }

      if (shouldTouch) {
        newPlacement.touch();
      }
    }

    // Bump session which corresponds to the initiating session
    // NB: aside from neatness, this also is required for React to apply transistions correctly,
    //     even though it doesn't affect the key of the ReactDOM elements
    // TODO: investigate why this is required for transitions ()
    if (replacementSession) {
      this.bumpSession(replacementSession.id);
    }

    this.stopChange();
  }

  updateClashDepths () {
    this.startChange();

    for (let i = 0; i < this.order.length; ++i) {
      let takenDepths = new Set<number>();
      const sessionId1 = this.order[i];
      const placement1 = this.get(sessionId1);

      // Only measure for sessions which are snapped
      if (placement1.isSnapped) {
        for (let j = 0; j < i; ++j) {
          const sessionId2 = this.order[j];
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

  private findFreeDepth (takenDepths: Set<number>): number {
    for (let j = 0; j < takenDepths.size; ++j) {
      if (!takenDepths.has(j)) {
        return j;
      }
    }

    return takenDepths.size;
  }

  clear () {
    this.map.clear();
    this._order = [];
    this.next();
  }

  update (
    newSessions: LinkedSession[],
    fixedSessions: LinkedSession[],
    score: number,
  ) {
    this.startChange();

    // TODO: calculate fixed sessions from newSessions via s.get(id).touched
    // Get placements of fixed sessions
    const fixedSessionIds = fixedSessions.map(s => s.id);
    const fixedPlacements = fixedSessionIds.map(id => this.get(id));

    // Clear all placements (NB: must be done after fetching fixed session placements)
    this.clear();

    for (let session of newSessions) {
      const index = fixedSessionIds.indexOf(session.id);
      let placement: SessionPlacement;
      if (index > -1) {
        placement = fixedPlacements[index];
      } else {
        placement = new SessionPlacement(session);
      }
      this.set(session.id, placement);
    }

    this._score = score;

    this.updateClashDepths();

    this.stopChange();
  }

  private next (shouldCallback=false): void {
    if (this._changing === 0) {
      this._version++;
      if (shouldCallback && this.callback) {
        this.callback(this.data);
      }
    }
  }

  private startChange (): void {
    this._changing++;
  }

  private stopChange (shouldCallback?: boolean): void {
    this._changing--;
    this.next(shouldCallback);
  }
}

export default SessionManager;
