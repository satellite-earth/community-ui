import { Avatar, Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import accountService from "../../services/account";
import useCurrentAccount from "../../hooks/use-current-account";

export default function SideNav() {
  const account = useCurrentAccount();

  return (
    <Flex direction="column" gap="2" px="2" py="2" shrink={0} w="xs" borderRightWidth={1}>
      <Box p="4" borderRadius="lg" bg="black">
        <Image src="https://satellite.earth/assets/branding-94b401c7.png" w="full" />
      </Box>
      {account ? (
        <Flex gap="2" alignItems="center">
          <Avatar size="sm" />
          <Text fontWeight="bold">{account.pubkey.slice(0, 8)}</Text>
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
