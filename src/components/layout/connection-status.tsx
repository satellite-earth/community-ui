import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle, Button, Flex, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import personalNode from '../../services/personal-node';
import WifiOff from '../icons/components/wifi-off';
import useSubject from '../../hooks/use-subject';

const steps = [2, 2, 3, 3, 5, 5, 10, 20, 30, 60];
function ReconnectPrompt() {
	const location = useLocation();

	const [tries, setTries] = useState(0);
	const [count, setCount] = useState(steps[0]);
	const [error, setError] = useState<Error>();

	const connect = useCallback(async () => {
		try {
			await personalNode?.connect();
		} catch (error) {
			if (error instanceof Error) setError(error);
			setCount(steps[Math.min(tries, steps.length - 1)]);
			setTries((v) => v + 1);
		}
	}, [setError, setCount, setTries, tries]);

	useEffect(() => {
		const i = setInterval(() => {
			setCount((v) => {
				if (v === 0) return 0;
				if (v === 1) connect();
				return v - 1;
			});
		}, 1000);
		return () => clearInterval(i);
	}, [connect, setCount]);

	return (
		<>
			<Alert status="info" flexWrap="wrap" gap="2" overflow="visible">
				<WifiOff color="blue.500" boxSize={6} />
				<AlertTitle>{count > 0 ? <>Reconnecting in {count}s...</> : <>Reconnecting...</>}</AlertTitle>
				<AlertDescription>trying to reconnect to personal node...</AlertDescription>
				<Flex gap="2">
					<Button as={RouterLink} to="/connect" replace state={{ back: location }} colorScheme="green" size="sm">
						Reconnect
					</Button>
					<Button as={RouterLink} to="/connect?config" state={{ back: location }} variant="link" size="sm" p="2">
						Change Node
					</Button>
				</Flex>

				{error && <Text color="red.500">{error.message}</Text>}
			</Alert>
		</>
	);
}

export default function ConnectionStatus() {
	const connected = useSubject(personalNode?.connectedSub);

	if (!personalNode || connected) return null;
	return <ReconnectPrompt />;
}
