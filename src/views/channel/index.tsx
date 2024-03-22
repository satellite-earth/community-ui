import { useParams } from 'react-router-dom';
import TextChannelView from './text-channel';

export function ChannelView() {
	const { id } = useParams();
	// TODO: load channel metadata

	if (id) return <TextChannelView groupId={id} />;
	return <h1>Cant find group</h1>;
}
