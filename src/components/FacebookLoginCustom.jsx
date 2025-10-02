import { useEffect, useState } from 'react';
import { loadFacebookSDK_XFBML, getLoginStatus, getMe, fbLogout } from '../facebook';

const APP_ID = import.meta.env.VITE_FB_APP_ID;
const API_VERSION = import.meta.env.VITE_FB_API_VERSION || 'v23.0';

export default function FacebookBasicXfbml() {
  const [status, setStatus] = useState('unknown');
  const [msg, setMsg] = useState('Loading…');
  const [profile, setProfile] = useState(null);
  const [authInfo, setAuthInfo] = useState(null);   

  const statusChangeCallback = async (response) => {
    const s = response?.status || 'unknown';
    setStatus(s);

    if (s === 'connected') {

      setAuthInfo(response.authResponse || null);

      setMsg('Welcome! Fetching your information…');
      try {
        const me = await getMe('id,name,email,picture.width(200).height(200)');
        setProfile(me);
        setMsg(`Thanks for logging in, ${me.name}!`);
      } catch {
        setProfile(null);
        setMsg('Failed to fetch profile.');
      }
    } else {
      setProfile(null);
      setAuthInfo(null);   
      setMsg('Please log into this webpage.');
    }
  };

  const attachGlobal = () => {
    window.checkLoginState = async function () {
      const r = await getLoginStatus();
      await statusChangeCallback(r);
    };
  };

  useEffect(() => {
    (async () => {
      attachGlobal();
      await loadFacebookSDK_XFBML(APP_ID, API_VERSION);
      const r = await getLoginStatus();
      await statusChangeCallback(r);

      if (window.FB?.XFBML) {
        window.FB.XFBML.parse(document.getElementById('xfbml-box'));
      }
    })().catch((e) => {
      console.error(e);
      setMsg('Failed to initialize Facebook SDK.');
    });
  }, []);

  return (
    <div
      id="xfbml-box"
      style={{ maxWidth: 520, margin: '2rem auto', padding: 20, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.08)' }}
    >
      <p id="status">{msg}</p>

      <div
        className="fb-login-button"
        data-width=""
        data-size="large"
        data-button-type="continue_with"
        data-layout="default"
        data-auto-logout-link="false"
        data-use-continue-as="true"
        data-scope="public_profile,email"
        data-onlogin="checkLoginState();"
      ></div>


      {profile && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
          {profile?.picture?.data?.url && (
            <img src={profile.picture.data.url} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%' }} />
          )}
          <div>
            <div><b>Name:</b> {profile.name}</div>
            <div><b>Email:</b> {profile.email || '—'}</div>
          </div>
        </div>
      )}

      {authInfo && (
        <div style={{ marginTop: 12, fontSize: 12, background: '#f7f7f7', padding: 10, borderRadius: 8 }}>
          <div><b>User ID:</b> {authInfo.userID}</div>
          <div>
            <b>Access Token:</b>
            <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 12 }}>
              {authInfo.accessToken.match(/.{1,50}/g).map((chunk, i) => (
                <div key={i}>{chunk}</div>
              ))}
            </div>
          </div>
          {/* <div><b>Access Token:</b> {authInfo.accessToken}</div> */}
          <div><b>Expires In:</b> {authInfo.expiresIn}</div>
          <div>
            <b>Signed Request:</b>
            <div style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 12 }}>
              {authInfo.signedRequest.match(/.{1,50}/g).map((chunk, i) => (
                <div key={i}>{chunk}</div>
              ))}
            </div>
          </div>
          {/* <div><b>Signed Request:</b> {authInfo.signedRequest}</div> */}
          {/* <div><b>Signed Request:</b> {authInfo.signedRequest?.slice(0, 20)}</div> */}
        </div>
      )}


      {status === 'connected' && (
        <button
          onClick={async () => {
            await fbLogout();
            const r = await getLoginStatus();
            await statusChangeCallback(r);
          }}
          style={{ marginTop: 12, padding: '8px 14px', borderRadius: 10, backgroundColor:"red", color:"white" }}
        >
          Logout
        </button>
      )}
    </div>
  );
}
