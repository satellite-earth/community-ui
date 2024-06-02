import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

import DesktopSideNav from './side-nav';
import ErrorBoundary from '../../error-boundary';
import RequestNotifications from '../request-notifications';

export default function DesktopLayout() {
	return (
		<>
			<RequestNotifications />
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
		</>
	);
}
