import { PropsWithChildren } from "react";
import { Center, Flex, Heading } from "@chakra-ui/react";
import ErrorBoundary from "../error-boundary";
import SideNav from "./nav";
import CommunitiesNav from "./communities";
import useSubject from "../../hooks/use-subject";
import clientRelaysService from "../../services/client-relays";

export default function Layout({ children }: PropsWithChildren) {
  const community = useSubject(clientRelaysService.community);

  return (
    <>
      <Flex direction={{ base: "column", md: "row" }} minH="100vh">
        <CommunitiesNav />
        {community ? (
          <>
            <SideNav />
            <Flex direction="column" overflow="hidden" grow={1}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </Flex>
          </>
        ) : (
          <Center flex={1}>
            <Heading>Select Community</Heading>
          </Center>
        )}
      </Flex>
    </>
  );
}
