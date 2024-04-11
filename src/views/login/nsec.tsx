import { useCallback, useState } from 'react';
import { Button, Flex, FormControl, FormLabel, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { useNavigate } from 'react-router-dom';

import accountService from '../../services/account';
import signingService from '../../services/signing';
// import { COMMON_CONTACT_RELAY } from "../../const";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { isHexKey } from '../../helpers/nip19';

export default function LoginNsecView() {
	const navigate = useNavigate();

	const [show, setShow] = useState(false);
	const [error, setError] = useState(false);
	const [inputValue, setInputValue] = useState('');

	const [hexKey, setHexKey] = useState('');
	const [relayUrl, _setRelayUrl] = useState('');

	const [npub, setNpub] = useState('');

	const generateNewKey = useCallback(() => {
		const hex = generateSecretKey();
		const pubkey = getPublicKey(hex);
		setHexKey(bytesToHex(hex));
		setInputValue(nip19.nsecEncode(hex));
		setNpub(nip19.npubEncode(pubkey));
		setShow(true);
	}, [setHexKey, setInputValue, setShow]);

	const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setInputValue(e.target.value);

			try {
				let hex: string | null = null;
				if (isHexKey(e.target.value)) hex = e.target.value;
				else {
					const decode = nip19.decode(e.target.value);
					if (decode && decode.type === 'nsec') hex = bytesToHex(decode.data);
				}

				if (hex) {
					const pubkey = getPublicKey(hexToBytes(hex));
					setHexKey(hex);
					setNpub(nip19.npubEncode(pubkey));
					setError(false);
				} else {
					setError(true);
				}
			} catch (e) {
				setError(true);
			}
		},
		[setInputValue, setHexKey, setNpub, setError],
	);

	const handleSubmit: React.FormEventHandler<HTMLDivElement> = async (e) => {
		e.preventDefault();

		if (!hexKey) return;
		const pubkey = getPublicKey(hexToBytes(hexKey));

		const encrypted = await signingService.encryptSecKey(hexKey);
		accountService.addAccount({
			type: 'local',
			pubkey,
			relays: [relayUrl],
			...encrypted,
			readonly: false,
		});
		accountService.switchAccount(pubkey);
	};

	return (
		<Flex as="form" direction="column" gap="4" onSubmit={handleSubmit} w="full">
			<FormControl>
				<FormLabel>Enter user secret key (nsec)</FormLabel>
				<InputGroup size="md">
					<Input
						pr="4.5rem"
						type={show ? 'text' : 'password'}
						placeholder="nsec or hex"
						isRequired
						value={inputValue}
						onChange={handleInputChange}
						isInvalid={error}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={() => setShow((v) => !v)}>
							{show ? 'Hide' : 'Show'}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>

			<FormControl>
				<FormLabel>Pubkey Key (npub)</FormLabel>
				<Input type="text" readOnly isDisabled value={npub} />
			</FormControl>

			{/* <FormControl>
        <FormLabel>Bootstrap relay</FormLabel>
        <RelayUrlInput
          placeholder="wss://nostr.example.com"
          isRequired
          value={relayUrl}
          onChange={(e) => setRelayUrl(e.target.value)}
        />
        <FormHelperText>The first relay to connect to.</FormHelperText>
      </FormControl> */}
			<Flex justifyContent="space-between" gap="2">
				<Button variant="link" onClick={() => navigate('../')}>
					Back
				</Button>
				<Button ml="auto" onClick={generateNewKey}>
					Generate New
				</Button>
				<Button colorScheme="brand" type="submit">
					Login
				</Button>
			</Flex>
		</Flex>
	);
}
