import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';
 
const theme = create({
  base: 'dark',
  brandTitle: 'cosmos.gl',
  brandUrl: 'https://cosmosgl.github.io/graph',
  brandImage: 'https://d.cosmograph.app/cosmos-dark-theme.svg',
  brandTarget: '_self',
});

addons.setConfig({
  theme,
});