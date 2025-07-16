import { Header } from "./components/Header"
import { MainRoutes } from "./routes/MainRoutes";
import { Footer } from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";


function App() {


  return (
    <>
    <ScrollToTop />
    <div className="max-w-screen min-h-screen flex flex-col overflow-hidden relative">
      <Header />
      <main className="flex-grow mb-20">
        <MainRoutes />
      </main>
      <Footer />
    </div>
    </>
  );
};

export default App
