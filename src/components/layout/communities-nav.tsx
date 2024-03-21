import {
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorMode,
} from "@chakra-ui/react";
import useLocalStorage from "react-use/esm/useLocalStorage";
import { safeRelayUrl } from "../../helpers/relay";
import { useRelayInfo } from "../../hooks/use-relay-info";
import { RelayFavicon } from "../relay-favicon";
import clientRelaysService from "../../services/client-relays";
import useSubject from "../../hooks/use-subject";
import timelineCacheService from "../../services/timeline-cache";
import UserAvatar from "../user/user-avatar";
import useCurrentAccount from "../../hooks/use-current-account";
import accountService from "../../services/account";
import UserName from "../user/user-name";
import UserDnsIdentity from "../user/user-dns-identity";
import Compass01 from "../icons/components/compass-01";
import Moon01 from "../icons/components/moon-01";
import Sun from "../icons/components/sun";

function CommunityButton({ relay }: { relay: string }) {
  const { info } = useRelayInfo(relay);
  const community = useSubject(clientRelaysService.community);

  const select = () => {
    timelineCacheService.clear();
    clientRelaysService.community.next(relay);
  };

  return (
    <IconButton
      aria-label={info?.name || "Community"}
      title={info?.name}
      icon={<RelayFavicon borderRadius="lg" relay={relay} w="10" h="10" />}
      onClick={select}
      h="12"
      w="12"
      colorScheme={relay === community ? "brand" : undefined}
      variant="outline"
    />
  );
}

function UserAccount() {
  const account = useCurrentAccount()!;

  return (
    <Menu placement="right" offset={[32, 16]}>
      <MenuButton
        as={IconButton}
        variant="outline"
        w="12"
        h="12"
        borderRadius="50%"
        icon={<UserAvatar pubkey={account.pubkey} />}
      />
      <MenuList boxShadow="lg">
        <Flex gap="2" px="2" alignItems="center">
          <UserAvatar pubkey={account.pubkey} />
          <Flex direction="column">
            <UserName pubkey={account.pubkey} fontSize="xl" />
            <UserDnsIdentity pubkey={account.pubkey} />
          </Flex>
        </Flex>
        <MenuDivider />
        <MenuItem onClick={() => accountService.logout()}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
}

export default function CommunitiesNav() {
  const account = useCurrentAccount();
  const { colorMode, toggleColorMode } = useColorMode();
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
    <Flex direction="column" gap="2" px="2" py="2" shrink={0} borderRightWidth={1}>
      {account && (
        <>
          <UserAccount />
          <Divider />
        </>
      )}
      {communities.map((url) => (
        <CommunityButton key={url} relay={url} />
      ))}
      <IconButton
        aria-label="Explore"
        title="Explore"
        icon={<Compass01 boxSize={7} />}
        w="12"
        h="12"
        fontSize="24"
        onClick={manuallyAdd}
      />
      <IconButton
        w="12"
        h="12"
        aria-label="Color Mode"
        title="Color Mode"
        onClick={toggleColorMode}
        mt="auto"
        icon={colorMode === "light" ? <Moon01 boxSize={6} /> : <Sun boxSize={6} />}
      />
    </Flex>
  );
}
