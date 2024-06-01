import { Flex, Tab, TabList, TabPanel, TabPanels, Tabs, useBreakpointValue } from '@chakra-ui/react';

import StatusLog from './status-log';
import PanelItemString from '../../components/dashboard/panel-item-string';
import personalNode from '../../services/personal-node';
import Panel from '../../components/dashboard/panel';
import DatabasePanel from './database';
import ReceiverPanel from './receiver';
import BottomNav from '../../components/layout/mobile/bottom-nav';
import LogsTab from './tabs/logs-tab';

export default function DashboardHomeView() {
	const isMobile = useBreakpointValue({ base: true, lg: false });

	return (
		<>
			<Tabs w="full" h="full" overflow="hidden" isLazy display="flex" flexDirection="column" colorScheme="brand">
				<TabList overflowX="auto" overflowY="hidden">
					<Tab>Dashboard</Tab>
					{/* <Tab>Two</Tab> */}
					<Tab whiteSpace="pre">Status Logs</Tab>
				</TabList>

				<TabPanels flex={1} overflow="hidden" display="flex" flexDirection="column">
					<TabPanel flex={1} overflow="hidden" display="flex" flexDirection="column">
						<Flex direction="column" gap="2" h="full" w="full" maxW="8xl" mx="auto" overflow="hidden">
							<Flex gap="2" flex={1} overflow="hidden">
								<Flex gap="2" flex={1} direction="column" overflow="auto">
									<Panel label="RELAY">
										<PanelItemString label="URL" value={personalNode!.url} qr />
									</Panel>
									<ReceiverPanel />
									<DatabasePanel />
								</Flex>
								{!isMobile && (
									<Panel label="STATUS LOGS" fontFamily="monospace" overflow="hidden" flex={1}>
										<StatusLog />
									</Panel>
								)}
							</Flex>
						</Flex>
					</TabPanel>
					{/* <TabPanel p="0" flex={1} overflow="hidden" display="flex" flexDirection="column">
						<p>two!</p>
					</TabPanel> */}
					<TabPanel p="0" flex={1} overflow="hidden" display="flex" flexDirection="column">
						<LogsTab />
					</TabPanel>
				</TabPanels>
			</Tabs>
			<BottomNav />
		</>
	);
}
