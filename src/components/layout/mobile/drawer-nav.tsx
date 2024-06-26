import {
	Box,
	Button,
	Center,
	Divider,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	ModalProps,
	Spacer,
	Text,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

import useSubject from '../../../hooks/use-subject';
import communitiesService from '../../../services/communities';
import { UserAvatar } from '../../user/user-avatar';
import useCurrentAccount from '../../../hooks/use-current-account';
import UserName from '../../user/user-name';
import UserDnsIdentity from '../../user/user-dns-identity';
import ColorModeButton from '../../color-mode-button';
import personalNode from '../../../services/personal-node';
import { DirectMessagesIcon } from '../../icons';

export default function DrawerNav({ isOpen, onClose, ...props }: Omit<ModalProps, 'children'>) {
	const account = useCurrentAccount();

	const community = useSubject(communitiesService.community);
	const communities = useSubject(communitiesService.communities);

	return (
		<Drawer placement="left" onClose={onClose} isOpen={isOpen} {...props}>
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
					<Flex as={RouterLink} to="/messages" alignItems="center" p="2" gap="4" tabIndex={0} cursor="pointer">
						<Center w="10" h="10">
							<DirectMessagesIcon boxSize={6} />
						</Center>
						<Text fontWeight="bold">Messages</Text>
					</Flex>
					<Divider />
					<Spacer />
					{/* {communities.map((community) => (
						<MobileCommunityButton community={community} key={community.id} />
					))} */}
					<Spacer />
					{personalNode && (
						<Button variant="link" p="4" w="full" as={RouterLink} to="/dashboard">
							Satellite Node
						</Button>
					)}
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	);
}
