import App from './App';
import { BarView } from './staff/BarView';
import { FohView } from './staff/FohView';
import { KitchenView } from './staff/KitchenView';
import { OwnerView } from './staff/OwnerView';
import { ManagerGate } from './staff/ManagerGate';

const cleanPath = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

export const RootApp = () => {
  const path = typeof window !== 'undefined' ? cleanPath(window.location.pathname) : '/';

  if (path === '/kitchen') return <KitchenView />;
  if (path === '/bar') return <BarView />;
  if (path === '/foh') return <FohView />;
  if (path === '/manager') {
    return (
      <ManagerGate>
        <OwnerView />
      </ManagerGate>
    );
  }
  if (path === '/owner') {
    return (
      <ManagerGate>
        <OwnerView />
      </ManagerGate>
    );
  }
  return <App />;
};
