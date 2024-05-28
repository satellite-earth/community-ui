import { Button, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import RequirePersonalNodeAuth from '../../components/dashboard/require-personal-node-auth';
import StatusLog from './status-log';
import PanelItemString from '../../components/dashboard/panel-item-string';
import personalNode from '../../services/personal-node';
import Panel from '../../components/dashboard/panel';
import DatabasePanel from './database';
import ReceiverPanel from './receiver';

function DashboardHome() {
	const navigate = useNavigate();
	const isMobile = useBreakpointValue({ base: true, lg: false });

	return (
		<Flex direction="column" gap="2" h="full" maxW="8xl" mx="auto" overflow="hidden">
			<Flex p="2" rounded="lg" gap="4">
				<Heading size="md">Satellite Node</Heading>
				<Button as={RouterLink} to="/" variant="link">
					Back
				</Button>
			</Flex>

			<Flex gap="2" flex={1} overflow="hidden">
				<Flex gap="2" flex={1} direction="column" overflow="auto">
					<Panel label="RELAY">
						<PanelItemString label="URL" value={personalNode!.url} qr />
					</Panel>
					<ReceiverPanel />
					<DatabasePanel />
				</Flex>
				{!isMobile && <StatusLog flex={1} />}
			</Flex>
		</Flex>
	);
}

export default function DashboardHomeView() {
	return (
		<RequirePersonalNodeAuth>
			<DashboardHome />
		</RequirePersonalNodeAuth>
	);
}
