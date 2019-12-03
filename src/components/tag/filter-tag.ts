/**
 * @license
 *
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { html, property, customElement, LitElement } from 'lit-element';
import classnames from 'classnames';
import settings from 'carbon-components/es/globals/js/settings';
import Close16 from '@carbon/icons/lib/close/16';
import FocusMixin from '../../globals/mixins/focus';
import TAG_TYPE from './types';
import styles from './tag.scss';

export { TAG_TYPE };

const { prefix } = settings;

/**
 * Filter tag.
 */
@customElement(`${prefix}-filter-tag`)
export default class BXFilterTag extends FocusMixin(LitElement) {
  /**
   * Text to show on filter tag "clear" buttons. Corresponds to the attribute with the same name
   */
  @property({ type: String, reflect: true })
  title = 'Clear filter';

  /**
   * `true` if the tag should be disabled
   */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /**
   * Specify the type of the <Tag>
   */
  @property({ reflect: true })
  type = TAG_TYPE.RED;

  render() {
    const { disabled, title, type } = this;
    const classes = classnames(`${prefix}--tag`, `${prefix}--tag--${type}`, `${prefix}--tag--filter`, {
      [`${prefix}--tag--disabled`]: disabled,
    });
    return html`
      <span class="${classes}" title="${title}" tabindex="0">
        <slot></slot>
        ${Close16({ 'aria-label': title })}
      </span>
    `;
  }

  static styles = styles; // `styles` here is a `CSSResult` generated by custom WebPack loader
}