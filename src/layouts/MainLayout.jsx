import Header from "../components/Header/Header";
import FloatingCallButton from "../components/FloatingCallButton/FloatingCallButton";
import FloatingOrderButton from "../components/FloatingOrderButton/FloatingOrderButton";

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />

      <main>{children}</main>

      <FloatingCallButton />
      <FloatingOrderButton />
    </>
  );
};

export default MainLayout;