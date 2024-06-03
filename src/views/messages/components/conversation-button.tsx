import { Flex, LinkBox, Spacer } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { CheckIcon } from '@chakra-ui/icons';
import { nip19 } from 'nostr-tools';

import Timestamp from '../../../components/timestamp';
import UserName from '../../../components/user/user-name';
import UserAvatar from '../../../components/user/user-avatar';
import UserDnsIdentity from '../../../components/user/user-dns-identity';
import HoverLinkOverlay from '../../../components/hover-link-overlay';

// function MessagePreview({ message, pubkey }: { message: NostrEvent; pubkey: string }) {
// 	const { plaintext } = useDecryptionContainer(pubkey, message.content);
// 	return <Text isTruncated>{plaintext || '<Encrypted>'}</Text>;
// }

export default function ConversationButton({
	pubkey,
	lastSent,
	lastReceived,
}: {
	pubkey: string;
	lastSent?: number;
	lastReceived?: number;
}) {
	const location = useLocation();

	const lastMessage = Math.max(lastSent ?? 0, lastReceived ?? 0);

	return (
		<LinkBox as={Flex} gap="2" overflow="hidden" p="2" flexShrink={0}>
			<UserAvatar pubkey={pubkey} />
			<Flex direction="column" gap="1" overflow="hidden" flex={1}>
				<Flex gap="2" alignItems="center" overflow="hidden">
					<HoverLinkOverlay as={RouterLink} to={`/messages/p/${nip19.npubEncode(pubkey)}` + location.search}>
						<UserName pubkey={pubkey} isTruncated />
					</HoverLinkOverlay>
					<Spacer />
					{lastSent && lastReceived && lastSent > lastReceived && <CheckIcon boxSize={4} color="green.500" />}
					{lastMessage && <Timestamp flexShrink={0} timestamp={lastMessage} />}
				</Flex>
				<UserDnsIdentity pubkey={pubkey} />
			</Flex>
		</LinkBox>
	);
}
