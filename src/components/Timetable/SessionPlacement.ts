import { Position } from "./timetableTypes";
import { TimetablePlacement, ITimetablePlacement } from "./Placement";
import { CLASH_OFFSET_X, CLASH_OFFSET_Y, SESSION_DRAG_Z, SESSION_BASE_Z, SESSION_LIFT_Z, DISPLACE_RADIUS_X, DISPLACE_RADIUS_Y, DISPLACE_VARIATION_X, DISPLACE_VARIATION_Y } from "./timetableUtil";

export class SessionPlacement extends TimetablePlacement {
  private _offset: Position;
  private _isSnapped: boolean = true;
  private _isDragging: boolean = false;
  clashDepth: number = 0;

  constructor (data: ITimetablePlacement) {
    super(data);
    this._offset = { x: 0, y: 0 };
  }

  get isSnapped (): boolean {
    return this._isSnapped;
  }

  get isDragging (): boolean {
    return this._isDragging;
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
    this._offset.x += this.clashDepth * CLASH_OFFSET_X;
    this._offset.y += this.clashDepth * CLASH_OFFSET_Y;

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
  }

  // Slightly displace this session
  // (e.g. if it was in a full stream and can't be anymore)
  displace (): void {
    let dx = Math.floor(Math.random() * DISPLACE_VARIATION_X * 2) - DISPLACE_VARIATION_X;
    let dy = Math.floor(Math.random() * DISPLACE_VARIATION_Y * 2) - DISPLACE_VARIATION_Y;
    dx = (dx < 0) ? dx - DISPLACE_RADIUS_X : dx + DISPLACE_RADIUS_X + 1;
    dy = (dy < 0) ? dy - DISPLACE_RADIUS_Y : dy + DISPLACE_RADIUS_Y + 1;

    this._isSnapped = false;
    this._offset.x += dx;
    this._offset.y += dy;
  }

  shouldDisplace (includeFullClasses: boolean): boolean {
    const stream = this.session.stream;
    return stream.full && !includeFullClasses && this.isSnapped;
  }

  get position (): Required<Position> {
    const placement = this.basePlacement;
    const baseX = placement.x + this.boundedOffset.x;
    const baseY = placement.y + this.boundedOffset.y;

    const clashOffsetX = this.clashDepth * CLASH_OFFSET_X;
    const clashOffsetY = this.clashDepth * CLASH_OFFSET_Y;

    const x = baseX + clashOffsetX;
    const y = baseY + clashOffsetY;

    const baseZ = SESSION_BASE_Z;
    const unsnapZ = (!this._isSnapped) ? SESSION_DRAG_Z : 0;
    const clashZ = SESSION_LIFT_Z * this.clashDepth;
    const z = baseZ + unsnapZ + clashZ;

    return { x, y, z };
  }

  clone (): SessionPlacement {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
