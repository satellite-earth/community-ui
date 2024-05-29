import { PropsWithChildren } from 'react';
import { Navigate, To, useLocation } from 'react-router-dom';

import personalNode from '../../services/personal-node';
import useSubject from '../../hooks/use-subject';

export default function RequirePersonalNodeAuth({ children }: PropsWithChildren) {
	const auth = useSubject(personalNode?.authenticated);
	const location = useLocation();

	if (!personalNode)
		return <Navigate to="/connect" replace state={{ back: (location.state?.back ?? location) satisfies To }} />;
	if (!auth)
		return <Navigate to="/connect/auth" replace state={{ back: (location.state?.back ?? location) satisfies To }} />;
	return children;
}
