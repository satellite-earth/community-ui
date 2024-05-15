import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Button, Flex, Spinner, Text, useToast } from '@chakra-ui/react';

import accountService from '../../services/account';
import { safeRelayUrls } from '../../helpers/relay';
import amberSignerService from '../../services/amber-signer';
import Diamond01 from '../../components/icons/components/diamond-01';
import Key01 from '../../components/icons/components/key-01';
import PuzzlePiece01 from '../../components/icons/components/puzzle-piece-01';

export default function LoginStartView() {
	const toast = useToast();
	const location = useLocation();
	const [loading, setLoading] = useState(false);

	const loginWithExtension = async () => {
		if (window.nostr) {
			try {
				setLoading(true);

				const pubkey = await window.nostr.getPublicKey();

				if (!accountService.hasAccount(pubkey)) {
					let relays: string[] = [];
					if (relays.length === 0) {
						relays = safeRelayUrls(['wss://relay.damus.io/', 'wss://relay.snort.social/', 'wss://nostr.wine/']);
					}

					accountService.addAccount({
						pubkey,
						relays,
						type: 'extension',
					});
				}

				accountService.switchAccount(pubkey);
			} catch (e) {
				if (e instanceof Error) toast({ description: e.message, status: 'error' });
			}
			setLoading(false);
		} else {
			toast({ status: 'warning', title: 'Cant find extension' });
		}
	};

	const loginWithAmber = async () => {
		try {
			const pubkey = await amberSignerService.getPublicKey();
			if (!accountService.hasAccount(pubkey)) {
				accountService.addAccount({ pubkey, type: 'amber' });
			}
			accountService.switchAccount(pubkey);
		} catch (e) {
			if (e instanceof Error) toast({ description: e.message, status: 'error' });
		}
	};

	if (loading) return <Spinner />;

	return (
		<>
			<Text fontWeight="bold">Login using</Text>
			<Flex gap="2" wrap="wrap">
				{window.nostr && (
					<Button flexDirection="column" h="auto" p="4" onClick={loginWithExtension} variant="outline">
						<PuzzlePiece01 boxSize={12} />
						Extension
					</Button>
				)}
				<Button
					flexDirection="column"
					h="auto"
					p="4"
					as={RouterLink}
					to="./nsec"
					state={location.state}
					variant="outline"
				>
					<Key01 boxSize={12} />
					Private key
				</Button>
				{amberSignerService.supported && (
					<Button flexDirection="column" h="auto" p="4" onClick={loginWithAmber} variant="outline">
						<Diamond01 boxSize={12} />
						Amber App
					</Button>
				)}
			</Flex>
		</>
	);
}
