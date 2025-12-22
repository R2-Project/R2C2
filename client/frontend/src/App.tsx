import { Router } from "./router/Router";
import { Toaster } from "@/components/ui/toaster";
import { WrapperProviders } from "./global/providers/WrapperProviders";

function App() {
  return (
    <WrapperProviders>
      <Toaster />
      <Router />
    </WrapperProviders>
  );
}

export default App;
