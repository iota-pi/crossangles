import { SessionId, Session, SessionFactory, ILinkedSession } from "../../state";
import { notUndefined } from "../../typeHelpers";
import { SessionPlacement, ILinkedSessionPlacement } from "./SessionPlacement";
import { Position } from "./timetableTypes";

export type LinkedSessionManagerEntries = Array<[SessionId, ILinkedSessionPlacement]>;

export interface ILinkedSessionManager {
  map: LinkedSessionManagerEntries,
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

  get data (): ILinkedSessionManager {
    const mapData: LinkedSessionManagerEntries = [];
    this.map.forEach((value, key) => {
      mapData.push([key, value.data]);
    });
    return {
      map: mapData,
      order: this.order.slice(),
      version: this.version,
    };
  }

  static from (data: ILinkedSessionManager, sessionFactory: SessionFactory): SessionManager {
    const sm = new SessionManager();
    sm.map = new Map(data.map.map(([sid, ls]) => {
      return [sid, SessionPlacement.from(ls, sessionFactory)];
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

  touch (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.touch();
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

  setClashDepth (sessionId: SessionId, depth: number): void {
    const placement = this.get(sessionId);
    placement.clashDepth = depth;
    this.next();
  }

  snapSessionTo (
    sessionId: SessionId,
    nextSessions: ILinkedSession[],
    sessionFactory: SessionFactory,
  ): void {
    this.startChange();

    // Mark new stream as touched iff stream has changed
    let shouldTouch = false;
    if (sessionId && !nextSessions.map(s => Session.getId(s)).includes(sessionId)) {
      shouldTouch = true;
    }

    // Get the index of the session which initiated this move (i.e. the dragged/dropped session)
    const initiatingIndex = this.get(sessionId).session.index;

    // Remove old session placements
    this.removeStream(sessionId);

    // Add new session placements
    let replacementSession: Session | undefined;
    for (let linkedSession of nextSessions) {
      const id = Session.getId(linkedSession);
      const newSession = sessionFactory.create(linkedSession);
      const newPlacement = new SessionPlacement(newSession);
      this.set(id, newPlacement);

      if (newSession.index === initiatingIndex) {
        replacementSession = newSession;
      }

      if (shouldTouch) {
        this.touch(id);
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
    newSessions: ILinkedSession[],
    sessionFactory: SessionFactory,
  ) {
    for (let linkedSession of newSessions) {
      const id = Session.getId(linkedSession);
      if (!this.has(id)) {
        const session = sessionFactory.create(linkedSession);
        const placement = new SessionPlacement(session);
        this.set(id, placement);
      }
    }
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

export default SessionManager;

export const hydrateLinkedSessionManager = (
  linkedSessionManager: ILinkedSessionManager,
  sessionFactory: SessionFactory,
) => {
  return SessionManager.from(linkedSessionManager, sessionFactory);
}
