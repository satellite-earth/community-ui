import { logger } from '../helpers/debug';
import PrivateNode from '../classes/private-node';
import PrivateNodeControlApi from '../classes/control-api';

const log = logger.extend('private-node');

export function setPrivateNodeURL(url: string) {
	localStorage.setItem('private-node-url', url);
	location.reload();
}
export function resetPrivateNodeURL() {
	localStorage.removeItem('private-node-url');
	location.reload();
}

let privateNode: PrivateNode | null = null;

if (window.satellite) {
	log('Using URL from window.satellite');
	privateNode = new PrivateNode(await window.satellite.getLocalRelay());
} else if (localStorage.getItem('private-node-url')) {
	log('Using URL from localStorage');
	privateNode = new PrivateNode(localStorage.getItem('private-node-url')!);
} else {
	log('Unable to find private node URL');
}

privateNode?.connect().then(() => {
	// automatically authenticate with auth
	if (window.satellite) {
		window.satellite.getAdminAuth().then((auth) => privateNode.authenticate(auth));
	}
});

const controlApi = privateNode ? new PrivateNodeControlApi(privateNode) : undefined;

if (import.meta.env.DEV) {
	// @ts-expect-error
	window.privateNode = privateNode;
	// @ts-expect-error
	window.controlApi = controlApi;
}

export { controlApi };
export default privateNode;
