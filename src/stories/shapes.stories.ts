import type { Meta } from '@storybook/html'

import { createStory, Story } from '@/graph/stories/create-story'
import { CosmosStoryProps } from './create-cosmos'
import { allShapes } from './shapes/all-shapes'

import allShapesStoryRaw from './shapes/all-shapes/index?raw'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<CosmosStoryProps> = {
  title: 'Examples/Shapes',
}

export const AllShapes: Story = {
  ...createStory(allShapes),
  name: 'All Point Shapes',
  parameters: {
    sourceCode: [
      { name: 'Story', code: allShapesStoryRaw },
    ],
  },
}

// eslint-disable-next-line import/no-default-export
export default meta
