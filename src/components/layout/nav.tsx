import { Box, Button, Flex, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import accountService from "../../services/account";
import useCurrentAccount from "../../hooks/use-current-account";
import UserAvatar from "../user/user-avatar";
import UserName from "../user/user-name";

export default function SideNav() {
  const account = useCurrentAccount();

  return (
    <Flex direction="column" gap="2" px="2" py="2" shrink={0} w="xs" borderRightWidth={1}>
      <Box p="4" borderRadius="lg" bg="black">
        <Image src="https://satellite.earth/assets/branding-94b401c7.png" w="full" />
      </Box>
      {account ? (
        <Flex gap="2" alignItems="center">
          <UserAvatar size="sm" pubkey={account.pubkey} />
          <UserName pubkey={account.pubkey} />
          <Button size="sm" onClick={() => accountService.logout()} ml="auto">
            Logout
          </Button>
        </Flex>
      ) : (
        <Button as={RouterLink} to="/login" colorScheme="brand" size="sm">
          Login
        </Button>
      )}
      <Button size="sm" justifyContent="flex-start" variant="ghost">
        General
      </Button>
    </Flex>
  );
}
