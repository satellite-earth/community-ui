import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, CloseButton, useForceUpdate } from '@chakra-ui/react';
import { useState } from 'react';
import { useLocalStorage } from 'react-use';

export default function RequestNotifications() {
	const [hide, setHide] = useLocalStorage('hide-request-notifications', false);
	const [loading, setLoading] = useState(false);
	const update = useForceUpdate();

	if (Notification.permission !== 'default' || hide) return;

	const ask = async () => {
		setLoading(true);
		try {
			await Notification.requestPermission();
			update();
		} catch (error) {}
		setLoading(false);
	};

	return (
		<Alert status="info" flexWrap="wrap" gap="2">
			<AlertIcon />
			<AlertTitle>Enable Notifications</AlertTitle>
			<AlertDescription>get notifications when you receive a new direct message</AlertDescription>
			<Button size="sm" isLoading={loading} onClick={ask} ml={{ base: 0, sm: '2' }} colorScheme="brand">
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
