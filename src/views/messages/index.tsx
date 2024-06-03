import { Outlet, useMatch } from 'react-router-dom';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useMount } from 'react-use';

import useCurrentAccount from '../../hooks/use-current-account';
import useSubject from '../../hooks/use-subject';
import ConversationButton from './components/conversation-button';
import SimpleHeader from '../../components/simple-header';
import BottomNav from '../../components/layout/mobile/bottom-nav';
import { controlApi } from '../../services/personal-node';

export default function MessagesView() {
	const match = useMatch('/messages');
	const account = useCurrentAccount()!;

	const stats = useSubject(controlApi?.directMessageStats);

	useMount(() => {
		controlApi?.send(['CONTROL', 'DM', 'GET-STATS']);
	});

	const sorted = Object.entries(stats || {}).sort(
		(a, b) =>
			Math.max(b[1].lastReceived ?? 0, b[1].lastSent ?? 0) - Math.max(a[1].lastReceived ?? 0, a[1].lastSent ?? 0),
	);

	const isMobile = useBreakpointValue({ base: true, lg: false });
	const showMenu = !isMobile || !!match;

	if (showMenu) {
		return (
			<>
				<Flex w="full" overflow="hidden" h="full">
					<Flex
						direction="column"
						w={{ base: 'full', lg: 'md' }}
						overflow={{ base: 'hidden', sm: 'auto' }}
						flexShrink={0}
					>
						<SimpleHeader title="Messages" />
						<Flex direction="column" overflow="auto" flex={1} h="full">
							{sorted.map(([pubkey, stats]) => (
								<ConversationButton
									key={pubkey}
									pubkey={pubkey}
									lastReceived={stats.lastReceived}
									lastSent={stats.lastSent}
								/>
							))}
						</Flex>
					</Flex>
					<Outlet />
				</Flex>
				<BottomNav />
			</>
		);
	}

	return <Outlet />;
}
