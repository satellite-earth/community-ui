import { Center, Flex, Heading } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

import useSubject from '../../../hooks/use-subject';
import communitiesService from '../../../services/communities';
import CommunitiesNav from './communities-nav';
import CommunityContextProvider from '../../../providers/community-context';
import ChannelNav from './channel-nav';
import ErrorBoundary from '../../error-boundary';

export default function DesktopLayout() {
	const community = useSubject(communitiesService.community);

	return (
		<>
			<Flex
				direction={{
					base: 'column',
					md: 'row',
				}}
				overflow="hidden"
				h="full"
			>
				<CommunitiesNav />
				{community ? (
					<>
						<CommunityContextProvider community={community}>
							<ChannelNav />
							<Flex direction="column" overflow="hidden" grow={1}>
								<ErrorBoundary>
									<Outlet />
								</ErrorBoundary>
							</Flex>
						</CommunityContextProvider>
					</>
				) : (
					<Center flex={1}>
						<Heading>Select Community</Heading>
					</Center>
				)}
			</Flex>
		</>
	);
}
