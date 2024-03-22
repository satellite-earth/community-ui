import { createIcon } from '@chakra-ui/icons';

const BarChart01 = createIcon({
	displayName: 'BarChart01',
	viewBox: '0 0 24 24',
	path: [
		<path
			d="M18 20V10M12 20V4M6 20V14"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		></path>,
	],
	defaultProps: { boxSize: 4 },
});

export default BarChart01;
