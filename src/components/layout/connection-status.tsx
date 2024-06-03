import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, useForceUpdate, useInterval } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import personalNode from '../../services/personal-node';

export default function ConnectionStatus() {
	const update = useForceUpdate();
	useInterval(update, 1000);
	const location = useLocation();

	if (!personalNode || personalNode.connected) return null;

	return (
		<Alert status="warning" flexWrap="wrap">
			<AlertIcon />
			<AlertTitle>Disconnected</AlertTitle>
			<AlertDescription>trying to reconnect to personal node...</AlertDescription>
			<Button as={RouterLink} to="/connect" replace state={{ back: location }} colorScheme="green" size="sm" ml="4">
				Reconnect
			</Button>
			<Button as={RouterLink} to="/connect?config" replace state={{ back: location }} variant="link" size="sm" ml="4">
				Change Node
			</Button>
		</Alert>
	);
}
