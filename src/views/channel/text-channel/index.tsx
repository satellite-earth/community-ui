import { Box, Flex, Heading } from "@chakra-ui/react";
import { COMMUNITY_CHAT_MESSAGE } from "../../../helpers/nostr/kinds";
import SendMessageForm from "./send-message-form";
import useTimelineLoader from "../../../hooks/use-timeline-loader";
import clientRelaysService from "../../../services/client-relays";
import useSubject from "../../../hooks/use-subject";
import UserName from "../../../components/user/user-name";
import UserAvatar from "../../../components/user/user-avatar";

export default function TextChannelView({ groupId }: { groupId: string }) {
  const relay = useSubject(clientRelaysService.community);
  const timeline = useTimelineLoader(`${groupId}-messages`, relay, [
    { kinds: [COMMUNITY_CHAT_MESSAGE], "#h": [groupId] },
  ]);

  const messages = useSubject(timeline.timeline);

  return (
    <Flex direction="column" overflow="hidden" flex={1}>
      <Flex p="4" borderBottom="1px solid var(--chakra-colors-chakra-border-color)">
        <Heading fontWeight="bold" size="md">
          {groupId}
        </Heading>
      </Flex>
      <Flex overflowX="hidden" overflowY="auto" flex={1} direction="column-reverse" p="2" gap="2">
        {messages.map((message) => (
          <Box key={message.id}>
            <UserAvatar pubkey={message.pubkey} size="sm" verticalAlign="middle" />
            <UserName pubkey={message.pubkey} />: {message.content}
          </Box>
        ))}
      </Flex>
      <SendMessageForm groupId={groupId} />
    </Flex>
  );
}
