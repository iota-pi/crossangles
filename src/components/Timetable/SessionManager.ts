import { notUndefined } from "../../typeHelpers";
import { SessionPlacement, SessionPlacementData } from "./SessionPlacement";
import { Position } from "./timetableTypes";
import { SessionId, LinkedSession } from "../../state/Session";
import { CourseMap } from "../../state/Course";

export type SessionManagerEntriesData = Array<[SessionId, SessionPlacementData]>;

export interface SessionManagerData {
  map: SessionManagerEntriesData,
  order: SessionId[],
  version: number,
}

export class SessionManager {
  private map: Map<SessionId, SessionPlacement>;
  private _order: SessionId[];
  private _version: number;
  private _changing: number;
  callback: ((timetable: SessionManagerData) => void) | undefined;

  constructor (base?: SessionManager) {
    if (base) {
      this.map = new Map(base.map);
      this._order = base._order.slice();
      this._version = base._version;
      this._changing = 0;
    } else {
      this.map = new Map<SessionId, SessionPlacement>();
      this._order = [];
      this._version = 0;
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
    };
  }

  static from (data: SessionManagerData, courses: CourseMap): SessionManager {
    const sm = new SessionManager();
    sm.map = new Map(data.map.map(([sid, s]) => {
      const course = courses[s.session.course];
      return [sid, SessionPlacement.from(s, course)];
    }));
    sm._order = data.order;
    sm._version = data.version;
    return sm;
  }

  get version () {
    return this._version;
  }

  get order () {
    return this._order;
  }

  get orderSessions () {
    return this._order.map(sid => this.getSession(sid));
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
        ...this._order.slice(index + 1)
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

  drag (sessionId: SessionId): void {
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

    // Bump dragged stream, keeping the dragged session on top
    this.bumpStream(sessionId);
    this.bumpSession(sessionId);

    this.stopChange();
  }

  move (sessionId: SessionId, delta: Position): void {
    const session = this.get(sessionId);
    session.move(delta);
    this.next();
  }

  drop (sessionId: SessionId): void {
    this.startChange();
    const session = this.get(sessionId);
    session.drop();

    const stream = session.session.stream;
    for (let linkedSession of stream.sessions) {
      const linkedId = linkedSession.id;
      if (linkedId !== sessionId) {
        this.lower(linkedId);
      }
    }

    this.stopChange();
  }

  raise (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.raise();
    this.next();
  }

  lower (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.lower();
    this.next();
  }

  touch (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.touch();
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

  snapSessionTo (
    sessionId: SessionId,
    nextSessions: LinkedSession[],
  ): void {
    this.startChange();

    // Mark new stream as touched iff stream has changed
    let shouldTouch = false;
    const nextSessionIds = nextSessions.map(s => s.id);
    if (sessionId && !nextSessionIds.includes(sessionId)) {
      shouldTouch = true;
    }

    // Get the index of the session which initiated this move (i.e. the dragged/dropped session)
    const initiatingIndex = this.get(sessionId).session.index;

    // Remove old session placements
    this.removeStream(sessionId);

    // Add new session placements
    let replacementSession: LinkedSession | undefined;
    for (let session of nextSessions) {
      const newPlacement = new SessionPlacement(session);
      this.set(session.id, newPlacement);

      if (session.index === initiatingIndex) {
        replacementSession = session;
      }

      if (shouldTouch) {
        this.touch(session.id);
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

  update (
    newSessions: LinkedSession[],
  ) {
    this.startChange();
    for (let session of newSessions) {
      if (!this.has(session.id)) {
        const placement = new SessionPlacement(session);
        this.set(session.id, placement);
      }
    }
    this.stopChange();
  }

  private next (): void {
    if (this._changing === 0) {
      this._version++;
      if (this.callback) {
        this.callback(this.data);
      }
    }
  }

  private startChange (): void {
    this._changing++;
  }

  private stopChange (): void {
    this._changing--;
    this.next();
  }
}

export default SessionManager;
