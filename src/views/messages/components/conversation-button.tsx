import { Flex, LinkBox, LinkOverlay, Spacer, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { CheckIcon } from '@chakra-ui/icons';
import { NostrEvent, nip19 } from 'nostr-tools';

import Timestamp from '../../../components/timestamp';
import UserName from '../../../components/user/user-name';
import UserAvatar from '../../../components/user/user-avatar';
import { useDecryptionContainer } from '../../../providers/global/decryption-provider';
import UserDnsIdentity from '../../../components/user/user-dns-identity';
import { KnownConversation, hasResponded } from '../../../helpers/nostr/dms';
import useEventIntersectionRef from '../../../hooks/use-event-intersection-ref';
import HoverLinkOverlay from '../../../components/hover-link-overlay';

function MessagePreview({ message, pubkey }: { message: NostrEvent; pubkey: string }) {
	const { plaintext } = useDecryptionContainer(pubkey, message.content);
	return <Text isTruncated>{plaintext || '<Encrypted>'}</Text>;
}

export default function ConversationButton({ conversation }: { conversation: KnownConversation }) {
	const location = useLocation();
	const lastReceived = conversation.messages.find((m) => m.pubkey === conversation.correspondent);
	const lastMessage = conversation.messages[0];

	const ref = useEventIntersectionRef(lastMessage);

	return (
		<LinkBox as={Flex} gap="2" overflow="hidden" p="2" ref={ref} flexShrink={0}>
			<UserAvatar pubkey={conversation.correspondent} />
			<Flex direction="column" gap="1" overflow="hidden" flex={1}>
				<Flex gap="2" alignItems="center" overflow="hidden">
					<HoverLinkOverlay
						as={RouterLink}
						to={`/messages/p/${nip19.npubEncode(conversation.correspondent)}` + location.search}
					>
						<UserName pubkey={conversation.correspondent} isTruncated />
					</HoverLinkOverlay>
					<UserDnsIdentity onlyIcon pubkey={conversation.correspondent} />
					<Spacer />
					{hasResponded(conversation) && <CheckIcon boxSize={4} color="green.500" />}
					<Timestamp flexShrink={0} timestamp={lastMessage.created_at} />
				</Flex>
				{lastReceived && <MessagePreview message={lastReceived} pubkey={lastReceived.pubkey} />}
			</Flex>
		</LinkBox>
	);
}
