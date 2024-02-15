import { PropsWithChildren } from "react";
import { Flex, IconButton, Image } from "@chakra-ui/react";
import ErrorBoundary from "../error-boundary";
import SideNav from "./nav";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <Flex direction={{ base: "column", md: "row" }} minH="100vh">
        <Flex direction="column" gap="4" px="2" py="4" shrink={0} borderRightWidth={1}>
          <IconButton
            aria-label="Satellite Instance"
            icon={<Image borderRadius="lg" src="https://satellite.earth/assets/favicon-a0e2b399.png" w="12" h="12" />}
          />
          <IconButton aria-label="Satellite Instance" icon={<p>+</p>} w="12" h="12" fontSize="24" />
        </Flex>
        <SideNav />
        <Flex direction="column" overflow="hidden" grow={1}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Flex>
      </Flex>
    </>
  );
}
