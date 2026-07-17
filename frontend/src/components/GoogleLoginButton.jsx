import { useEffect, useRef, useState } from "react";
import { apiPost } from "../api/client.js";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "39244401461-l7mo1bar9s6o00j0g7ud3q6gm1t09i1j.apps.googleusercontent.com";

function readGoogleProfile(idToken) {
  const payload = idToken.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  const profile = JSON.parse(decodeURIComponent(
    Array.from(json)
      .map((char) => "%" + char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  ));

  return {
    id: profile.sub,
    name: profile.name || profile.email,
    email: profile.email,
    picture: profile.picture,
  };
}

export default function GoogleLoginButton({ onLogin }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    function initGoogle() {
      if (!GOOGLE_CLIENT_ID) {
        setError("Google Client ID is missing.");
        return;
      }

      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 360,
        text: "signin_with",
      });
    }

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      script.onerror = () => setError("Google sign-in could not load.");
      document.body.appendChild(script);
    }
  }, []);

  async function handleCredentialResponse(response) {
    try {
      const data = await apiPost("/auth/google", { idToken: response.credential });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      console.warn("Backend Google auth failed, using Google profile directly:", err);
      try {
        const user = readGoogleProfile(response.credential);
        localStorage.setItem("user", JSON.stringify(user));
        onLogin(user);
      } catch {
        setError("Login failed, please try again.");
      }
    }
  }

  return (
    <div className="login-actions">
      <div ref={buttonRef}></div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
