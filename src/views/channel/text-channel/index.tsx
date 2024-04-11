import { Flex, Heading } from '@chakra-ui/react';

import { COMMUNITY_CHAT_MESSAGE } from '../../../helpers/nostr/kinds';
import useTimelineLoader from '../../../hooks/use-timeline-loader';
import useSubject from '../../../hooks/use-subject';
import useCurrentCommunity from '../../../hooks/use-current-community';
import SendMessageForm from './send-message-form';
import TextMessage from './text-message';

export default function TextChannelView({ groupId }: { groupId: string }) {
	const { relay, community } = useCurrentCommunity();
	const timeline = useTimelineLoader(
		`${community.pubkey}-${groupId}-messages`,
		[
			{
				kinds: [COMMUNITY_CHAT_MESSAGE],
				'#h': [groupId],
			},
		],
		relay,
	);

	const messages = useSubject(timeline.timeline);

	return (
		<Flex direction="column" overflow="hidden" flex={1}>
			<Flex p="4" borderBottom="1px solid var(--chakra-colors-chakra-border-color)">
				<Heading fontWeight="bold" size="md">
					{groupId}
				</Heading>
			</Flex>
			<Flex overflowX="hidden" overflowY="auto" flex={1} direction="column-reverse" p="2" gap="2">
				{messages.map((message) => (
					<TextMessage key={message.id} message={message} />
				))}
			</Flex>
			<SendMessageForm groupId={groupId} />
		</Flex>
	);
}
