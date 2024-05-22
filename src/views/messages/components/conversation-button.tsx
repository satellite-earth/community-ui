import { Card, CardBody, Flex, LinkBox, LinkOverlay, Text } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { CheckIcon } from '@chakra-ui/icons';
import { NostrEvent, nip19 } from 'nostr-tools';

import Timestamp from '../../../components/timestamp';
import UserName from '../../../components/user/user-name';
import UserAvatar from '../../../components/user/user-avatar';
import { useDecryptionContainer } from '../../../providers/decryption-provider';
import UserDnsIdentity from '../../../components/user/user-dns-identity';
import { KnownConversation, hasResponded } from '../../../helpers/nostr/dms';

function MessagePreview({ message, pubkey }: { message: NostrEvent; pubkey: string }) {
	const { plaintext } = useDecryptionContainer(pubkey, message.content);
	return <Text isTruncated>{plaintext || '<Encrypted>'}</Text>;
}

export default function ConversationButton({ conversation }: { conversation: KnownConversation }) {
	const location = useLocation();
	const lastReceived = conversation.messages.find((m) => m.pubkey === conversation.correspondent);
	const lastMessage = conversation.messages[0];

	return (
		<LinkBox as={Flex} gap="2" overflow="hidden" p="2">
			<UserAvatar pubkey={conversation.correspondent} />
			<Flex direction="column" gap="1" overflow="hidden" flex={1}>
				<Flex gap="2" alignItems="center" overflow="hidden">
					<UserName pubkey={conversation.correspondent} isTruncated />
					<UserDnsIdentity onlyIcon pubkey={conversation.correspondent} />
					<Timestamp flexShrink={0} timestamp={lastMessage.created_at} ml="auto" />
					{hasResponded(conversation) && <CheckIcon boxSize={4} color="green.500" />}
				</Flex>
				{lastReceived && <MessagePreview message={lastReceived} pubkey={lastReceived.pubkey} />}
			</Flex>
			<LinkOverlay as={RouterLink} to={`/messages/${nip19.npubEncode(conversation.correspondent)}` + location.search} />
		</LinkBox>
	);
}
