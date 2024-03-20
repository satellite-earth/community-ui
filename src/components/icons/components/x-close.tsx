import { createIcon } from "@chakra-ui/icons";

const XClose = createIcon({
  displayName: "XClose",
  viewBox: "0 0 24 24",
  path: [
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    ></path>,
  ],
  defaultProps: { boxSize: 4 },
});

export default XClose;
