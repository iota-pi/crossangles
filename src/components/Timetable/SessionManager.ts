import { SessionId, Session } from "../../state";
import { notUndefined } from "../../typeHelpers";
import { SessionPlacement } from "./SessionPlacement";
import { Position } from "./timetableTypes";

export class SessionManager {
  private map: Map<SessionId, SessionPlacement>;
  private _order: SessionId[];
  private _version: number;

  constructor (base?: SessionManager) {
    if (base) {
      this.map = new Map(base.map);
      this._order = base._order.slice();
      this._version = base._version;
    } else {
      this.map = new Map<SessionId, SessionPlacement>();
      this._order = [];
      this._version = 0;
    }
  }

  get version () {
    return this._version;
  }

  get order () {
    return this._order;
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

  remove (sessionId: SessionId, hard = false): void {
    this.removeSession(sessionId);

    if (hard) {
      this.map.delete(sessionId);
    }
  }

  drag (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.drag();

    const stream = session.session.stream;
    for (let linkedSession of stream.sessions) {
      let otherId = Session.getId(linkedSession);
      if (otherId !== sessionId) {
        this.raise(otherId);
      }
    }

    this.next();
  }

  move (sessionId: SessionId, delta: Position): void {
    const session = this.get(sessionId);
    session.move(delta);
    this.next();
  }

  drop (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.drop();

    const stream = session.session.stream;
    for (let linkedSession of stream.sessions) {
      const linkedId = Session.getId(linkedSession);
      if (linkedId !== sessionId) {
        this.lower(linkedId);
      }
    }

    this.next();
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

  snapStream (sessionId: SessionId): void {
    const stream = this.get(sessionId).session.stream;
    for (let linkedSession of stream.sessions) {
      this.snap(Session.getId(linkedSession));
    }
  }

  snap (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.snap();
    this.next();
  }

  swapStream (prevSession: SessionId, nextSession: SessionId): void {
    const prevStream = this.get(prevSession).session.stream;
    const nextStream = this.get(nextSession).session.stream;
    const prevSessions = prevStream.sessions;
    const nextSessions = nextStream.sessions;

    for (let i = 0; i < prevSessions.length; ++i) {
      const prevId = Session.getId(prevSessions[i]);
      const nextId = Session.getId(nextSessions[i]);
      this.swapSession(prevId, nextId);
    }

    // Ensure session for which this was called ends up on top
    this.bumpSession(nextSession);
  }

  bumpStream (sessionId: SessionId): void {
    this.swapStream(sessionId, sessionId);
  }

  private swapSession (prevSessionId: SessionId, nextSessionId: SessionId): void {
    // Update session ordering
    this.removeSession(prevSessionId);
    this.removeSession(nextSessionId);
    this._order = [...this._order, nextSessionId];

    // Snap this session if we've newly added it to the timetable
    if (prevSessionId !== nextSessionId) {
      this.get(nextSessionId).snap();
    }

    this.next();
  }

  private removeSession (prevSessionId: SessionId): void {
    const index = this._order.indexOf(prevSessionId);
    if (index !== -1) {
      this._order = [...this._order.slice(0, index), ...this._order.slice(index + 1)];
    }
  }

  private bumpSession (sessionId: SessionId): void {
    this.swapSession(sessionId, sessionId);
  }

  setClashDepth (sessionId: SessionId, depth: number): void {
    const placement = this.get(sessionId);
    placement.clashDepth = depth;
    this.next();
  }

  private next (): void {
    this._version++;
  }
}
