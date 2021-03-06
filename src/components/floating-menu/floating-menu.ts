/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2020
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ResizeObserver from 'resize-observer-polyfill';
import { LitElement } from 'lit-element';
import HostListener from '../../globals/decorators/host-listener';
import FocusMixin from '../../globals/mixins/focus';
import HostListenerMixin from '../../globals/mixins/host-listener';
import Handle from '../../globals/internal/handle';
import BXFloatingMenuTrigger from './floating-menu-trigger';

/**
 * The LTR/RTL direction used for positioning floating menu.
 */
export enum FLOATING_MENU_POSITION_DIRECTION {
  /**
   * LTR.
   */
  LTR = 'ltr',

  /**
   * RTL.
   */
  RTL = 'rtl',
}

/**
 * Position of floating menu, or trigger button of floating menu.
 */
export interface FloatingMenuPosition {
  /**
   * The LTR/RTL direction used for positioning floating menu.
   */
  direction: FLOATING_MENU_POSITION_DIRECTION;

  /**
   * The start position (Left position for LTR, right position for RTL).
   */
  start: number;

  /**
   * The top position.
   */
  top: number;
}

/**
 * The alignment choices of floating menu.
 */
export enum FLOATING_MENU_ALIGNMENT {
  /**
   * Align the top/left position menu body to the one of its trigger button.
   */
  START = 'start',

  /**
   * Align the center position menu body to the one of its trigger button.
   */
  CENTER = 'center',

  /**
   * Align the bottom/right position menu body to the one of its trigger button.
   */
  END = 'end',
}

/**
 * The direction/positioning/orientation choices of floating menu.
 */
export enum FLOATING_MENU_DIRECTION {
  /**
   * Put menu body at the left of its trigger button.
   */
  LEFT = 'left',

  /**
   * Put menu body at the top of its trigger button.
   */
  TOP = 'top',

  /**
   * Put menu body at the right of its trigger button.
   */
  RIGHT = 'right',

  /**
   * Put menu body at the bottom of its trigger button.
   */
  BOTTOM = 'bottom',
}

/**
 * The group of the direction/positioning/orientation choices of floating menu.
 */
export enum FLOATING_MENU_DIRECTION_GROUP {
  /**
   * Put menu body at the left/right of its trigger button.
   */
  HORIZONTAL = 'horizontal',

  /**
   * Put menu body at the top/bottom of its trigger button.
   */
  VERTICAL = 'vertical',
}

/**
 * Observes resize of the given element with the given resize observer.
 * @param observer The resize observer.
 * @param elem The element to observe the resize.
 */
const observeResize = (observer: ResizeObserver, elem: Element) => {
  observer.observe(elem);
  return {
    release() {
      observer.unobserve(elem);
      return null;
    },
  } as Handle;
};

/**
 * Floating menu.
 */
abstract class BXFloatingMenu extends HostListenerMixin(FocusMixin(LitElement)) {
  /**
   * The handle for observing resize of the element containing the trigger button.
   */
  private _hObserveResizeParent: Handle | null = null;

  /**
   * The handle for observing resize of the floating menu container.
   */
  private _hObserveResizeContainer: Handle | null = null;

  /**
   * The `ResizeObserver` instance for observing element resizes for re-positioning floating menu position.
   */
  private _resizeObserver = new ResizeObserver(() => {
    const { container, open, parent, position } = this;
    if (container && open && parent) {
      const { direction, start, top } = position;
      this.style[direction !== FLOATING_MENU_POSITION_DIRECTION.RTL ? 'left' : 'right'] = `${start}px`;
      this.style.top = `${top}px`;
    }
  });

  @HostListener('blur')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleBlur = ({ relatedTarget }: FocusEvent) => {
    if (!this.contains(relatedTarget as Node)) {
      const { parent } = this;
      if (parent) {
        parent.open = false;
        HTMLElement.prototype.focus.call(this.parent); // SVGElement in IE11 does not have `.focus()` method
      }
    }
  };

  /**
   * The DOM element, typically a custom element in this library, launching this floating menu.
   */
  protected parent: BXFloatingMenuTrigger | null = null;

  /**
   * How the menu is aligned to the trigger button.
   */
  abstract alignment: FLOATING_MENU_ALIGNMENT;

  /**
   * The menu direction.
   */
  abstract direction: FLOATING_MENU_DIRECTION;

  /**
   * `true` if the menu should be open.
   */
  abstract open: boolean;

  /**
   * The horizontal/vertical direction with regard to how the menu is aligned to the trigger button.
   */
  get alignmentDirection() {
    return {
      [FLOATING_MENU_DIRECTION.LEFT]: FLOATING_MENU_DIRECTION_GROUP.VERTICAL,
      [FLOATING_MENU_DIRECTION.TOP]: FLOATING_MENU_DIRECTION_GROUP.HORIZONTAL,
      [FLOATING_MENU_DIRECTION.RIGHT]: FLOATING_MENU_DIRECTION_GROUP.VERTICAL,
      [FLOATING_MENU_DIRECTION.BOTTOM]: FLOATING_MENU_DIRECTION_GROUP.HORIZONTAL,
    }[this.direction];
  }

  /**
   * The DOM element to put this menu into.
   */
  get container() {
    return this.closest((this.constructor as typeof BXFloatingMenu).selectorContainer) || this.ownerDocument!.body;
  }

