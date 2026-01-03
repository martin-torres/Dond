import { createRoot } from 'react-dom/client';
import { StaffDataProvider } from './staff/StaffDataProvider';
import { RootApp } from './RootApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StaffDataProvider>
    <RootApp />
  </StaffDataProvider>
);
