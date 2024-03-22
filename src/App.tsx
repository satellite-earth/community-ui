import { Suspense } from 'react';
import ErrorBoundary from './components/error-boundary';
import { Outlet, RouterProvider, createHashRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

import LoginView from './views/login';
import LoginStartView from './views/login/start';
import Layout from './components/layout';
import LoginNsecView from './views/login/nsec';
import { theme } from './theme';
import { ChannelView } from './views/channel';
import { GlobalProviders } from './providers';

const router = createHashRouter([
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
			<Layout>
				<Outlet />
			</Layout>
		),
		children: [{ path: 'g/:id', element: <ChannelView /> }],
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
