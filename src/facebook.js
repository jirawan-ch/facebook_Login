
let ready = null;

export function loadFacebookSDK_XFBML(appId, version = 'v23.0') {
  if (ready) return ready;
  ready = new Promise((resolve, reject) => {
    if (!appId) return reject(new Error('Missing FB App ID'));

    const id = 'facebook-jssdk';
    if (!document.getElementById(id)) {
      const js = document.createElement('script');
      js.id = id;
      js.async = true;
      js.defer = true;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.onload = () => {
        window.FB.init({ appId, cookie: true, xfbml: true, version });
        resolve();
      };
      js.onerror = () => reject(new Error('Failed to load Facebook SDK'));
      document.head.appendChild(js);
    } else {
      const wait = setInterval(() => {
        if (window.FB && window.FB.init) {
          clearInterval(wait);
          window.FB.init({ appId, cookie: true, xfbml: true, version });
          resolve();
          
        }
      }, 20);
      setTimeout(() => { clearInterval(wait); reject(new Error('FB SDK init timeout')); }, 10000);
    }
  });
  return ready;
}

async function ensureReady() {
  if (!ready) throw new Error('Call loadFacebookSDK_XFBML() first');
  await ready;
}

export async function getLoginStatus() {
  await ensureReady();
  return new Promise((r) => window.FB.getLoginStatus((res) => r(res)));
}

export async function getMe(fields = 'id,name,email,picture') {
  await ensureReady();
  return new Promise((resolve, reject) => {
    window.FB.api('/me', { fields }, (res) => res?.error ? reject(res.error) : resolve(res));
  });
}

export async function fbLogout() {
  await ensureReady();
  return new Promise((r) => window.FB.logout(() => r()));
}
