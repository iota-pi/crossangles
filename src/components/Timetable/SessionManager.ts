import { SessionId, Session, SessionFactory, ILinkedSession } from "../../state";
import { notUndefined } from "../../typeHelpers";
import { SessionPlacement, SessionPlacementFactory } from "./SessionPlacement";
import { Position } from "./timetableTypes";

export interface ISessionManager {
  map: Array<[SessionId, SessionPlacement]>,
  order: SessionId[],
  version: number,
}

export class SessionManager {
  private map: Map<SessionId, SessionPlacement>;
  private _order: SessionId[];
  private _version: number;
  private _changing: number;

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

  get data (): ISessionManager {
    return {
      map: Array.from(this.map.entries()),
      order: this.order.slice(),
      version: this.version,
    };
  }

  static from (data: ISessionManager): SessionManager {
    const sm = new SessionManager();
    sm.map = new Map(data.map);
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

  getSession (sessionId: SessionId): Session {
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
  }

  removeStream (sessionId: SessionId, hardDelete = true): void {
    const linkedSessions = this.get(sessionId).session.stream.sessions;
    for (let linkedSession of linkedSessions) {
      this.remove(Session.getId(linkedSession), hardDelete);
    }
  }

  drag (sessionId: SessionId): void {
    this.startChange();

    const session = this.get(sessionId);
    session.drag();

    const stream = session.session.stream;
    for (let linkedSession of stream.sessions) {
      let otherId = Session.getId(linkedSession);
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
      const linkedId = Session.getId(linkedSession);
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

  snapStream (sessionId: SessionId): void {
    this.startChange();
    const stream = this.get(sessionId).session.stream;
    for (let linkedSession of stream.sessions) {
      this.snap(Session.getId(linkedSession));
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
      this.bumpSession(Session.getId(linkedSession))
    }
    this.stopChange();
  }

  snapSessionTo (
    sessionId: SessionId,
    nextSessions: ILinkedSession[],
    sessionFactory: SessionFactory,
    sessionPlacementFactory: SessionPlacementFactory,
  ): void {
    this.startChange();

    // Remove old session placements
    this.removeStream(sessionId);

    // Add new session placements
    for (let linkedSession of nextSessions) {
      const id = Session.getId(linkedSession);
      const newSession = sessionFactory.create(linkedSession);
      const newPlacement = sessionPlacementFactory.create(newSession);
      this.set(id, newPlacement);
    }

    // TODO: bump nextSession?

    this.stopChange();
  }

  setClashDepth (sessionId: SessionId, depth: number): void {
    const placement = this.get(sessionId);
    placement.clashDepth = depth;
    this.next();
  }

  private next (): void {
    if (this._changing === 0) {
      this._version++;
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
