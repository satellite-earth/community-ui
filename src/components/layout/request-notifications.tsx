import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, CloseButton, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';

import useSubject from '../../hooks/use-subject';
import { serviceWorkerRegistration } from '../../services/worker';
import { enableNotifications } from '../../services/notifications';

export default function RequestNotifications() {
	const toast = useToast();
	const [hide, setHide] = useLocalStorage('hide-request-notifications', false);

	const registration = useSubject(serviceWorkerRegistration);
	const [subscription, setSubscription] = useState<PushSubscription | null>();
	useEffect(() => {
		registration?.pushManager.getSubscription().then((sub) => setSubscription(sub));
	}, [registration]);

	const [loading, setLoading] = useState(false);
	const enable = async () => {
		setLoading(true);
		try {
			if (Notification.permission !== 'granted') await Notification.requestPermission();
			if (!subscription) await enableNotifications();

			registration?.pushManager.getSubscription().then((sub) => setSubscription(sub));
		} catch (error) {
			if (error instanceof Error) toast({ status: 'error', description: error.message });
		}
		setLoading(false);
	};

	if (hide || !registration || !!subscription) return;

	return (
		<Alert status="info" flexWrap="wrap" gap="2" overflow="visible">
			<AlertIcon />
			<AlertTitle>Enable Notifications</AlertTitle>
			<AlertDescription>get notifications when you receive a new direct message</AlertDescription>
			<Button size="sm" isLoading={loading} onClick={enable} ml={{ base: 0, sm: '2' }} colorScheme="green">
				Enable Notifications
			</Button>
			<CloseButton
				alignSelf="flex-start"
				position="relative"
				right={-1}
				top={-1}
				onClick={() => setHide(true)}
				ml="auto"
			/>
		</Alert>
	);
}
