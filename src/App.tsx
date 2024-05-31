import { Suspense } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from './components/error-boundary';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';

import './styles.css';

import LoginView from './views/login';
import LoginStartView from './views/login/start';
import AppLayout from './components/layout';
import LoginNsecView from './views/login/nsec';
import { theme } from './theme';
import ChannelView from './views/community/channel';
import { GlobalProviders } from './providers/global';
import ConnectView from './views/connect';
import DashboardHomeView from './views/dashboard';
import PersonalNodeAuthView from './views/connect/auth';
import MessagesView from './views/messages';
import DMTimelineProvider from './providers/global/messages-provider';
import CommunityView from './views/community';
import DirectMessageConversationView from './views/messages/conversation';
import RequirePrivateNodeConnection from './components/router/require-personal-node-connection';
import RequireCurrentAccount from './components/router/require-current-account';
import RequirePersonalNodeAuth from './components/router/require-personal-node-auth';

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
		path: 'connect',
		children: [
			{ path: '', element: <ConnectView /> },
			{ path: 'auth', element: <PersonalNodeAuthView /> },
		],
	},
	{
		path: '',
		element: (
			<RequirePrivateNodeConnection>
				<RequireCurrentAccount>
					<DMTimelineProvider>
						<AppLayout />
					</DMTimelineProvider>
				</RequireCurrentAccount>
			</RequirePrivateNodeConnection>
		),
		children: [
			{
				path: 'messages',
				element: <MessagesView />,
				children: [
					{
						path: 'p/:pubkey',
						element: (
							<RequirePersonalNodeAuth>
								<DirectMessageConversationView />
							</RequirePersonalNodeAuth>
						),
					},
				],
			},
			{ path: '', element: <CommunityView />, children: [{ path: 'g/:id', element: <ChannelView /> }] },
		],
	},
	{
		path: 'dashboard',
		element: (
			<RequirePrivateNodeConnection>
				<Outlet />
			</RequirePrivateNodeConnection>
		),
		children: [
			{
				path: '',
				element: (
					<RequirePersonalNodeAuth>
						<DashboardHomeView />
					</RequirePersonalNodeAuth>
				),
			},
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
