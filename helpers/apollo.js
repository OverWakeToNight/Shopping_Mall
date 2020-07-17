import React from 'react';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-unfetch';
let ApolloClient = null;

export function withApollo(PageComponent, { ssr = true } = {}) {
  const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
    const client = apolloClient || initApolloClient(apolloState);
    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    );
  };

  //Hàm kiểm tra tên có đúng không trong quá trình kết nối
  if (process.env.NODE_ENV !== "production") {
    const displayName =
      PageComponent.displayName || PageComponent.name || "Component";
  }
  if (displayName === "App") {
  }
  WithApollo.displayName = `withApllo (${displayName})`;
  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx) => {
      const { AppTree } = ctx;
      //Hàm khởi tạo giá trị mặc định ,thêm biến ctx vào
      //Có thể dùng chúng trong `PageComponent.getInitialProp`
      const apolloClient = (ctx.apolloClient = initApolloClient());

      //Chạy hàm lấy giá trị mặc định
      let pageComponent = {};
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx);
      }

      if (typeof window === "undefined") {
        if (ctx.res && ctx.res.finished) {
          return pageProps;
        }
        if (ssr) {
          try {
            const { getDataFromTree } = await import("@apollo/react-ssr");
              await getDataFromTree(
                  <AppTree
                      pageProps={
                          ...pageProps,
                    apolloClient}
                  />
              );
          } catch (error) {
          }
        }
      }
        const apolloState = apolloClient.cache.extract();

        return {
            ...pageProps,
            apolloState,
        };
    };
  }
    return WithApollo;
}

function initApolloClient(initialState)
{
    if (typeof window !== 'undefined')
    {
        return createApolloClient(initialState);
    }
    if (!apolloClient) {
        apolloClient = createApolloClient(initialState);
    }
    return apolloClient;
}

function createApolloClient(initialState = {}) {
    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link: new HttpLink({
            uri: process.env.API_URL,
            credentials: 'same-origin',
            fetch,
        }),
        cache: new InMemoryCache().restore(initialState),
    });
}