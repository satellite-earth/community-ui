import { useMemo } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import { Flex, useBreakpointValue } from '@chakra-ui/react';

import useCurrentAccount from '../../hooks/use-current-account';
import useSubject from '../../hooks/use-subject';
import { useMessagesTimeline } from '../../providers/global/messages-provider';
import { groupIntoConversations, identifyConversation } from '../../helpers/nostr/dms';
import ConversationButton from './components/conversation-button';
import SimpleHeader from '../../components/simple-header';
import IntersectionObserverProvider from '../../providers/local/intersection-observer';
import useTimelineCurserIntersectionCallback from '../../hooks/use-timeline-cursor-intersection-callback';
import TimelineActionAndStatus from '../../components/timeline/timeline-action-and-status';
import BottomNav from '../../components/layout/mobile/bottom-nav';

export default function MessagesView() {
	const match = useMatch('/messages');
	const account = useCurrentAccount()!;
	const timeline = useMessagesTimeline();
	const messages = useSubject(timeline.timeline);

	const conversations = useMemo(() => {
		return groupIntoConversations(messages)
			.map((c) => identifyConversation(c, account.pubkey))
			.sort((a, b) => b.messages[0].created_at - a.messages[0].created_at);
	}, [messages, account.pubkey]);

	const callback = useTimelineCurserIntersectionCallback(timeline);

	const isMobile = useBreakpointValue({ base: true, lg: false });
	const showMenu = !isMobile || !!match;

	if (showMenu) {
		return (
			<>
				<Flex w="full" overflow="hidden">
					<Flex
						direction="column"
						w={{ base: 'full', lg: 'md' }}
						overflow={{ base: 'hidden', sm: 'auto' }}
						flexShrink={0}
					>
						<SimpleHeader title="Messages" />
						<IntersectionObserverProvider callback={callback}>
							<Flex direction="column" overflow="auto" flex={1}>
								{conversations.map((conversation) => (
									<ConversationButton key={conversation.pubkeys.join(',')} conversation={conversation} />
								))}
								<TimelineActionAndStatus timeline={timeline} />
							</Flex>
						</IntersectionObserverProvider>
					</Flex>
					<Outlet />
				</Flex>
				<BottomNav />
			</>
		);
	}

	return <Outlet />;
}
