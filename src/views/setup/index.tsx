import { Button, Flex, FormControl, FormHelperText, FormLabel, Heading, Input, useToast } from '@chakra-ui/react';
import { getPublicKey, nip19 } from 'nostr-tools';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';

import personalNode, { controlApi, setPrivateNodeURL } from '../../services/personal-node';
import useRouteSearchValue from '../../hooks/use-route-search-value';
import QRCodeScannerButton from '../../components/qr-code/qr-code-scanner-button';
import { isHexKey } from '../../helpers/nip19';
import dnsIdentityService from '../../services/dns-identity';
import useSubject from '../../hooks/use-subject';

export default function PersonalNodeSetupView() {
	const toast = useToast();
	const relayParam = useRouteSearchValue('relay');
	const authParam = useRouteSearchValue('auth');
	const config = useSubject(controlApi?.config);

	const { register, setValue, formState, handleSubmit } = useForm({
		defaultValues: { owner: '' },
		mode: 'all',
	});

	const submit = handleSubmit(async (values) => {
		try {
			if (!personalNode) throw new Error('Missing personal node connection');
			if (!controlApi) throw new Error('Missing control api connection');
			let pubkey: string = '';

			// hex
			if (isHexKey(values.owner)) pubkey = values.owner;

			// decode from NIP-19
			if (!pubkey && values.owner.startsWith('n')) {
				try {
					const decoded = nip19.decode(values.owner);
					switch (decoded.type) {
						case 'npub':
							pubkey = decoded.data;
							break;
						case 'nsec':
							pubkey = getPublicKey(decoded.data);
							break;
						case 'nprofile':
							pubkey = decoded.data.pubkey;
							break;
					}
				} catch (error) {
					throw new Error('Failed to parse npub');
				}
			}

			if (!pubkey && values.owner.includes('@')) {
				try {
					const id = await dnsIdentityService.fetchIdentity(values.owner);
					if (!id) throw new Error('Missing pubkey in NIP-05');
					pubkey = id.pubkey;
				} catch (error) {
					throw new Error('Unable to find NIP-05 ID');
				}
			}

			if (!pubkey) throw new Error('Unable to find nostr public key');
			if (!authParam.value) throw new Error('Missing auth code');

			await personalNode.authenticate(authParam.value);

			controlApi.send(['CONTROL', 'CONFIG', 'SET', 'owner', pubkey]);
		} catch (error) {
			if (error instanceof Error) toast({ status: 'error', description: error.message });
		}
	});

	if (config?.owner) {
		return <Navigate to="/" />;
	}

	if (relayParam.value) {
		if (personalNode) {
			if (new URL(personalNode.url).toString() !== new URL(relayParam.value).toString()) {
				setPrivateNodeURL(relayParam.value);
			}
		} else setPrivateNodeURL(relayParam.value);
	}

	return (
		<Flex w="full" h="full" alignItems="center" justifyContent="center">
			<Flex as="form" direction="column" gap="2" w="full" maxW="sm" m="4" onSubmit={submit}>
				<Heading>Setup Satellite Node</Heading>
				<FormControl isRequired>
					<FormLabel>Owner</FormLabel>
					<Flex gap="2">
						<Input {...register('owner', { required: true })} isRequired placeholder="john@example.com" />
						<QRCodeScannerButton onData={(url) => setValue('owner', url)} />
					</Flex>
					<FormHelperText>Enter the NIP-05, npub, or hex pubkey of the owner of this node</FormHelperText>
				</FormControl>
				<Button type="submit" colorScheme="brand" isLoading={formState.isSubmitting} ml="auto">
					Setup
				</Button>
			</Flex>
		</Flex>
	);
}
