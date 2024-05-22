import { PropsWithChildren, Suspense, useEffect, useState } from 'react';
import { Button, ChakraProvider, Code, Flex, Spinner, useForceUpdate, useInterval } from '@chakra-ui/react';
import ErrorBoundary from './components/error-boundary';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import './styles.css';
import privateNode, { resetPrivateNodeURL } from './services/private-node';

import LoginView from './views/login';
import LoginStartView from './views/login/start';
import AppLayout from './components/layout';
import LoginNsecView from './views/login/nsec';
import { theme } from './theme';
import ChannelView from './views/community/channel';
import { GlobalProviders } from './providers';
import ConnectView from './views/connect';
import DashboardHomeView from './views/dashboard';
import DashboardAuthView from './views/dashboard/auth';
import MessagesView from './views/messages';
import DMTimelineProvider from './providers/messages-provider';
import CommunityView from './views/community';

function InitialConnection({ children }: PropsWithChildren) {
	const mode = 'private';

	const update = useForceUpdate();
	useInterval(update, 100);

	const [done, setDone] = useState(false);
	useEffect(() => {
		if (!done && privateNode?.connected) setDone(true);
	}, [privateNode?.connected, done]);

	if (done) return <>{children}</>;

	if (mode === 'private') {
		if (!privateNode) return <ConnectView />;

		if (!privateNode.connected)
			return (
				<Flex alignItems="center" justifyContent="center" gap="2" direction="column" h="full" w="full">
					<Flex gap="4" alignItems="center">
						<Spinner /> Connecting...
					</Flex>
					<Code>{privateNode.url}</Code>

					<Button variant="link" onClick={resetPrivateNodeURL}>
						Cancel
					</Button>
				</Flex>
			);
	}

	return <>{children}</>;
}

const router = createBrowserRouter([
	{
		path: 'login',
		element: <LoginView />,
		children: [
			{ path: '', element: <LoginStartView /> },
			{ path: 'nsec', element: <LoginNsecView /> },
		],
	},
	{
		path: '',
		element: (
			<InitialConnection>
				<DMTimelineProvider>
					<AppLayout />
				</DMTimelineProvider>
			</InitialConnection>
		),
		children: [
			{ path: 'messages', element: <MessagesView /> },
			{ path: '', element: <CommunityView />, children: [{ path: 'g/:id', element: <ChannelView /> }] },
		],
	},
	{
		path: 'dashboard',
		element: (
			<InitialConnection>
				<Outlet />
			</InitialConnection>
		),
		children: [
			{ path: '', element: <DashboardHomeView /> },
			{ path: 'auth', element: <DashboardAuthView /> },
		],
	},
]);

const App = () => (
	<ErrorBoundary>
		<ChakraProvider theme={theme}>
			<GlobalProviders>
				<Suspense fallback={<h1>Loading...</h1>}>
					<RouterProvider router={router} />
				</Suspense>
			</GlobalProviders>
		</ChakraProvider>
	</ErrorBoundary>
);

export default App;
