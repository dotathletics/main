import { transformer, trpc } from '@explorers-club/api-client';
import { noop } from '@explorers-club/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, wsLink } from '@trpc/client';
import { FC, ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { ServicesProvider } from '../services';
import { WorldProvider } from '../state/world.context';
import { AppComponent } from './app.component';

type WsClient = ReturnType<typeof createWSClient>;

export const App = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const wsClient$ = new Subject<{ type: 'OPEN'; wsClient: WsClient }>();
  const wsClient = createWSClient({
    url: `ws://localhost:3001`,
    onOpen() {
      wsClient$.next({ type: 'OPEN', wsClient });
    },
  });

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer,
      links: [
        wsLink({
          client: wsClient,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <WorldProvider>
            <ServicesProvider>
              <AppComponent />
            </ServicesProvider>
          </WorldProvider>
        </SessionProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

const SessionProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { client } = trpc.useContext();

  useLayoutEffect(() => {
    let timer: NodeJS.Timeout;
    // todo use encrypted storage
    const refreshToken = localStorage.getItem('refreshToken') || undefined;
    const accessToken = localStorage.getItem('accessToken') || undefined;

    const authTokens =
      refreshToken && accessToken ? { refreshToken, accessToken } : undefined;

    client.connection.initialize
      .mutate({ authTokens, initialLocation: window.location.href })
      .then((data) => {
        localStorage.setItem('refreshToken', data.session.refresh_token);
        localStorage.setItem('accessToken', data.session.access_token);

        window.addEventListener('popstate', () => {
          client.session.navigate.mutate({ location: window.location.href });
        });

        timer = setInterval(() => {
          client.session.heartbeat.mutate().then(noop);
        }, 100);
      });
    return () => {
      clearInterval(timer);
    };
  }, [client]);

  return <>{children}</>;
};
