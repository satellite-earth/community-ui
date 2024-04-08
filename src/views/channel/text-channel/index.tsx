import { Flex, Heading } from '@chakra-ui/react';
import { COMMUNITY_CHAT_MESSAGE } from '../../../helpers/nostr/kinds';
import SendMessageForm from './send-message-form';
import useTimelineLoader from '../../../hooks/use-timeline-loader';
import clientRelaysService from '../../../services/client-relays';
import useSubject from '../../../hooks/use-subject';
import TextMessage from './text-message';

export default function TextChannelView({ groupId }: { groupId: string }) {
	const communityRelay = useSubject(clientRelaysService.community);
	const timeline = useTimelineLoader(
		`${communityRelay}-${groupId}-messages`,
		[{ kinds: [COMMUNITY_CHAT_MESSAGE], '#h': [groupId] }],
		communityRelay,
	);

	const messages = useSubject(timeline.timeline);

	return (
		<Flex direction="column" overflow="hidden" flex={1}>
			<Flex
				p="4"
				borderBottom="1px solid var(--chakra-colors-chakra-border-color)"
			>
				<Heading fontWeight="bold" size="md">
					{groupId}
				</Heading>
			</Flex>
			<Flex
				overflowX="hidden"
				overflowY="auto"
				flex={1}
				direction="column-reverse"
				p="2"
				gap="2"
			>
				{messages.map((message) => (
					<TextMessage key={message.id} message={message} />
				))}
			</Flex>
			<SendMessageForm groupId={groupId} />
		</Flex>
	);
}
