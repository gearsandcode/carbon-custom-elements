/**
 * @license
 *
 * Copyright IBM Corp. 2019, 2020
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { classMap } from 'lit-html/directives/class-map';
import { html, property, query, customElement } from 'lit-element';
import settings from 'carbon-components/es/globals/js/settings';
import HostListenerMixin from '../../globals/mixins/host-listener';
import HostListener from '../../globals/decorators/host-listener';
import BXSearch, { SEARCH_SIZE } from '../search/search';
import styles from './data-table.scss';

const { prefix } = settings;

/**
 * Table toolbar search.
 * @element bx-table-toolbar-search
 * @fires bx-search-input - The custom event fired after the search content is changed upon a user gesture.
 */
@customElement(`${prefix}-table-toolbar-search`)
class BXTableToolbarSearch extends HostListenerMixin(BXSearch) {
  @query('input')
  private _inputNode!: HTMLInputElement;

  /**
   * Handles user-initiated gestures for expanding the search box.
   */
  private async _handleUserInitiatedExpand() {
    this.expanded = true;
    await this.updateComplete;
    const { _inputNode: inputNode } = this;
    inputNode?.focus();
  }

  /**
   * Handles `focus` event handler on this element.
   */
  @HostListener('focus')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleFocusIn() {
    this._handleUserInitiatedExpand();
  }

  /**
   * Handles `blur` event handler on this element.
   * @param event The event.
   */
  @HostListener('blur')
  // @ts-ignore: The decorator refers to this method but TS thinks this method is not referred to
  private _handleFocusOut(event: FocusEvent) {
    if (!this.contains(event.relatedTarget as Node) && !this.value) {
      this.expanded = false;
    }
  }

  /**
   * Handles `click` event handler on the search box.
   */
  private _handleSearchClick() {
    this._handleUserInitiatedExpand();
  }

  /**
   * `true` if the search box should be expanded.
   */
  @property({ type: Boolean, reflect: true })
  expanded = false;

  /**
   * The search box size.
   */
  @property({ reflect: true })
  size = SEARCH_SIZE.SMALL;

  createRenderRoot() {
    return this.attachShadow({ mode: 'open', delegatesFocus: true });
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'search');
    }
    super.connectedCallback();
  }

  render() {
    const result = super.render();
    const { expanded, light, size, _handleSearchClick: handleSearchClick } = this;
    const classes = classMap({
      [`${prefix}--search`]: true,
      [`${prefix}--search--${size}`]: size,
      [`${prefix}--search--light`]: light,
    });
    return html`
      <div class="${classes}" tabindex="${expanded ? '-1' : '0'}" @click="${handleSearchClick}">${result}</div>
    `;
  }

  /**
   * The name of the custom event fired after the search content is changed upon a user gesture.
   */
  static get eventInput() {
    // The code uses on in `<bx-search>`, but definition is done also here for React event generation
    return `${prefix}-search-input`;
  }

  static styles = styles;
}

export default BXTableToolbarSearch;
