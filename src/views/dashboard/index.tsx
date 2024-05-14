import { Box, Button, Flex, Heading, Text, useBreakpointValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import RequirePrivateNodeAuth from '../../components/dashboard/require-private-node-auth';
import StatusLog from './status-log';
import PanelItemString from '../../components/dashboard/panel-item-string';
import privateNode from '../../services/private-node';
import Panel from '../../components/dashboard/panel';
import DatabasePanel from './database';
import ReceiverPanel from './receiver';

function DashboardHome() {
	const navigate = useNavigate();
	const isMobile = useBreakpointValue({ base: true, lg: false });

	return (
		<Flex direction="column" gap="2" h="full" maxW="8xl" mx="auto" overflow="hidden">
			<Flex p="2" rounded="lg" gap="4">
				<Button onClick={() => navigate(-1)} variant="link">
					Back
				</Button>
				<Heading size="md">Satellite Node</Heading>
			</Flex>

			<Flex gap="2" flex={1}>
				<Flex gap="2" flex={1} direction="column">
					<Panel label="RELAY">
						<PanelItemString label="URL" value={privateNode!.url} qr />
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
		<RequirePrivateNodeAuth>
			<DashboardHome />
		</RequirePrivateNodeAuth>
	);
}
