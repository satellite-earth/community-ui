import { forwardRef } from 'react';
import { IconProps, useColorMode } from '@chakra-ui/react';

import useDnsIdentity from '../../hooks/use-dns-identity';
import useUserMetadata from '../../hooks/use-user-metadata';
import { VerificationFailed, VerificationMissing, VerifiedIcon } from '../icons';

export function useDnsIdentityColor(pubkey: string) {
	const metadata = useUserMetadata(pubkey);
	const identity = useDnsIdentity(metadata?.nip05);
	const { colorMode } = useColorMode();

	if (!metadata?.nip05) {
		return colorMode === 'light' ? 'gray.200' : 'gray.800';
	}

	if (identity === undefined) {
		return 'yellow.500';
	} else if (identity === null) {
		return 'red.500';
	} else if (pubkey === identity.pubkey) {
		return 'purple.500';
	} else {
		return 'red.500';
	}
}

const UserDnsIdentityIcon = forwardRef<SVGSVGElement, { pubkey: string } & IconProps>(({ pubkey, ...props }, ref) => {
	const metadata = useUserMetadata(pubkey);
	const identity = useDnsIdentity(metadata?.nip05);

	if (!metadata?.nip05) {
		return null;
	}

	if (identity === undefined) {
		return <VerificationFailed color="yellow.500" {...props} ref={ref} />;
	} else if (identity === null) {
		return <VerificationMissing color="red.500" {...props} ref={ref} />;
	} else if (pubkey === identity.pubkey) {
		return <VerifiedIcon color="purple.500" {...props} ref={ref} />;
	} else {
		return <VerificationFailed color="red.500" {...props} ref={ref} />;
	}
});
export default UserDnsIdentityIcon;
