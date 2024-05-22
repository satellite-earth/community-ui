import { NostrEvent } from 'nostr-tools';
import communityRelaysService from '../../../services/community-relays';
import useCommunityChannels from '../../../hooks/use-community-channels';
import { Flex } from '@chakra-ui/react';
import ChannelButton from './channel-button';
import { getChannelId } from '../../../helpers/nostr/channel';

export default function MobileChannelNav({ community }: { community: NostrEvent }) {
	const relay = communityRelaysService.getRelay(community.pubkey);

	const { channels } = useCommunityChannels(community, relay);

	return (
		<Flex direction="column">
			{channels.map((channel) => (
				<ChannelButton key={getChannelId(channel)} channel={channel} />
			))}
		</Flex>
	);
}
