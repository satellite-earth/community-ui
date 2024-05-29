import { Navigate, useLocation } from 'react-router-dom';
import { Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Input, Spinner, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import personalNode, { resetPrivateNodeURL, setPrivateNodeURL } from '../../services/personal-node';
import QRCodeScannerButton from '../../components/qr-code/qr-code-scanner-button';

function ConnectForm({ onConnect }: { onConnect?: () => void }) {
	const { register, handleSubmit, formState, setValue } = useForm({
		defaultValues: {
			url: '',
		},
	});

	const submit = handleSubmit(async (values) => {
		const withProto = values.url.startsWith('ws') ? values.url : 'ws://' + values.url;
		setPrivateNodeURL(new URL(withProto).toString());
	});

	if (formState.isSubmitting)
		return (
			<>
				<Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
				<Text>Connecting...</Text>

				<Button variant="link" onClick={resetPrivateNodeURL}>
					Cancel
				</Button>
			</>
		);

	return (
		<Flex as="form" onSubmit={submit} gap="2" direction="column">
			<FormControl>
				<FormLabel>Satellite Node URL</FormLabel>
				<Flex gap="2">
					<Input type="url" {...register('url', { required: true })} isRequired placeholder="ws://127.0.0.1:2012" />
					<QRCodeScannerButton onData={(url) => setValue('url', url)} />
				</Flex>
				<FormHelperText>This is the URL to your personal satellite node</FormHelperText>
			</FormControl>
			<Button isLoading={formState.isSubmitting} type="submit" ml="auto" colorScheme="brand">
				Connect
			</Button>
		</Flex>
	);
}

export default function ConnectView() {
	const location = useLocation();

	if (personalNode) {
		return <Navigate to={location.state?.back ?? '/'} replace />;
	}

	return (
		<Flex w="full" h="full" alignItems="center" justifyContent="center">
			<Flex direction="column" gap="2" w="full" maxW="sm" m="4">
				<Heading size="lg">Satellite Communities</Heading>
				<ConnectForm />
			</Flex>
		</Flex>
	);
}
