import { Flex, FlexProps, Heading, IconButton } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ChevronLeft from './icons/components/chevron-left';

export default function SimpleHeader({ children, title, ...props }: FlexProps) {
	return (
		<Flex p="2" borderBottom="1px solid var(--chakra-colors-chakra-border-color)" alignItems="center" gap="2">
			<IconButton
				as={RouterLink}
				icon={<ChevronLeft boxSize={6} />}
				aria-label="Back"
				hideFrom="md"
				variant="ghost"
				to="/"
			/>
			<Heading fontWeight="bold" size="md" ml={{ base: 0, md: '2' }}>
				{title}
			</Heading>
			{children}
		</Flex>
	);
}
