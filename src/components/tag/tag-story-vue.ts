/**
 * @license
 *
 * Copyright IBM Corp. 2019
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import createVueBindingsFromProps from '../../../.storybook/vue/create-vue-bindings-from-props';
import { defaultStory as baseDefaultStory, filter as baseFilter } from './tag-story';

export { default } from './tag-story';

export const defaultStory = ({ parameters }) => ({
  template: `
    <bx-tag :type="type" :title="title" :disabled="disabled">
      This is not a tag
    </bx-tag>
  `,
  ...createVueBindingsFromProps(parameters?.props?.['bx-tag']),
});

defaultStory.story = baseDefaultStory.story;

export const filter = ({ parameters }) => ({
  template: `
    <bx-filter-tag
      :type="type"
      :title="title"
      :disabled="disabled"
      @click="onClick"
    >
      This is not a tag
    </bx-filter-tag>
  `,
  ...createVueBindingsFromProps(parameters?.props?.['bx-filter-tag']),
});

filter.story = baseFilter.story;
