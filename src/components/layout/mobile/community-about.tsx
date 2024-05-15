import { Box, Heading, Image, Text } from '@chakra-ui/react';
import { NostrEvent } from 'nostr-tools';

import { getCommunityBanner, getCommunityName } from '../../../helpers/nostr/communities';

export default function CommunityAbout({ community }: { community: NostrEvent }) {
	const name = getCommunityName(community);
	const banner = getCommunityBanner(community);

	return (
		<>
			{/* TODO: remove placeholder banner */}
			<Image src={banner || 'https://satellite.earth/assets/branding-94b401c7.png'} w="full" />
			<Box p="4">
				<Heading as="h2" size="lg" my="4">
					{name}
				</Heading>
				<Text>{community.content}</Text>
			</Box>
		</>
	);
}
