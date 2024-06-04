import { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';

import { controlApi } from '../../../services/personal-node';
import useSubject from '../../../hooks/use-subject';
import Panel from '../../../components/dashboard/panel';
import PanelItemString from '../../../components/dashboard/panel-item-string';

export default function NotificationsTab() {
	useEffect(() => {
		controlApi?.send(['CONTROL', 'NOTIFICATIONS', 'GET-VAPID-KEY']);
	}, []);

	const vapidKey = useSubject(controlApi?.vapidKey);

	return (
		<Flex direction="column" p="4">
			<Panel label="Notifications Config" maxW="2xl">
				<PanelItemString label="VAPID public key" value={vapidKey || 'NONE'} qr />
			</Panel>
		</Flex>
	);
}
