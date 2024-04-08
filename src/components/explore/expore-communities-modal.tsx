import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Heading,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	ModalProps,
	Stack,
	Text,
} from '@chakra-ui/react';
import useTimelineLoader from '../../hooks/use-timeline-loader';
import useSubject from '../../hooks/use-subject';
import { NostrEvent } from 'nostr-tools';
import { getTagValue } from '../../helpers/nostr/event';
import communitiesService from '../../services/communities';

function CommunityCard({
	community,
	onJoin,
}: {
	community: NostrEvent;
	onJoin?: () => void;
}) {
	const name = getTagValue(community, 'name');
	const about = getTagValue(community, 'about');
	const image = getTagValue(community, 'image');

	return (
		<Card
			direction={{ base: 'column', sm: 'row' }}
			overflow="hidden"
			variant="outline"
		>
			<Image
				objectFit="cover"
				maxW={{ base: '100%', sm: '200px' }}
				src={image}
			/>

			<Stack>
				<CardBody>
					<Heading size="md">{name}</Heading>

					<Text py="2">{about}</Text>
				</CardBody>

				<CardFooter>
					<Button variant="solid" colorScheme="blue" onClick={onJoin}>
						Join Community
					</Button>
				</CardFooter>
			</Stack>
		</Card>
	);
}

export default function ExploreCommunitiesModal({
	isOpen,
	onClose,
}: Omit<ModalProps, 'children'>) {
	const joined = useSubject(communitiesService.communities);
	const timeline = useTimelineLoader(
		'explore-communities',
		[{ kinds: [12012] }],
		'ws://127.0.0.1:2012',
	);

	const communities = useSubject(timeline.timeline).filter(
		(e) => !joined.includes(e.pubkey),
	);

	const joinCommunity = (pubkey: string) => {
		communitiesService.addCommunity(pubkey);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="4xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Explore Communities</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					{communities.map((community) => (
						<CommunityCard
							key={community.id}
							community={community}
							onJoin={() => joinCommunity(community.pubkey)}
						/>
					))}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
