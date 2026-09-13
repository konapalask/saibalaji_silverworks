import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getRedirectResult, 
  signInWithRedirect, 
  signInWithPopup,
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Terminal, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const MobileAuthBridge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawRedirectUri = searchParams.get('redirect_uri') || 'saibalaji://auth/callback';
  const redirectUri = rawRedirectUri.trim();

  const [status, setStatus] = useState<'initializing' | 'signing_in' | 'exchanging' | 'success' | 'cancelled' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deepLinkTarget, setDeepLinkTarget] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(true); // Defaults open for developer diagnostics
  const [popupLoading, setPopupLoading] = useState<boolean>(false);
  const hasInitiatedRef = useRef(false);

  // Safe developer logger (Never logs ID tokens, JWTs, or sensitive credentials)
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}`;
    console.log('[MobileAuthBridge]', msg);
    setLogs((prev) => [...prev.slice(-30), entry]);
  };

  // Exchange verified Firebase user for backend one-time authorization code
  const completeMobileAuth = async (fbUser: FirebaseUser) => {
    setStatus('exchanging');
    addLog(`Initiating backend code exchange for user: ${fbUser.email || 'no-email'} (UID: ${fbUser.uid})`);
    try {
      const idToken = await fbUser.getIdToken();
      const email = fbUser.email || '';
      const name = fbUser.displayName || (email ? email.split('@')[0] : 'User');
      const photo = fbUser.photoURL || undefined;

      const res = await api.post('/auth/mobile/code', {
        idToken,
        firebase_uid: fbUser.uid,
        email,
        full_name: name,
        photo_url: photo
      });

      const { code } = res.data;
      if (!code) {
        throw new Error('No authorization code returned by Sai Balaji backend.');
      }

      addLog('Authorization code received from backend. Preparing Android deep link redirect.');

      const delimiter = redirectUri.includes('?') ? '&' : '?';
      const targetUrl = `${redirectUri}${delimiter}code=${encodeURIComponent(code)}`;
      setDeepLinkTarget(targetUrl);
      setStatus('success');

      // Dispatch redirect to Android application immediately
      window.location.href = targetUrl;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to authenticate with Sai Balaji backend.';
      addLog(`Backend exchange error: ${errMsg}`);
      setErrorMessage(errMsg);
      setStatus('error');
    }
  };

  const triggerGoogleRedirect = async () => {
    setStatus('signing_in');
    setErrorMessage('');

    // Pre-redirect diagnostics as requested
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    addLog(`auth.app.options.projectId: ${auth.app.options.projectId || 'undefined'}`);
    addLog(`auth.app.options.authDomain: ${auth.app.options.authDomain || 'undefined'}`);
    addLog(`provider type: ${provider.providerId}`);
    addLog(`redirect initiated at: ${new Date().toISOString()}`);

    try {
      sessionStorage.setItem('sbs_mobile_redirect_initiated', 'true');
      await signInWithRedirect(auth, provider);
    } catch (redirectErr: any) {
      sessionStorage.removeItem('sbs_mobile_redirect_initiated');
      addLog(`signInWithRedirect error: ${redirectErr.message || redirectErr}`);
      setStatus('error');
      setErrorMessage(redirectErr.message || 'Unable to open Google account chooser.');
    }
  };

  // Popup-based alternative (Bypasses cross-origin iframe/cookie restrictions)
  const triggerGooglePopup = async () => {
    setPopupLoading(true);
    setErrorMessage('');
    addLog('Manual signInWithPopup started with prompt: select_account');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      addLog(`signInWithPopup completed. User: ${result?.user?.email || 'null'} (UID: ${result?.user?.uid || 'null'})`);
      if (result && result.user) {
        sessionStorage.removeItem('sbs_mobile_redirect_initiated');
        await completeMobileAuth(result.user);
      }
    } catch (popupErr: any) {
      addLog(`signInWithPopup error: ${popupErr.code || popupErr.message}`);
      setErrorMessage(popupErr.message || 'Popup authentication failed.');
      setStatus('error');
    } finally {
      setPopupLoading(false);
    }
  };

  useEffect(() => {
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    let isMounted = true;

    const runAuthFlow = async () => {
      // Diagnostic logging upon mount / return
      const wasRedirectInitiated = sessionStorage.getItem('sbs_mobile_redirect_initiated') === 'true';
      addLog('--- MobileAuthBridge Diagnostic Check ---');
      addLog(`current URL origin: ${window.location.origin}`);
      addLog(`current URL pathname: ${window.location.pathname}`);
      
      const searchParamKeys = Array.from(new URLSearchParams(window.location.search).keys());
      addLog(`current URL search param keys: [${searchParamKeys.join(', ')}]`);
      addLog(`current URL has hash: ${Boolean(window.location.hash)} (length: ${window.location.hash.length})`);
      addLog(`redirect initiated flag in sessionStorage: ${wasRedirectInitiated}`);
      addLog(`auth.app.options.authDomain: ${auth.app.options.authDomain || 'undefined'}`);
      addLog(`auth.app.options.projectId: ${auth.app.options.projectId || 'undefined'}`);

      try {
        // Step 1: Check getRedirectResult(auth)
        addLog('Calling getRedirectResult(auth)...');
        const redirectResult = await getRedirectResult(auth);
        if (!isMounted) return;

        addLog(`getRedirectResult() returned: ${redirectResult ? 'non-null' : 'null'}`);
        addLog(`result.user exists: ${Boolean(redirectResult?.user)}`);

        if (redirectResult && redirectResult.user) {
          addLog(`Firebase UID/email returned from redirectResult: ${redirectResult.user.email} (UID: ${redirectResult.user.uid})`);
          sessionStorage.removeItem('sbs_mobile_redirect_initiated');
          await completeMobileAuth(redirectResult.user);
          return;
        }

        // Step 2: If getRedirectResult was null, check auth.currentUser
        addLog(`auth.currentUser exists/non-existent: ${auth.currentUser ? 'exists' : 'non-existent'}`);
        if (auth.currentUser) {
          addLog(`auth.currentUser email/uid: ${auth.currentUser.email || 'none'} (${auth.currentUser.uid})`);
          if (wasRedirectInitiated) {
            addLog(`Found authenticated user in auth.currentUser after redirect: ${auth.currentUser.email}`);
            sessionStorage.removeItem('sbs_mobile_redirect_initiated');
            await completeMobileAuth(auth.currentUser);
            return;
          }
        }

        // Step 3: If redirect was initiated, monitor onAuthStateChanged
        if (wasRedirectInitiated) {
          addLog('Monitoring onAuthStateChanged listener for deferred user state...');
          let authFired = false;
          const resolvedUser = await new Promise<FirebaseUser | null>((resolve) => {
            const timeout = setTimeout(() => {
              addLog(`onAuthStateChanged wait timed out after 3.5s. (fired: ${authFired})`);
              resolve(null);
            }, 3500);

            const unsubscribe = onAuthStateChanged(auth, (user) => {
              authFired = true;
              addLog(`onAuthStateChanged fired: true, user: ${user ? `${user.email} (${user.uid})` : 'null'}`);
              if (user) {
                clearTimeout(timeout);
                unsubscribe();
                resolve(user);
              }
            });
          });

          if (!isMounted) return;

          if (resolvedUser) {
            addLog(`onAuthStateChanged resolved user: ${resolvedUser.email} (UID: ${resolvedUser.uid})`);
            sessionStorage.removeItem('sbs_mobile_redirect_initiated');
            await completeMobileAuth(resolvedUser);
            return;
          }

          // If no user could be recovered after redirect
          addLog('Diagnosed: getRedirectResult returned null and onAuthStateChanged did not resolve user.');
          sessionStorage.removeItem('sbs_mobile_redirect_initiated');
          setStatus('cancelled');
          return;
        }

        // Step 4: Fresh entry from Android app - Initiate Google Account Selection
        await triggerGoogleRedirect();
      } catch (err: any) {
        if (!isMounted) return;
        sessionStorage.removeItem('sbs_mobile_redirect_initiated');
        addLog(`Redirect processing error: ${err.message || err}`);
        setStatus('error');
        setErrorMessage(err.message || 'Unable to process Google authentication.');
      }
    };

    runAuthFlow();

    return () => {
      isMounted = false;
    };
  }, [redirectUri]);

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-4 sm:p-6 text-[#202020] select-none">
      <div className="w-full max-w-sm bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        
        {/* Brand Header */}
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#B9A77A]">
            Sai Balaji Silverworks
          </p>
          <h1 className="font-serif text-2xl font-bold text-[#202020]">
            Android App Sign-In
          </h1>
        </div>

        {/* Dynamic Status Display */}
        <div className="py-2 flex flex-col items-center justify-center space-y-4">
          {(status === 'initializing' || status === 'signing_in') && (
            <>
              <div className="relative">
                <Loader2 className="w-12 h-12 text-[#B9A77A] animate-spin" />
              </div>
              <p className="text-xs text-[#666666] font-medium animate-pulse">
                {status === 'initializing' ? 'Connecting to Google Account Chooser...' : 'Opening Google Account Chooser...'}
              </p>
            </>
          )}

          {status === 'exchanging' && (
            <>
              <Loader2 className="w-12 h-12 text-[#B9A77A] animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#202020]">
                  Google Account Selected
                </p>
                <p className="text-[11px] text-[#666666]">
                  Generating secure single-use code for Sai Balaji App...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#202020]">
                  Authentication Successful
                </p>
                <p className="text-xs text-[#666666]">
                  Returning to Sai Balaji Android Application...
                </p>
              </div>

              {deepLinkTarget && (
                <div className="pt-3 w-full">
                  <a
                    href={deepLinkTarget}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#202020] hover:bg-[#B9A77A] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    <span>Open Sai Balaji App</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Tap the button above if you are not automatically redirected.
                  </p>
                </div>
              )}
            </>
          )}

          {(status === 'cancelled' || status === 'error') && (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#202020]">
                  {status === 'cancelled' ? 'Account Selection Needed' : 'Authentication Notice'}
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
                    {errorMessage}
                  </p>
                )}
                <p className="text-xs text-[#666666]">
                  Choose an option below to complete Google Sign-In:
                </p>
              </div>

              <div className="pt-2 w-full space-y-2.5">
                {/* Direct Popup Flow (Recommended for cross-origin environments) */}
                <button
                  type="button"
                  onClick={triggerGooglePopup}
                  disabled={popupLoading}
                  className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{popupLoading ? 'Connecting...' : 'Sign In with Google (Direct)'}</span>
                </button>

                {/* Retry Redirect Flow */}
                <button
                  type="button"
                  onClick={triggerGoogleRedirect}
                  className="w-full bg-[#F8F6F1] hover:bg-gray-100 text-[#666666] border border-[#E5E0D8] py-2.5 px-4 rounded-xl text-[11px] font-semibold transition-all"
                >
                  Retry Redirect Flow
                </button>
              </div>
            </>
          )}
        </div>

        {/* Development Diagnostic Log Drawer */}
        <div className="border-t border-[#E5E0D8] pt-3 text-left">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-gray-500 hover:text-gray-700 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#B9A77A]" />
              Diagnostic Logs ({logs.length})
            </span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <div className="mt-2 p-2 bg-gray-900 text-gray-200 rounded-xl text-[10px] font-mono max-h-40 overflow-y-auto space-y-1 select-text">
              {logs.length === 0 ? (
                <p className="text-gray-500 italic">No logs recorded yet.</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="leading-tight break-all">
                    {log}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="pt-1 border-t border-[#E5E0D8]">
          <p className="text-[10px] text-gray-400 tracking-wide uppercase">
            End-to-End Encrypted Session Bridge
          </p>
        </div>

      </div>
    </div>
  );
};

export default MobileAuthBridge;
