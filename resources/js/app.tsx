import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/context/auth-context';
import { AppRoutes } from '@/routes';

const root = document.getElementById('app');

if (root) {
    createRoot(root).render(
        <StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </StrictMode>,
    );
}
