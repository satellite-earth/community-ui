import {
	Button,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	ModalProps,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

export default function CreateGroupModal({
	isOpen,
	onClose,
	...props
}: Omit<ModalProps, 'children'>) {
	const { handleSubmit, register, formState } = useForm({
		defaultValues: { name: '' },
	});

	const submit = handleSubmit((_values) => {});

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg" {...props}>
			<ModalOverlay />
			<ModalContent as="form" onSubmit={submit}>
				<ModalHeader>Create New Group</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<FormControl>
						<FormLabel>Group Name</FormLabel>
						<Input
							{...register('name', { required: true })}
							isRequired
							placeholder="New Group"
						/>
						<FormHelperText>
							The name of the group that your about to create
						</FormHelperText>
					</FormControl>
				</ModalBody>
				<ModalFooter gap="2" display="flex">
					<Button onClick={onClose}>Cancel</Button>
					<Button
						type="submit"
						colorScheme="brand"
						isLoading={formState.isLoading}
						isDisabled={formState.isValid}
					>
						Create Group
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
