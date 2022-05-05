import {
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  ApolloClient,
} from "@apollo/client";
import { setContext } from "apollo-link-context";
import "../styles/globals.css";

const httpLink = createHttpLink({
  uri: "http://localhost:8080",
});

const authLink = setContext(() => {
  const token = localStorage.getItem("jwtToken");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
