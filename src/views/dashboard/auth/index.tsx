import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { EventTemplate, VerifiedEvent } from 'nostr-tools';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Flex, FormControl, FormLabel, Input } from '@chakra-ui/react';

import personalNode, { setPrivateNodeURL } from '../../../services/personal-node';
import Panel from '../../../components/dashboard/panel';
import TextButton from '../../../components/dashboard/text-button';

export default function DashboardAuthView() {
	const navigate = useNavigate();
	const [search] = useSearchParams();

	const { register, handleSubmit, formState } = useForm({
		defaultValues: { auth: search.get('auth') ?? '' },
	});

	const authenticate = async (auth: string | ((evt: EventTemplate) => Promise<VerifiedEvent>)) => {
		if (!personalNode) return;

		try {
			if (!personalNode.connected) await personalNode.connect();
			await personalNode.authenticate(auth);

			navigate('/dashboard', { replace: true });
		} catch (error) {
			if (error instanceof Error) alert(error.message);
		}
	};

	const loginWithNip07 = async () => {
		try {
			if (!window.nostr) throw new Error('Missing NIP-07 extension');

			await authenticate(async (draft) => window.nostr!.signEvent(draft));
		} catch (error) {
			if (error instanceof Error) alert(error.message);
		}
	};

	const submit = handleSubmit(async (values) => {
		await authenticate(values.auth);
	});

	// automatically send the auth if its set on mount
	useEffect(() => {
		const relay = search.get('relay');
		if (relay) setPrivateNodeURL(relay);
	}, []);

	return (
		<Flex direction="column" alignItems="center" justifyContent="center" h="full">
			<Panel as="form" label="AUTHENTICATE" minW="sm" onSubmit={submit} fontFamily="monospace">
				{formState.isSubmitting ? (
					<p style={{ marginInline: 'auto', marginBlock: 0 }}>Loading...</p>
				) : (
					<>
						<FormControl>
							<FormLabel htmlFor="auth">Auth Code</FormLabel>
							<Input id="auth" {...register('auth', { required: true })} isRequired autoComplete="off" />
						</FormControl>
						<TextButton type="submit" ml="auto" mt="2">
							[Login]
						</TextButton>
						{window.nostr && (
							<>
								<p style={{ marginInline: 'auto', marginBlock: 0 }}>--OR--</p>
								<TextButton type="button" onClick={loginWithNip07}>
									[Login with NIP-07]
								</TextButton>
							</>
						)}
					</>
				)}
			</Panel>
		</Flex>
	);
}
