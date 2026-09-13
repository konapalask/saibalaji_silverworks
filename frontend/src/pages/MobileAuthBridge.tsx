import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getRedirectResult, 
  signInWithRedirect, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

export const MobileAuthBridge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawRedirectUri = searchParams.get('redirect_uri') || 'saibalaji://auth/callback';
  const redirectUri = rawRedirectUri.trim();

  const [status, setStatus] = useState<'initializing' | 'signing_in' | 'exchanging' | 'success' | 'cancelled' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deepLinkTarget, setDeepLinkTarget] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const hasInitiatedRef = useRef(false);

  // Safe developer logger (Never logs ID tokens, JWTs, or sensitive credentials)
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}`;
    console.log('[MobileAuthBridge]', msg);
    setLogs((prev) => [...prev.slice(-25), entry]);
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

      addLog('Authorization code received from backend. Redirecting to Android deep link.');

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
    addLog('signInWithRedirect started with prompt: select_account');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      sessionStorage.setItem('sbs_mobile_redirect_initiated', 'true');
      await signInWithRedirect(auth, provider);
    } catch (redirectErr: any) {
      sessionStorage.removeItem('sbs_mobile_redirect_initiated');
      addLog(`signInWithRedirect error: ${redirectErr.message || redirectErr}`);
      setStatus('error');
      setErrorMessage(redirectErr.message || 'Unable to open Google account chooser.');
    }
  };

  useEffect(() => {
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    let isMounted = true;

    const runAuthFlow = async () => {
      addLog('MobileAuthBridge mounted. Checking redirect state...');
      const wasRedirectInitiated = sessionStorage.getItem('sbs_mobile_redirect_initiated') === 'true';
      addLog(`Redirect returned status (was initiated): ${wasRedirectInitiated}`);

      try {
        // Step 1: Check getRedirectResult(auth)
        addLog('Calling getRedirectResult(auth)...');
        const redirectResult = await getRedirectResult(auth);
        if (!isMounted) return;

        addLog(`getRedirectResult result exists: ${Boolean(redirectResult)}`);
        addLog(`result.user exists: ${Boolean(redirectResult?.user)}`);

        if (redirectResult && redirectResult.user) {
          addLog(`Firebase UID/email returned from redirectResult: ${redirectResult.user.email} (UID: ${redirectResult.user.uid})`);
          sessionStorage.removeItem('sbs_mobile_redirect_initiated');
          await completeMobileAuth(redirectResult.user);
          return;
        }

        // Step 2: If getRedirectResult was null, check auth.currentUser
        addLog(`Firebase currentUser after redirect: ${auth.currentUser ? `${auth.currentUser.email} (UID: ${auth.currentUser.uid})` : 'null'}`);
        if (wasRedirectInitiated && auth.currentUser) {
          addLog(`Found authenticated user in auth.currentUser: ${auth.currentUser.email}`);
          sessionStorage.removeItem('sbs_mobile_redirect_initiated');
          await completeMobileAuth(auth.currentUser);
          return;
        }

        // Step 3: If redirect was initiated, wait briefly for onAuthStateChanged to resolve
        if (wasRedirectInitiated) {
          addLog('Waiting for onAuthStateChanged listener to resolve user state...');
          const resolvedUser = await new Promise<FirebaseUser | null>((resolve) => {
            const timeout = setTimeout(() => {
              addLog('onAuthStateChanged wait timed out after 3.5s.');
              resolve(null);
            }, 3500);

            const unsubscribe = onAuthStateChanged(auth, (user) => {
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

          // If no user could be recovered after redirect, display prompt to tap and choose account
          addLog('No authenticated user returned after Google redirect. Showing account selection prompt.');
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
                  {status === 'cancelled' ? 'Account Selection Required' : 'Authentication Notice'}
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
                    {errorMessage}
                  </p>
                )}
                <p className="text-xs text-[#666666]">
                  Please tap below to choose your Google account.
                </p>
              </div>

              <div className="pt-2 w-full">
                <button
                  type="button"
                  onClick={triggerGoogleRedirect}
                  className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Choose Google Account</span>
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
            <div className="mt-2 p-2 bg-gray-900 text-gray-200 rounded-xl text-[10px] font-mono max-h-36 overflow-y-auto space-y-1 select-text">
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
