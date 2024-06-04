import { useEffect, useState } from 'react';
import { Button, Code, Flex, Text, useToast } from '@chakra-ui/react';

import { controlApi } from '../../../services/personal-node';
import useSubject from '../../../hooks/use-subject';
import Panel from '../../../components/dashboard/panel';
import PanelItemString from '../../../components/dashboard/panel-item-string';
import { serviceWorkerRegistration } from '../../../services/worker';
import { disableNotifications, enableNotifications } from '../../../services/notifications';

function NotificationSettings() {
	const toast = useToast();

	useEffect(() => {
		controlApi?.send(['CONTROL', 'NOTIFICATIONS', 'GET-VAPID-KEY']);
	}, []);

	const registration = useSubject(serviceWorkerRegistration);
	const [subscription, setSubscription] = useState<PushSubscription | null>();
	useEffect(() => {
		registration?.pushManager.getSubscription().then((sub) => setSubscription(sub));
	}, [registration]);

	const [loading, setLoading] = useState(false);
	const toggle = async () => {
		setLoading(true);
		try {
			if (!subscription) await enableNotifications();
			else await disableNotifications();

			registration?.pushManager.getSubscription().then((sub) => setSubscription(sub));
		} catch (error) {
			if (error instanceof Error) toast({ status: 'error', description: error.message });
		}
		setLoading(false);
	};

	return (
		<>
			{subscription ? (
				<>
					<Code whiteSpace="pre" overflow="auto" p="2" mb="2">
						{JSON.stringify(subscription?.toJSON(), null, 2)}
					</Code>
					<Button colorScheme="red" isLoading={loading} onClick={toggle}>
						Disable Notifications
					</Button>
				</>
			) : (
				<Button
					colorScheme="green"
					isLoading={loading}
					onClick={toggle}
					isDisabled={!registration || subscription === undefined}
				>
					Enable Notifications
				</Button>
			)}
			{!registration && <Text color="red">Service Worker unsupported</Text>}
		</>
	);
}

export default function NotificationsTab() {
	const vapidKey = useSubject(controlApi?.vapidKey);

	return (
		<Flex direction="column" p="4" gap="2">
			<Panel label="Notifications Config" maxW="2xl">
				<PanelItemString label="VAPID public key" value={vapidKey || 'NONE'} qr />
			</Panel>

			<Panel label="Device Settings" maxW="2xl">
				<NotificationSettings />
			</Panel>
		</Flex>
	);
}
