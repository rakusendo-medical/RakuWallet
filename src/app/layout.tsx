import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import ThemeRegistry from '@/components/ThemeRegistry';
import Sidebar, { DRAWER_WIDTH } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'RakuWallet - 入院患者お小遣い管理',
  description: '入院患者様のお小遣いを安全に管理するシステム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeRegistry>
          <Box sx={{ display: 'flex' }}>
            <AppBar
              position="fixed"
              sx={{
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
                left: `${DRAWER_WIDTH}px`,
              }}
            >
              <Toolbar>
                <Typography variant="h6" noWrap component="div">
                  RakuWallet
                </Typography>
              </Toolbar>
            </AppBar>
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
              }}
            >
              <Toolbar />
              {children}
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
