/**
 * Shared by every form control so a new size can only be added in one place.
 *
 * `action` is the default: this is a web app, and most controls are form
 * targets. `control` is the dense Win7-dialog scale, opted into by toolbars and
 * other chrome where the smaller metric is deliberate.
 */
export type ControlSize = 'action' | 'control';
