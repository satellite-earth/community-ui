import Identity from './identity';

export default function DesktopUI() {
	switch (window.location.hash.slice(1).split(':')[1]) {
		case 'identity':
			return <Identity />;

		// case 'launcher':
		// case 'permission'

		default:
			return null;
	}
}
