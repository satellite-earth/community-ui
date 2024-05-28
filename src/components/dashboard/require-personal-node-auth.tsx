import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import personalNode from '../../services/personal-node';
import useSubject from '../../hooks/use-subject';

export default function RequirePersonalNodeAuth({ children }: PropsWithChildren) {
	const auth = useSubject(personalNode?.authenticated);

	if (!personalNode) return <Navigate to="/connect" replace />;
	if (!auth) return <Navigate to="/dashboard/auth" replace />;
	return children;
}
