import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import privateNode from '../../services/private-node';
import useSubject from '../../hooks/use-subject';

export default function RequirePrivateNodeAuth({ children }: PropsWithChildren) {
	const auth = useSubject(privateNode?.authenticated);

	if (!privateNode) return <Navigate to="/connect" replace />;
	if (!auth) return <Navigate to="/dashboard/auth" replace />;
	return children;
}
