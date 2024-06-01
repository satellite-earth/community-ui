import chroma from 'chroma-js';
import { DeepPartial, Theme, extendTheme } from '@chakra-ui/react';

import { pallet } from './helpers';

export const theme = extendTheme({
	colors: {
		gray: pallet(chroma.scale(['#eeeeee', '#0e0e0e']).colors(10)),
		brand: pallet(chroma.scale(['#dbaa31', '#dbaa31']).colors(10)),
	},
	semanticTokens: {
		colors: {
			'card-hover-overlay': {
				_light: 'blackAlpha.50',
				_dark: 'whiteAlpha.50',
			},
			'chakra-body-text': { _light: 'gray.800', _dark: 'white' },
			'chakra-body-bg': { _light: 'white', _dark: 'gray.900' },
			'chakra-subtle-bg': { _light: 'gray.100', _dark: 'gray.800' },
			'chakra-subtle-text': { _light: 'gray.600', _dark: 'gray.400' },
		},
	},
} as DeepPartial<Theme>);
