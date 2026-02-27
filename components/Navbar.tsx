import { Box } from "lucide-react";
import { useOutletContext } from "react-router";
import Button from "./ui/Button";

export default function Navbar() {
  const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>();
  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (error) {
        console.error(error);
      } finally {
        return;
      }
    }

    try {
      await signIn();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">Roomify</span>
          </div>
          <ul className="links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
          </ul>
        </div>
        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">{userName ? `Hi ${userName}` : "Signed in"}</span>
              <Button size="sm" className="btn" onClick={handleAuthClick}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" className="login" onClick={handleAuthClick}>
                Login
              </Button>
              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
