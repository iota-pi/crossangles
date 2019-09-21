import { Position } from "./timetableTypes";
import { TimetablePlacement, ITimetablePlacement } from "./Placement";
import { CLASH_OFFSET_X, CLASH_OFFSET_Y, SESSION_DRAG_Z, SESSION_BASE_Z, SESSION_LIFT_Z } from "./timetableConstants";

export class SessionPlacement extends TimetablePlacement {
  private _offset: Position;
  private _isSnapped: boolean = true;
  private _isDragging: boolean = false;
  private _clashDepth: number = 0;

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

  get clashDepth (): number {
    return this._clashDepth;
  }

  drag (): void {
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
  // (e.g. if it was in a full place and is no longer)
  displace (): void {
    const variationX = 15;
    const variationY = 10;
    const radiusX = 15;
    const radiusY = 10;
    let dx = Math.floor(Math.random() * variationX * 2) - variationX;
    let dy = Math.floor(Math.random() * variationY * 2) - variationY;
    dx = (dx < 0) ? dx - radiusX : dx + radiusX + 1;
    dy = (dy < 0) ? dy - radiusY : dy + radiusY + 1;

    this._isSnapped = false;
    this._offset = {
      x: this._offset.x + dx,
      y: this._offset.y + dy,
    }
  }

  shouldDisplace (allowFullClasses: boolean) {
    const stream = this.session.stream
    return stream.full && !allowFullClasses && this.isSnapped
  }

  get position (): Required<Position> {
    const placement = this.basePlacement;
    const baseX = placement.x + this._offset.x;
    const baseY = placement.y + this._offset.y;

    const maxX = this.dimensions.width  - placement.width;
    const maxY = this.dimensions.height - placement.height;

    const clashOffsetX = this._clashDepth * CLASH_OFFSET_X;
    const clashOffsetY = this._clashDepth * CLASH_OFFSET_Y;

    const unboundedX = baseX + clashOffsetX;
    const unboundedY = baseY + clashOffsetY;

    const baseZ = SESSION_BASE_Z;
    const unsnapZ = (!this._isSnapped) ? SESSION_DRAG_Z : 0;
    const clashZ = SESSION_LIFT_Z * this._clashDepth;

    const x = Math.min(Math.max(unboundedX, 0), maxX);
    const y = Math.min(Math.max(unboundedY, 0), maxY);
    const z = baseZ + unsnapZ + clashZ;

    return { x, y, z };
  }

  clone () {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
