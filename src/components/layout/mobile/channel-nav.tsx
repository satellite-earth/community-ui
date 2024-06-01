import { NostrEvent } from 'nostr-tools';
import { Center, Flex, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

import communityRelaysService from '../../../services/community-relays';
import useCommunityChannels from '../../../hooks/use-community-channels';
import ChannelButton from './channel-button';
import { getChannelId } from '../../../helpers/nostr/channel';
import MessageSquare01 from '../../icons/components/message-square-01';

export default function MobileChannelNav({ community }: { community: NostrEvent }) {
	const relay = communityRelaysService.getRelay(community.pubkey);

	const { channels } = useCommunityChannels(community, relay);

	return (
		<Flex direction="column">
			<Flex as={RouterLink} to="/messages" alignItems="center" p="2" gap="4" tabIndex={0} cursor="pointer">
				<Center w="10" h="10">
					<MessageSquare01 boxSize={6} />
				</Center>
				<Text fontWeight="bold">Messages</Text>
			</Flex>
			{channels.map((channel) => (
				<ChannelButton key={getChannelId(channel)} channel={channel} />
			))}
		</Flex>
	);
}
