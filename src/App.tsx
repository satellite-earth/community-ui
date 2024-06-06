import { Suspense } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from './components/error-boundary';
import { RouterProvider, ScrollRestoration, createBrowserRouter } from 'react-router-dom';

import './styles.css';

import LoginView from './views/login';
import LoginStartView from './views/login/start';
import AppLayout from './components/layout';
import LoginNsecView from './views/login/nsec';
import { theme } from './theme';
import { GlobalProviders } from './providers/global';
import ConnectView from './views/connect';
import DashboardHomeView from './views/dashboard';
import PersonalNodeAuthView from './views/connect/auth';
import MessagesView from './views/messages';
import DirectMessageConversationView from './views/messages/conversation';
import RequirePersonalNodeConnection from './components/router/require-personal-node-connection';
import RequireCurrentAccount from './components/router/require-current-account';
import RequirePersonalNodeAuth from './components/router/require-personal-node-auth';
import HomeView from './views/home';
import PersonalNodeSetupView from './views/setup';

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
			{
				path: 'auth',
				element: (
					<RequirePersonalNodeConnection>
						<PersonalNodeAuthView />
					</RequirePersonalNodeConnection>
				),
			},
		],
	},
	{
		path: 'setup',
		element: <PersonalNodeSetupView />,
	},
	{
		path: 'dashboard',
		element: (
			<RequirePersonalNodeConnection>
				<ScrollRestoration />
				<AppLayout />
			</RequirePersonalNodeConnection>
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
	{
		path: '',
		element: (
			<RequirePersonalNodeConnection>
				<RequireCurrentAccount>
					<ScrollRestoration />
					<AppLayout />
				</RequireCurrentAccount>
			</RequirePersonalNodeConnection>
		),
		children: [
			{
				path: 'messages',
				element: (
					<RequirePersonalNodeAuth>
						<MessagesView />
					</RequirePersonalNodeAuth>
				),
				children: [
					{
						path: 'p/:pubkey',
						element: <DirectMessageConversationView />,
					},
				],
			},
			{
				path: '',
				element: <HomeView />,
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
