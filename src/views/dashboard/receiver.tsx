import { Box, Code, Flex, Input, Text, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import Panel from '../../components/dashboard/panel';
import PanelItemToggle from '../../components/dashboard/panel-item-toggle';
import useSubject from '../../hooks/use-subject';
import { controlApi } from '../../services/private-node';
import TextButton from '../../components/dashboard/text-button';
import Signal01 from '../../components/icons/components/signal-01';
import { RelayUrlInput } from '../../components/relay-url-input';
import UserName from '../../components/user/user-name';
import { PubkeyInput } from '../../components/pubkey-input';
import { nip19 } from 'nostr-tools';

function AddRelayForm({ onCancel, onAdd }: { onCancel?: () => void; onAdd?: () => void }) {
	const { register, handleSubmit, formState } = useForm({ defaultValues: { relay: '' }, mode: 'all' });

	const submit = handleSubmit(async (values) => {
		if (!controlApi) return;
		await controlApi.addExplicitRelay(values.relay);

		if (onAdd) onAdd();
	});

	return (
		<Flex as="form" onSubmit={submit} gap="4">
			<RelayUrlInput
				{...register('relay', { required: true })}
				placeholder="wss://relay.example.com"
				size="sm"
				isRequired
			/>
			<TextButton type="submit" isLoading={formState.isSubmitting} py="2">
				[Add]
			</TextButton>
			<TextButton type="button" onClick={onCancel} py="2">
				[Cancel]
			</TextButton>
		</Flex>
	);
}

function AddPubkeyForm({ onCancel, onAdd }: { onCancel?: () => void; onAdd?: () => void }) {
	const { register, handleSubmit, formState } = useForm({ defaultValues: { pubkey: '' }, mode: 'all' });

	const submit = handleSubmit(async (values) => {
		if (!controlApi) return;

		if (values.pubkey.match(/[0-9a-f]{64}/gi)) {
			await controlApi.addPubkey(values.pubkey);
		} else if (values.pubkey.startsWith('npub1') || values.pubkey.startsWith('nprofile')) {
			const decode = nip19.decode(values.pubkey);
			switch (decode.type) {
				case 'npub':
					await controlApi.addPubkey(decode.data);
					break;
				case 'nprofile':
					await controlApi.addPubkey(decode.data.pubkey);
					break;
			}
		}

		if (onAdd) onAdd();
	});

	return (
		<Flex as="form" onSubmit={submit} gap="4">
			<PubkeyInput {...register('pubkey', { required: true })} isRequired placeholder="fiatjaf" size="sm" />
			<TextButton type="submit" isLoading={formState.isSubmitting} py="2">
				[Add]
			</TextButton>
			<TextButton type="button" onClick={onCancel} py="2">
				[Cancel]
			</TextButton>
		</Flex>
	);
}

export default function ReceiverPanel() {
	const addRelay = useDisclosure();
	const addPubkey = useDisclosure();
	const status = useSubject(controlApi?.receiverStatus);
	const config = useSubject(controlApi?.config);

	const active = status?.active;

	return (
		<Panel label="RECEIVER" gap="2">
			<PanelItemToggle
				label="LISTENER ACTIVE"
				value={active ?? false}
				onChange={() => {
					if (active) controlApi?.send(['CONTROL', 'RECEIVER', 'STOP']);
					else controlApi?.send(['CONTROL', 'RECEIVER', 'START']);
				}}
			/>

			<Box>
				<Flex gap="2" justifyContent="space-between">
					<Text>OWNER</Text>
					<TextButton ml="auto">[change]</TextButton>
				</Flex>
				{config?.owner ? <UserName pubkey={config?.owner} /> : <Text>NOT SET</Text>}
			</Box>
			<Box>
				<Flex gap="2" justifyContent="space-between">
					<Text>PUBKEYS</Text>
					{!addPubkey.isOpen && (
						<TextButton ml="auto" onClick={addPubkey.onOpen} title="Add Relay">
							[add]
						</TextButton>
					)}
				</Flex>
				{config?.pubkeys.map((pubkey) => (
					<Flex key={pubkey} gap="2">
						<UserName as="div" pubkey={pubkey} />
						<TextButton
							title="Remove Pubkey"
							ml="auto"
							onClick={() => confirm(`Remove pubkey?`) && controlApi?.removePubkey(pubkey)}
						>
							[x]
						</TextButton>
					</Flex>
				))}
			</Box>
			{addPubkey.isOpen && <AddPubkeyForm onCancel={addPubkey.onClose} onAdd={addPubkey.onClose} />}

			<Box>
				<Flex gap="2" justifyContent="space-between" mt="2">
					<Text>RELAYS</Text>
					{!addRelay.isOpen && (
						<TextButton ml="auto" onClick={addRelay.onOpen} title="Add Relay">
							[add]
						</TextButton>
					)}
				</Flex>
				{config?.relays.map(({ url }) => (
					<Flex key={url} gap="2">
						<Signal01 boxSize={5} color={status?.relays[url]?.connected ? 'green.500' : 'gray.500'} />
						<Code bg="none" userSelect="all">
							{url}
						</Code>
						<TextButton
							title="Remove Relay"
							ml="auto"
							onClick={() => confirm(`Do you want to remove ${url}`) && controlApi?.removeExplicitRelay(url)}
						>
							[x]
						</TextButton>
					</Flex>
				))}
			</Box>

			{addRelay.isOpen && <AddRelayForm onCancel={addRelay.onClose} onAdd={addRelay.onClose} />}
		</Panel>
	);
}
