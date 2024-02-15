import { Suspense } from "react";
import ErrorBoundary from "./components/error-boundary";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { ChakraProvider, Heading } from "@chakra-ui/react";

import LoginView from "./views/login";
import LoginStartView from "./views/login/start";
import Layout from "./components/layout";
import LoginNsecView from "./views/login/nsec";
import { theme } from "./theme";

const router = createHashRouter([
  {
    path: "login",
    element: <LoginView />,
    children: [
      { path: "", element: <LoginStartView /> },
      { path: "nsec", element: <LoginNsecView /> },
    ],
  },
  {
    path: "",
    element: (
      <Layout>
        <Heading>Hello World</Heading>
      </Layout>
    ),
  },
]);

const App = () => (
  <ErrorBoundary>
    <ChakraProvider theme={theme}>
      <Suspense fallback={<h1>Loading...</h1>}>
        <RouterProvider router={router} />
      </Suspense>
    </ChakraProvider>
  </ErrorBoundary>
);

export default App;