  /**
   * The position of this floating menu.
   */
  get position(): FloatingMenuPosition {
    const { triggerPosition } = this.parent!;
    if (!triggerPosition) {
      throw new TypeError('Missing information of trigger button position.');
    }

    const { container } = this;
    const { left: refLeft = 0, top: refTop = 0, right: refRight = 0, bottom: refBottom = 0 } = triggerPosition;
    const { width, height } = this.getBoundingClientRect();
    const { left: containerLeft = 0, right: containerRight = 0, top: containerTop = 0 } = container.getBoundingClientRect();
    const refCenterHorizontal = (refLeft + refRight) / 2;
    const refCenterVertical = (refTop + refBottom) / 2;

    const containerComputedStyle = container.ownerDocument!.defaultView!.getComputedStyle(container);
    const positionDirection = containerComputedStyle.getPropertyValue('direction') as FLOATING_MENU_POSITION_DIRECTION;
    const isRtl = positionDirection === FLOATING_MENU_POSITION_DIRECTION.RTL;
    const containerStartFromViewport = !isRtl ? containerLeft : container.ownerDocument!.defaultView!.innerWidth - containerRight;
    const refStartFromContainer = !isRtl ? refLeft - containerLeft : containerRight - refRight;
    const refEndFromContainer = !isRtl ? refRight - containerLeft : containerRight - refLeft;
    const refCenterHorizontalFromContainer = !isRtl ? refCenterHorizontal - containerLeft : containerRight - refCenterHorizontal;
    const refTopFromContainer = refTop - containerTop;
    const refCenterVerticalFromContainer = refCenterVertical - containerTop;

    if (
      (container !== this.ownerDocument!.body || containerStartFromViewport !== 0 || containerTop !== 0) &&
      containerComputedStyle.getPropertyValue('position') === 'static'
    ) {
      throw new Error('Floating menu container must not have `position:static`.');
    }

    const { alignment, alignmentDirection, direction } = this;
    if (Object.values(FLOATING_MENU_ALIGNMENT).indexOf(alignment) < 0) {
      throw new Error(`Wrong menu alignment: ${alignment}`);
    }
    if (Object.values(FLOATING_MENU_DIRECTION).indexOf(direction) < 0) {
      throw new Error(`Wrong menu position direction: ${direction}`);
    }

    const alignmentStart = {
      [FLOATING_MENU_DIRECTION_GROUP.HORIZONTAL]: {
        [FLOATING_MENU_ALIGNMENT.START]: () => refStartFromContainer,
        [FLOATING_MENU_ALIGNMENT.CENTER]: () => refCenterHorizontalFromContainer - width / 2,
        [FLOATING_MENU_ALIGNMENT.END]: () => refEndFromContainer - width,
      },
      [FLOATING_MENU_DIRECTION_GROUP.VERTICAL]: {
        [FLOATING_MENU_ALIGNMENT.START]: () => refTopFromContainer,
        [FLOATING_MENU_ALIGNMENT.CENTER]: () => refCenterVerticalFromContainer - height / 2,
        [FLOATING_MENU_ALIGNMENT.END]: () => refBottom - height,
      },
    }[alignmentDirection][alignment]();

    const { start, top } = {
      [FLOATING_MENU_DIRECTION.LEFT]: () => ({
        start: refStartFromContainer - width,
        top: alignmentStart,
      }),
      [FLOATING_MENU_DIRECTION.TOP]: () => ({
        start: alignmentStart,
        top: refTopFromContainer - height,
      }),
      [FLOATING_MENU_DIRECTION.RIGHT]: () => ({
        start: refEndFromContainer,
        top: alignmentStart,
      }),
      [FLOATING_MENU_DIRECTION.BOTTOM]: () => ({
        start: alignmentStart,
        top: refBottom,
      }),
    }[direction]();

    return {
      direction: positionDirection,
      start,
      top,
    };
  }

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  disconnectedCallback() {
    if (this._hObserveResizeContainer) {
      this._hObserveResizeContainer = this._hObserveResizeContainer.release();
    }
    if (this._hObserveResizeParent) {
      this._hObserveResizeParent = this._hObserveResizeParent.release();
    }
  }

  updated(changedProperties) {
    const { container, open, parent } = this;
    if ((changedProperties.has('alignment') || changedProperties.has('direction') || changedProperties.has('open')) && open) {
      if (!parent) {
        this.parent = this.parentElement as BXFloatingMenuTrigger;
        container.appendChild(this);
      }
      // Note: `this.position` cannot be referenced until `this.parent` is set
      const { direction, start, top } = this.position;
      this.style[direction !== FLOATING_MENU_POSITION_DIRECTION.RTL ? 'left' : 'right'] = `${start}px`;
      this.style.top = `${top}px`;
    }
    if (changedProperties.has('open')) {
      if (this._hObserveResizeContainer) {
        this._hObserveResizeContainer = this._hObserveResizeContainer.release();
      }
      if (this._hObserveResizeParent) {
        this._hObserveResizeParent = this._hObserveResizeParent.release();
      }
      if (open) {
        const { parentElement } = this.parent ?? {};
        this._hObserveResizeContainer = observeResize(this._resizeObserver, container);
        if (parentElement) {
          this._hObserveResizeParent = observeResize(this._resizeObserver, parentElement);
        }
      }
    }
  }

  /**
   * A constant indicating that this class is a floating menu.
   */
  static FLOATING_MENU = true;

  /**
   * The CSS selector to find the element to put this floating menu in.
   */
  static selectorContainer = '[data-floating-menu-container]';
}

export default BXFloatingMenu;
