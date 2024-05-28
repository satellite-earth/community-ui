import { memo, useCallback, useContext, useEffect, useMemo } from 'react';
import { ButtonGroup, Card, Flex, IconButton } from '@chakra-ui/react';
import { UNSAFE_DataRouterContext, useLocation, useNavigate } from 'react-router-dom';
import { NostrEvent, kinds } from 'nostr-tools';

import { ChevronLeftIcon, ThreadIcon } from '../../../components/icons';
import UserAvatar from '../../../components/user/user-avatar';
import useSubject from '../../../hooks/use-subject';
import useTimelineLoader from '../../../hooks/use-timeline-loader';
import useCurrentAccount from '../../../hooks/use-current-account';
import IntersectionObserverProvider from '../../../providers/local/intersection-observer';
import useTimelineCurserIntersectionCallback from '../../../hooks/use-timeline-cursor-intersection-callback';
import TimelineActionAndStatus from '../../../components/timeline/timeline-action-and-status';
import UserDnsIdentity from '../../../components/user/user-dns-identity';
import SendMessageForm from '../components/send-message-form';
import { groupMessages } from '../../../helpers/nostr/dms';
import ThreadDrawer from '../components/thread-drawer';
import ThreadsProvider from '../../../providers/local/thread-provider';
import TimelineLoader from '../../../classes/timeline-loader';
import DirectMessageBlock from '../components/direct-message-block';
import useParamsProfilePointer from '../../../hooks/use-params-pubkey-pointer';
import personalNode from '../../../services/personal-node';
import useRouterMarker from '../../../hooks/use-router-marker';
import UserName from '../../../components/user/user-name';
import { BackButton } from '../../../components/back-button';

/** This is broken out from DirectMessageChatPage for performance reasons. Don't use outside of file */
const ChatLog = memo(({ timeline }: { timeline: TimelineLoader }) => {
	const messages = useSubject(timeline.timeline);
	const filteredMessages = useMemo(
		() => messages.filter((e) => !e.tags.some((t) => t[0] === 'e' && t[3] === 'root')),
		[messages.length],
	);
	const grouped = useMemo(() => groupMessages(filteredMessages), [filteredMessages]);

	return (
		<>
			{grouped.map((group) => (
				<DirectMessageBlock key={group.id} messages={group.events} reverse />
			))}
		</>
	);
});

function DirectMessageConversationPage({ pubkey }: { pubkey: string }) {
	const account = useCurrentAccount()!;
	const navigate = useNavigate();
	const location = useLocation();

	const { router } = useContext(UNSAFE_DataRouterContext)!;
	const marker = useRouterMarker(router);
	useEffect(() => {
		if (location.state?.thread && marker.index.current === null) {
			// the drawer just open, set the marker
			marker.set(1);
		}
	}, [location]);

	const openDrawerList = useCallback(() => {
		marker.set(0);
		navigate('.', { state: { thread: 'list' } });
	}, [marker, navigate]);

	const closeDrawer = useCallback(() => {
		if (marker.index.current !== null && marker.index.current > 0) {
			navigate(-marker.index.current);
		} else navigate('.', { state: { thread: undefined } });
		marker.reset();
	}, [marker, navigate]);

	const eventFilter = useCallback(
		(event: NostrEvent) => {
			const from = event.pubkey;
			const to = event.tags.find((t) => t[0] === 'p')?.[1];

			return (from === account.pubkey && to === pubkey) || (from === pubkey && to === account.pubkey);
		},
		[account, pubkey],
	);

	const timeline = useTimelineLoader(
		`${pubkey}-${account.pubkey}-messages`,
		[
			{
				kinds: [kinds.EncryptedDirectMessage],
				'#p': [account.pubkey, pubkey],
				authors: [pubkey, account.pubkey],
			},
		],
		personalNode!,
		{ eventFilter },
	);

	const callback = useTimelineCurserIntersectionCallback(timeline);

	return (
		<Flex direction="column" w="full" h="100vh">
			<ThreadsProvider timeline={timeline}>
				<IntersectionObserverProvider callback={callback}>
					<Flex flexShrink={0} p="2" borderBottomWidth={1}>
						<Flex gap="2" alignItems="center">
							<BackButton />
							<UserAvatar pubkey={pubkey} size="sm" />
							<UserName pubkey={pubkey} fontWeight="bold" />
							<UserDnsIdentity pubkey={pubkey} onlyIcon />
						</Flex>
						<ButtonGroup ml="auto">
							<IconButton
								aria-label="Threads"
								title="Threads"
								icon={<ThreadIcon boxSize={5} />}
								onClick={openDrawerList}
							/>
						</ButtonGroup>
					</Flex>
					<Flex h="0" flex={1} overflowX="hidden" overflowY="scroll" direction="column-reverse" gap="2" py="4" px="2">
						<ChatLog timeline={timeline} />
						<TimelineActionAndStatus timeline={timeline} />
					</Flex>
					<SendMessageForm flexShrink={0} pubkey={pubkey} />
					{location.state?.thread && (
						<ThreadDrawer isOpen onClose={closeDrawer} threadId={location.state.thread} pubkey={pubkey} />
					)}
				</IntersectionObserverProvider>
			</ThreadsProvider>
		</Flex>
	);
}

export default function DirectMessageConversationView() {
	const { pubkey } = useParamsProfilePointer();

	return <DirectMessageConversationPage pubkey={pubkey} />;
}
