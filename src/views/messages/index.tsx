import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';

import useCurrentAccount from '../../hooks/use-current-account';
import privateNode from '../../services/private-node';
import useSubject from '../../hooks/use-subject';
import { useMessagesTimeline } from '../../providers/messages-provider';
import { groupIntoConversations, identifyConversation } from '../../helpers/nostr/dms';
import ConversationButton from './components/conversation-button';
import SimpleHeader from '../../components/simple-header';

function MessagesPage() {
	const account = useCurrentAccount()!;
	const timeline = useMessagesTimeline();
	const messages = useSubject(timeline.timeline);

	const conversations = useMemo(() => {
		return groupIntoConversations(messages)
			.map((c) => identifyConversation(c, account.pubkey))
			.sort((a, b) => b.messages[0].created_at - a.messages[0].created_at);
	}, [messages, account.pubkey]);

	return (
		<Flex direction="column" w={{ base: 'full', md: 'sm' }}>
			<SimpleHeader title="Messages"></SimpleHeader>
			{conversations.map((conversation) => (
				<ConversationButton key={conversation.pubkeys.join(',')} conversation={conversation} />
			))}
		</Flex>
	);
}

export default function MessagesView() {
	const account = useCurrentAccount();
	if (!account) return <Navigate to="/" replace />;
	if (!privateNode) return <Navigate to="/connect" />;

	return <MessagesPage />;
}
