import {
	Divider,
	Flex,
	IconButton,
	Image,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	useColorMode,
	useDisclosure,
} from '@chakra-ui/react';
import { NostrEvent } from 'nostr-tools';

import useSubject from '../../hooks/use-subject';
import timelineCacheService from '../../services/timeline-cache';
import UserAvatar from '../user/user-avatar';
import useCurrentAccount from '../../hooks/use-current-account';
import accountService from '../../services/account';
import UserName from '../user/user-name';
import UserDnsIdentity from '../user/user-dns-identity';
import Compass01 from '../icons/components/compass-01';
import Moon01 from '../icons/components/moon-01';
import Sun from '../icons/components/sun';
import ExploreCommunitiesModal from '../explore/expore-communities-modal';
import communitiesService from '../../services/communities';
import { getTagValue } from '../../helpers/nostr/event';

function UserAccount() {
	const account = useCurrentAccount()!;

	return (
		<Menu placement="right" offset={[32, 16]}>
			<MenuButton
				as={IconButton}
				variant="outline"
				w="12"
				h="12"
				borderRadius="50%"
				icon={<UserAvatar pubkey={account.pubkey} />}
			/>
			<MenuList boxShadow="lg">
				<Flex gap="2" px="2" alignItems="center">
					<UserAvatar pubkey={account.pubkey} />
					<Flex direction="column">
						<UserName pubkey={account.pubkey} fontSize="xl" />
						<UserDnsIdentity pubkey={account.pubkey} />
					</Flex>
				</Flex>
				<MenuDivider />
				<MenuItem onClick={() => accountService.logout()}>Logout</MenuItem>
			</MenuList>
		</Menu>
	);
}

function CommunityButton({ community }: { community: NostrEvent }) {
	const selected = useSubject(communitiesService.community);

	const select = () => {
		timelineCacheService.clear();
		communitiesService.switch(community.pubkey);
	};

	const name = community
		? getTagValue(community, 'name') ?? 'Community'
		: 'Community';
	const image = community && getTagValue(community, 'image');

	return (
		<IconButton
			aria-label={name}
			title={name}
			icon={
				image ? (
					<Image borderRadius="lg" src={image} w="10" h="10" />
				) : undefined
			}
			onClick={select}
			h="12"
			w="12"
			colorScheme={selected?.pubkey === community.pubkey ? 'brand' : undefined}
			variant="outline"
		/>
	);
}

export default function CommunitiesNav() {
	const account = useCurrentAccount();
	const explore = useDisclosure();
	const { colorMode, toggleColorMode } = useColorMode();
	const communities = useSubject(communitiesService.communities);

	return (
		<Flex
			direction="column"
			gap="2"
			px="2"
			py="2"
			shrink={0}
			borderRightWidth={1}
		>
			{account && (
				<>
					<UserAccount />
					<Divider />
				</>
			)}
			{communities.map((community) => (
				<CommunityButton key={community.pubkey} community={community} />
			))}
			<IconButton
				aria-label="Explore"
				title="Explore"
				icon={<Compass01 boxSize={7} />}
				w="12"
				h="12"
				fontSize="24"
				onClick={explore.onOpen}
			/>
			<IconButton
				w="12"
				h="12"
				aria-label="Color Mode"
				title="Color Mode"
				onClick={toggleColorMode}
				mt="auto"
				icon={
					colorMode === 'light' ? <Moon01 boxSize={6} /> : <Sun boxSize={6} />
				}
			/>

			{explore.isOpen && (
				<ExploreCommunitiesModal isOpen onClose={explore.onClose} />
			)}
		</Flex>
	);
}
