import { PropsWithChildren } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { Navigate, To, useLocation } from 'react-router-dom';

import personalNode from '../../services/personal-node';
import ConnectionStatus from '../layout/connection-status';
import useSubject from '../../hooks/use-subject';

export default function RequirePersonalNode({
	children,
	requireConnection,
}: PropsWithChildren & { requireConnection?: boolean }) {
	const location = useLocation();
	const connected = useSubject(personalNode?.connectedSub);

	if (!personalNode)
		return <Navigate to="/connect" replace state={{ back: (location.state?.back ?? location) satisfies To }} />;

	if (requireConnection && connected === false)
		return (
			<>
				<ConnectionStatus />
				<Flex w="full" h="full" alignItems="center" justifyContent="center">
					<Heading size="md">Loading...</Heading>
				</Flex>
			</>
		);

	return <>{children}</>;
}
