import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import {
	Alert,
	AlertDescription,
	AlertIcon,
	AlertTitle,
	Button,
	Flex,
	FormControl,
	FormHelperText,
	FormLabel,
	Heading,
	Input,
	Spinner,
	useForceUpdate,
	useInterval,
	useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

import personalNode, { setPrivateNodeURL } from '../../services/personal-node';
import QRCodeScannerButton from '../../components/qr-code/qr-code-scanner-button';
import { useCallback, useEffect, useState } from 'react';

function ConnectForm({ onConnect }: { onConnect?: () => void }) {
	const [params] = useSearchParams();
	const { register, handleSubmit, formState, setValue } = useForm({
		defaultValues: {
			url: params.get('relay') ?? personalNode?.url ?? '',
		},
	});

	const submit = handleSubmit(async (values) => {
		const withProto = values.url.startsWith('ws') ? values.url : 'ws://' + values.url;
		setPrivateNodeURL(new URL(withProto).toString());
	});

	return (
		<Flex as="form" onSubmit={submit} gap="2" direction="column">
			<Heading size="lg">Satellite Node</Heading>
			<FormControl>
				<FormLabel>Satellite Node URL</FormLabel>
				<Flex gap="2">
					<Input type="url" {...register('url', { required: true })} isRequired placeholder="ws://127.0.0.1:2012" />
					<QRCodeScannerButton onData={(url) => setValue('url', url)} />
				</Flex>
				<FormHelperText>This is the URL to your personal satellite node</FormHelperText>
			</FormControl>
			<Flex>
				{params.has('config') && (
					<Button as={RouterLink} to="/" p="2" variant="link">
						Back
					</Button>
				)}
				<Button isLoading={formState.isSubmitting} type="submit" ml="auto" colorScheme="brand">
					Connect
				</Button>
			</Flex>
		</Flex>
	);
}

const steps = [3, 3, 5, 5, 10, 20, 30, 60];
function ReconnectForm() {
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
		<Flex direction="column" alignItems="center" gap="4">
			{count > 0 ? (
				<>
					<Heading size="md">Reconnecting in {count}s...</Heading>
				</>
			) : (
				<>
					<Heading size="md">Reconnecting...</Heading>
					<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="lg" />
				</>
			)}
			{error && (
				<Alert status="error">
					<AlertIcon />
					<AlertTitle>Failed!</AlertTitle>
					<AlertDescription>{error.message}</AlertDescription>
				</Alert>
			)}

			<Button as={RouterLink} to={'.?config'} variant="link">
				Cancel
			</Button>
		</Flex>
	);
}

export default function ConnectView() {
	const update = useForceUpdate();
	useInterval(update, 1000);

	const location = useLocation();
	const [params] = useSearchParams();
	const reconnect = !params.has('config') && !!personalNode;

	if (personalNode?.connected && !params.has('config')) {
		return <Navigate to={location.state?.back ?? '/'} replace />;
	}

	return (
		<Flex w="full" h="full" alignItems="center" justifyContent="center">
			<Flex direction="column" gap="2" w="full" maxW="sm" m="4">
				{reconnect ? <ReconnectForm /> : <ConnectForm />}
			</Flex>
		</Flex>
	);
}
