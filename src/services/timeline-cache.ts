import TimelineLoader from '../classes/timeline-loader';
import { logger } from '../helpers/debug';

const MAX_CACHE = 30;

class TimelineCacheService {
	private timelines = new Map<string, TimelineLoader>();
	private cacheQueue: string[] = [];
	private log = logger.extend('TimelineCacheService');

	createTimeline(key: string) {
		let timeline = this.timelines.get(key);
		if (!timeline) {
			this.log(`Creating ${key}`);
			timeline = new TimelineLoader(key);
			this.timelines.set(key, timeline);
		}

		// add or move the timelines key to the top of the queue
		this.cacheQueue = this.cacheQueue.filter((p) => p !== key).concat(key);

		// remove any timelines at the end of the queue
		while (this.cacheQueue.length > MAX_CACHE) {
			const deleteKey = this.cacheQueue.shift();
			if (!deleteKey) break;
			const deadTimeline = this.timelines.get(deleteKey);
			if (deadTimeline) {
				this.log(`Destroying ${deadTimeline.name}`);
				this.timelines.delete(deleteKey);
				deadTimeline.destroy();
			}
		}

		return timeline;
	}

	clear() {
		this.log('Cleared');
		this.timelines.clear();
		this.cacheQueue = [];
	}
}

const timelineCacheService = new TimelineCacheService();

if (import.meta.env.DEV) {
	//@ts-ignore
	window.timelineCacheService = timelineCacheService;
}

export default timelineCacheService;
