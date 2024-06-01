import { Flex } from '@chakra-ui/react';

import StatusLog from '../status-log';

export default function LogsTab() {
	return (
		<>
			<Flex gap="2"></Flex>
			<StatusLog h="full" px="4" pb="10" pt="4" />
		</>
	);
}
