import { Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

import DesktopSideNav from './side-nav';
import ErrorBoundary from '../../error-boundary';
import RequestNotifications from '../request-notifications';
import ConnectionStatus from '../connection-status';

export default function DesktopLayout() {
	return (
		<>
			<ConnectionStatus />
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
