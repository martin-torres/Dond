import App from './App';
import { BarView } from './staff/BarView';
import { FohView } from './staff/FohView';
import { KitchenView } from './staff/KitchenView';
import { OwnerView } from './staff/OwnerView';
import { ManagerEditConsole } from './staff/ManagerEditConsole';
import { ManagerGate } from './staff/ManagerGate';
import { StaffBillPage } from './components/StaffBillPage';
import { StaffDataProvider } from './staff/StaffDataProvider';


const cleanPath = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

export const RootApp = () => {
  const path = typeof window !== 'undefined' ? cleanPath(window.location.pathname) : '/';

  let content: JSX.Element;

  if (path === '/kitchen') {
    content = <KitchenView />;
  } else if (path === '/bar') {
    content = <BarView />;
  } else if (path === '/foh') {
    content = <FohView />;
  } else if (path.startsWith('/staff/bill')) {
    const tableId = path.split('/')[3] || '';
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId') || undefined;
    content = (
      <StaffBillPage
        tableId={tableId}
        orderId={orderId}
        onBackToFOH={() => {
          window.location.pathname = '/foh';
        }}
      />
    );
  } else if (path === '/manager/edit') {
    content = (
      <ManagerGate>
        <ManagerEditConsole />
      </ManagerGate>
    );
  } else if (path === '/manager') {
    content = (
      <ManagerGate>
        <OwnerView />
      </ManagerGate>
    );
  } else if (path === '/owner') {
    content = (
      <ManagerGate>
        <OwnerView />
      </ManagerGate>
    );
  } else {
    content = <App />;
  }

  return <StaffDataProvider>{content}</StaffDataProvider>;
};
