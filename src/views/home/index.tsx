import { Center, Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

import BottomNav from '../../components/layout/mobile/bottom-nav';
import { DirectMessagesIcon } from '../../components/icons';

export default function HomeView() {
	const mobile = useBreakpointValue({ base: true, md: false });

	if (mobile) {
		return (
			<>
				<Flex overflow="auto" h="full" direction="column">
					<Flex as={RouterLink} to="/messages" alignItems="center" p="2" gap="4" tabIndex={0} cursor="pointer">
						<Center w="10" h="10">
							<DirectMessagesIcon boxSize={6} />
						</Center>
						<Text fontWeight="bold">Direct Messages</Text>
					</Flex>
				</Flex>
				<BottomNav />
			</>
		);
	}

	return null;
}
