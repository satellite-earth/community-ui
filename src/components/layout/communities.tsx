import { Flex, IconButton } from "@chakra-ui/react";
import { safeRelayUrl } from "../../helpers/relay";
import useLocalStorage from "react-use/esm/useLocalStorage";
import { useRelayInfo } from "../../hooks/use-relay-info";
import { RelayFavicon } from "../relay-favicon";
import clientRelaysService from "../../services/client-relays";

function CommunityButton({ relay }: { relay: string }) {
  const { info } = useRelayInfo(relay);

  const select = () => {
    clientRelaysService.community.next(relay);
  };

  return (
    <IconButton
      aria-label={info?.name || "Community"}
      title={info?.name}
      icon={<RelayFavicon borderRadius="lg" relay={relay} w="12" h="12" />}
      onClick={select}
    />
  );
}

export default function CommunitiesNav() {
  const [communities = [], setCommunities] = useLocalStorage<string[]>("communities", []);

  const manuallyAdd = () => {
    let url = prompt("Relay URL");
    if (!url) return;
    let safeUrl = safeRelayUrl(url);
    if (safeUrl) {
      setCommunities([...communities, safeUrl]);
    }
  };

  return (
    <Flex direction="column" gap="4" px="2" py="4" shrink={0} borderRightWidth={1}>
      {communities.map((url) => (
        <CommunityButton key={url} relay={url} />
      ))}
      <IconButton
        aria-label="Explore"
        title="Explore"
        icon={<p>+</p>}
        w="12"
        h="12"
        fontSize="24"
        onClick={manuallyAdd}
      />
    </Flex>
  );
}
