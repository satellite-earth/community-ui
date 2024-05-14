import {
	Box,
	Button,
	ButtonGroup,
	Center,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	Heading,
	IconButton,
	Spacer,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import { HamburgerIcon } from '@chakra-ui/icons';

import useSubject from '../../../hooks/use-subject';
import communitiesService from '../../../services/communities';
import { getCommunityName } from '../../../helpers/nostr/communities';
import { UserAvatar } from '../../user/user-avatar';
import useCurrentAccount from '../../../hooks/use-current-account';
import UserName from '../../user/user-name';
import UserDnsIdentity from '../../user/user-dns-identity';
import ColorModeButton from '../../color-mode-button';
import CommunityButton from './community-button';
import { useEffect } from 'react';
import ChannelNav from './channel-nav';
import CommunityContextProvider from '../../../providers/community-context';
import ExploreCommunitiesModal from '../../explore/expore-communities-modal';
import CommunityAbout from './community-about';
import Database01 from '../../icons/components/database-01';
import privateNode from '../../../services/private-node';

export default function MobileLayout() {
	const drawer = useDisclosure();
	const explore = useDisclosure();
	const account = useCurrentAccount();
	const location = useLocation();

	const community = useSubject(communitiesService.community);
	const communities = useSubject(communitiesService.communities);

	// close the drawer when a community is selected
	useEffect(() => {
		drawer.onClose();
	}, [community, drawer.onClose]);

	if (location.pathname === '/' || !community) {
		return (
			<Flex direction="column" overflow="hidden" w="full">
				<Flex alignItems="center" gap="4" p="2">
					<IconButton
						icon={<HamburgerIcon boxSize={5} />}
						aria-label="Show Menu"
						variant="ghost"
						onClick={drawer.onOpen}
					/>
					<Heading as="h1" size="md">
						{community ? getCommunityName(community) : 'Satellite'}
					</Heading>
				</Flex>
				{community ? (
					<Tabs h="full" overflow="hidden">
						<TabList>
							<Tab>Channels</Tab>
							<Tab>About</Tab>
						</TabList>

						<TabPanels>
							<TabPanel p="0">
								<ChannelNav community={community} />
							</TabPanel>
							<TabPanel p="0">
								<CommunityAbout community={community} />
							</TabPanel>
						</TabPanels>
					</Tabs>
				) : (
					<Flex direction="column">
						{communities.map((community) => (
							<CommunityButton community={community} key={community.id} />
						))}
					</Flex>
				)}

				<Drawer placement="left" onClose={drawer.onClose} isOpen={drawer.isOpen}>
					<DrawerOverlay />
					<DrawerContent>
						<DrawerHeader borderBottomWidth="1px" display="flex" gap="2" p="4">
							{account ? (
								<>
									<UserAvatar pubkey={account.pubkey} />
									<Box flex={1}>
										<UserName pubkey={account.pubkey} isTruncated />
										<Text fontSize="sm" fontWeight="normal" isTruncated>
											<UserDnsIdentity pubkey={account.pubkey} />
										</Text>
									</Box>
									<ColorModeButton variant="ghost" />
								</>
							) : (
								<Button as={RouterLink} to="/login">
									Login
								</Button>
							)}
						</DrawerHeader>
						<DrawerBody p="0" display="flex" flexDirection="column">
							{communities.map((community) => (
								<CommunityButton community={community} key={community.id} />
							))}
							<Spacer />
							<Button variant="link" p="4" w="full" onClick={explore.onOpen}>
								Explore Communities
							</Button>
							{privateNode && (
								<Button variant="link" p="4" w="full" as={RouterLink} to="/dashboard">
									Satellite Node
								</Button>
							)}
						</DrawerBody>
					</DrawerContent>
				</Drawer>

				{explore.isOpen && <ExploreCommunitiesModal isOpen onClose={explore.onClose} />}
			</Flex>
		);
	}

	return (
		<CommunityContextProvider community={community}>
			<Outlet />
		</CommunityContextProvider>
	);
}
