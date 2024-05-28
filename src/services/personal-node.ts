import { logger } from '../helpers/debug';
import PersonalNode from '../classes/personal-node';
import PersonalNodeControlApi from '../classes/control-api';

const log = logger.extend('private-node');

export function setPrivateNodeURL(url: string) {
	localStorage.setItem('private-node-url', url);
	location.reload();
}
export function resetPrivateNodeURL() {
	localStorage.removeItem('private-node-url');
	location.reload();
}

let personalNode: PersonalNode | null = null;

if (window.satellite) {
	log('Using URL from window.satellite');
	personalNode = new PersonalNode(await window.satellite.getLocalRelay());
} else if (localStorage.getItem('private-node-url')) {
	log('Using URL from localStorage');
	personalNode = new PersonalNode(localStorage.getItem('private-node-url')!);
} else {
	log('Unable to find private node URL');
}

personalNode?.connect().then(() => {
	// automatically authenticate with auth
	if (window.satellite) {
		window.satellite.getAdminAuth().then((auth) => personalNode.authenticate(auth));
	}
});

const controlApi = personalNode ? new PersonalNodeControlApi(personalNode) : undefined;

if (import.meta.env.DEV) {
	// @ts-expect-error
	window.privateNode = personalNode;
	// @ts-expect-error
	window.controlApi = controlApi;
}

export { controlApi };
export default personalNode;
