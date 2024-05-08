import { useBreakpointValue } from '@chakra-ui/react';

import MobileLayout from './mobile';
import DesktopLayout from './desktop';

export default function AppLayout() {
	const mobile = useBreakpointValue({ base: true, md: false });

	if (mobile) return <MobileLayout />;
	else return <DesktopLayout />;
}
