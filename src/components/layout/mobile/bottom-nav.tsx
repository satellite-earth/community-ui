import { Button, Flex, IconButton } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

import { DirectMessagesIcon } from '../../icons';
import Settings02 from '../../icons/components/settings-02';
import Home02 from '../../icons/components/home-02';

export default function BottomNav() {
	return (
		<Flex gap="2" p="2" borderTopWidth={1} hideFrom="md" bg="var(--chakra-colors-chakra-body-bg)">
			<IconButton as={RouterLink} to="/" icon={<Home02 boxSize={5} />} aria-label="Home" flex={1} />
			<IconButton
				as={RouterLink}
				to="/messages"
				icon={<DirectMessagesIcon boxSize={5} />}
				aria-label="Messages"
				flex={1}
			/>
			<IconButton as={RouterLink} to="/dashboard" icon={<Settings02 boxSize={5} />} aria-label="Settings" flex={1} />
		</Flex>
	);
}
