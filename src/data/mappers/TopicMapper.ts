import { createTopic, type Topic, type TopicPayload } from '../../domain/entities/Topic';

export interface TopicEntry extends TopicPayload {
  readonly topic?: TopicPayload;
}

export const toTopic = (entry: TopicEntry): Topic => createTopic(entry.topic ?? entry);

export const toTopicList = (rows: readonly TopicEntry[]): readonly Topic[] => rows.map(toTopic);
