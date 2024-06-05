import { Outlet, useMatch } from 'react-router-dom';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useMount } from 'react-use';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import useCurrentAccount from '../../hooks/use-current-account';
import useSubject from '../../hooks/use-subject';
import ConversationButton from './components/conversation-button';
import SimpleHeader from '../../components/simple-header';
import BottomNav from '../../components/layout/mobile/bottom-nav';
import { controlApi } from '../../services/personal-node';

function Conversation({ index, style, data }: ListChildComponentProps<[string, any][]>) {
	const [pubkey, stats] = data[index];

	return (
		<ConversationButton pubkey={pubkey} lastReceived={stats.lastReceived} lastSent={stats.lastSent} style={style} />
	);
}

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
						<Flex h="full" flex={1} overflow="hidden">
							<AutoSizer>
								{({ width, height }) => (
									<FixedSizeList
										height={height}
										width={width}
										itemData={sorted}
										itemCount={sorted.length}
										itemKey={(i, data) => data[i][0]}
										itemSize={64}
									>
										{Conversation}
									</FixedSizeList>
								)}
							</AutoSizer>
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
