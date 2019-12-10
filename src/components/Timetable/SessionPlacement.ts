import { Position } from "./timetableTypes";
import { TimetablePlacement, ITimetablePlacement } from "./Placement";
import * as tt from "./timetableUtil";
import SessionPosition from "./SessionPosition";
import { DimensionManager } from "./DimensionManager";
import { Session } from "../../state/Session";

export class SessionPlacement extends TimetablePlacement {
  private _offset: Position;
  private _isSnapped: boolean = true;
  private _isDragging: boolean = false;
  private _isRaised: boolean = false;
  clashDepth: number = 0;

  constructor (data: ITimetablePlacement) {
    super(data);
    this._offset = { x: 0, y: 0 };
  }

  get isSnapped (): boolean {
    return this._isSnapped && !this._isRaised;
  }

  get isDragging (): boolean {
    return this._isDragging;
  }

  get isRaised (): boolean {
    return this._isRaised;
  }

  private get boundedOffset (): Position {
    const placement = this.basePlacement;
    const maxX = this.dimensions.width  - placement.x - placement.width;
    const maxY = this.dimensions.height - placement.y - placement.height;

    const x = Math.min(Math.max(this._offset.x, -placement.x), maxX);
    const y = Math.min(Math.max(this._offset.y, -placement.y), maxY);

    return { x, y };
  }

  drag (): void {
    // Add clashOffset to current offset
    this._offset.x += this.clashDepth * tt.CLASH_OFFSET_X;
    this._offset.y += this.clashDepth * tt.CLASH_OFFSET_Y;

    this._isSnapped = false;
    this._isDragging = true;
  }

  move (delta: Position): void {
    this._offset.x += delta.x;
    this._offset.y += delta.y;
  }

  drop (): void {
    this._isDragging = false;
  }

  snap (): void {
    this._offset = { x: 0, y: 0 };
    this._isSnapped = true;
    this._isRaised = false;
  }

  raise (): void {
    this._isRaised = true;
  }

  lower (): void {
    this._isRaised = false;
  }

  // Slightly displace this session
  // (e.g. if it was in a full stream and can't be anymore)
  displace (): void {
    let dx = Math.floor(Math.random() * tt.DISPLACE_VARIATION_X * 2) - tt.DISPLACE_VARIATION_X;
    let dy = Math.floor(Math.random() * tt.DISPLACE_VARIATION_Y * 2) - tt.DISPLACE_VARIATION_Y;
    dx = (dx < 0) ? dx - tt.DISPLACE_RADIUS_X : dx + tt.DISPLACE_RADIUS_X + 1;
    dy = (dy < 0) ? dy - tt.DISPLACE_RADIUS_Y : dy + tt.DISPLACE_RADIUS_Y + 1;

    this.displaceBy(dx, dy);
  }

  private displaceBy (dx: number, dy: number): void {
    if (this._isSnapped) {
      this._isSnapped = false;
      this._offset.x += dx;
      this._offset.y += dy;
    }
  }

  shouldDisplace (includeFullClasses: boolean): boolean {
    const stream = this.session.stream;
    return stream.full && !includeFullClasses && this.isSnapped;
  }

  get position (): Required<Position> {
    const base = SessionPosition.getBasePosition(
      this.basePlacement,
      this.boundedOffset,
    );
    const clash = SessionPosition.getClashOffset(this.clashDepth);
    const raised = SessionPosition.getRaisedOffset(this.isRaised);
    const x = base.x + clash.x + raised.x;
    const y = base.y + clash.y + raised.y;
    const z = SessionPosition.getZ(this.isSnapped, this.clashDepth);

    return { x, y, z };
  }
}

export default SessionPlacement;


export class SessionPlacementFactory {
  private dimensions: DimensionManager;

  constructor (dimensions: DimensionManager) {
    this.dimensions = dimensions;
  }

  updateDimensions (dimensions: DimensionManager) {
    this.dimensions = dimensions;
    return new SessionPlacementFactory(dimensions);
  }

  create (session: Session) {
    return new SessionPlacement({
      session,
      dimensions: this.dimensions
    });
  }
}
