import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Button, Spinner } from "@chakra-ui/react";

import accountService from "../../services/account";
import { safeRelayUrls } from "../../helpers/relay";

export default function LoginStartView() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const signinWithExtension = async () => {
    if (window.nostr) {
      try {
        setLoading(true);

        const pubkey = await window.nostr.getPublicKey();

        if (!accountService.hasAccount(pubkey)) {
          let relays: string[] = [];
          if (relays.length === 0) {
            relays = safeRelayUrls(["wss://relay.damus.io/", "wss://relay.snort.social/", "wss://nostr.wine/"]);
          }

          accountService.addAccount({ pubkey, relays, type: "extension", readonly: false });
        }

        accountService.switchAccount(pubkey);
      } catch (e) {
        // if (e instanceof Error) toast({ description: e.message, status: "error" });
      }
      setLoading(false);
    } else {
      // toast({ status: "warning", title: "Cant find extension" });
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      {window.nostr && (
        <Button onClick={signinWithExtension} w="full">
          Sign in with extension
        </Button>
      )}
      <Button as={RouterLink} to="./nsec" state={location.state} w="full">
        Secret key (nsec)
      </Button>
    </>
  );
}
