import { Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { NostrEvent } from 'nostr-tools';

import { COMMUNITY_CHAT_MESSAGE } from '../../../helpers/nostr/kinds';
import useTimelineLoader from '../../../hooks/use-timeline-loader';
import useSubject from '../../../hooks/use-subject';
import SendMessageForm from './send-message-form';
import TextMessage from './text-message';
import { useCurrentCommunity } from '../../../providers/community-context';
import ChevronLeft from '../../../components/icons/components/chevron-left';
import Settings01 from '../../../components/icons/components/settings-01';
import EditChannelModal from '../../../components/group/edit-channel-modal';

export default function TextChannelView({ channelId, channel }: { channelId: string; channel?: NostrEvent }) {
	const edit = useDisclosure();
	const { relay, community } = useCurrentCommunity();

	const timeline = useTimelineLoader(
		`${community.pubkey}-${channelId}-messages`,
		[
			{
				kinds: [COMMUNITY_CHAT_MESSAGE],
				'#h': [channelId],
			},
		],
		relay,
	);

	const messages = useSubject(timeline.timeline);

	return (
		<Flex direction="column" overflow="hidden" h="full">
			<Flex p="2" borderBottom="1px solid var(--chakra-colors-chakra-border-color)" alignItems="center" gap="2">
				<IconButton
					as={RouterLink}
					icon={<ChevronLeft boxSize={6} />}
					aria-label="Back"
					hideFrom="md"
					variant="ghost"
					to="/"
				/>
				<Heading fontWeight="bold" size="md" ml={{ base: 0, md: '2' }}>
					{channelId}
				</Heading>
				<IconButton
					icon={<Settings01 boxSize={5} />}
					aria-label="Channel Settings"
					ml="auto"
					variant="ghost"
					onClick={edit.onOpen}
				/>
			</Flex>
			<Flex overflowX="hidden" overflowY="auto" flex={1} direction="column-reverse" p="2" gap="2">
				{messages.map((message) => (
					<TextMessage key={message.id} message={message} />
				))}
			</Flex>
			<SendMessageForm groupId={channelId} />

			{edit.isOpen && channel && <EditChannelModal channel={channel} isOpen onClose={edit.onClose} />}
		</Flex>
	);
}
