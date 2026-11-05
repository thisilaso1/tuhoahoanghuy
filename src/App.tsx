import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { DaoSiDonate } from './components/views/DaoSiDonate';
import { Footer } from './components/layout/Footer';
import { ChartCreationView } from './components/views/ChartCreationView';
import { LandingView } from './components/views/LandingView';
import { MenhBanView } from './components/views/MenhBanView';
import { ThienCoView } from './components/views/ThienCoView';
import { TuHoaView } from './components/views/TuHoaView';
import { KinhDichView } from './components/views/KinhDichView';
import { VanHanView } from './components/views/VanHanView';
import { ThuCacView } from './components/views/ThuCacView';
import { HoSoView } from './components/views/HoSoView';
import { CaiDatView } from './components/views/CaiDatView';

const MainRouter: React.FC = () => {
  const { currentRoute } = useApp();

  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/':
        return <LandingView />;
      case '/la-so':
        return <ChartCreationView />;
      case '/menh-ban':
        return <MenhBanView />;
      case '/thien-co':
        return <ThienCoView />;
      case '/tu-hoa':
        return <TuHoaView />;
      case '/kinh-dich':
        return <KinhDichView />;
      case '/van-han':
        return <VanHanView />;
      case '/thu-cac':
        return <ThuCacView />;
      case '/ho-so':
        return <HoSoView />;
      case '/cai-dat':
        return <CaiDatView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-stone-200">
      <Header />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <Footer />
      <DaoSiDonate />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}

export default App;
