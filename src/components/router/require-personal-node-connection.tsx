import { PropsWithChildren } from 'react';
import { Navigate, To, useLocation } from 'react-router-dom';

import personalNode from '../../services/personal-node';

export default function RequirePrivateNodeConnection({ children }: PropsWithChildren) {
	const location = useLocation();

	if (!personalNode)
		return <Navigate to="/connect" replace state={{ back: (location.state?.back ?? location) satisfies To }} />;

	return <>{children}</>;
}
