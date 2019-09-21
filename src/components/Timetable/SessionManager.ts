import { SessionId } from "../../state";
import { notUndefined } from "../../typeHelpers";
import { SessionPlacement } from "./SessionPlacement";
import { Position } from "./timetableTypes";

export class SessionManager {
  private map: Map<SessionId, SessionPlacement>;
  private _version: number;

  constructor (base?: SessionManager) {
    if (base) {
      this.map = new Map(base.map);
      this._version = base._version;
    } else {
      this.map = new Map<SessionId, SessionPlacement>();
      this._version = 0;
    }
  }

  get version () {
    return this._version;
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
  }

  drag (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.drag();
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
    this.next();
  }

  snap (sessionId: SessionId): void {
    const session = this.get(sessionId);
    session.snap();
    this.next();
  }

  private next (): void {
    this._version++;
  }
}
