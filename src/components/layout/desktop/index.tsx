import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

import DesktopSideNav from './side-nav';
import ErrorBoundary from '../../error-boundary';

export default function DesktopLayout() {
	return (
		<Flex
			direction={{
				base: 'column',
				md: 'row',
			}}
			overflow="hidden"
			h="full"
		>
			<DesktopSideNav />
			<ErrorBoundary>
				<Outlet />
			</ErrorBoundary>
		</Flex>
	);
}
