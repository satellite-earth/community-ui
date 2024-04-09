import { useParams } from 'react-router-dom';
import TextChannelView from './text-channel';
// import useReplaceableEvent from '../../hooks/use-replaceable-event';
// import useCurrentCommunity from '../../hooks/use-current-community';

export function ChannelView() {
	const { id } = useParams();
	// const { relay, community } = useCurrentCommunity();
	// const _channel = useReplaceableEvent(
	// 	{ kind: 39000, identifier: id, pubkey: community.pubkey },
	// 	[relay],
	// );

	if (id) return <TextChannelView groupId={id} />;
	return <h1>Cant find group</h1>;
}
