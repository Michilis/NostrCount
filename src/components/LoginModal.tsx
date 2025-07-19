import React, { useState } from 'react';
import { X, Key, Zap, Plus, Copy, ExternalLink } from 'lucide-react';
import { useNDK } from '../contexts/NDKContext';
import { nip19, generateSecretKey, getPublicKey } from 'nostr-tools';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginMethod = 'extension' | 'keys' | 'create' | 'nip55';
type CreateStep = 'username' | 'keys';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, loginWithKeys, loginWithNip55, updateUserProfile } = useNDK();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('extension');
  const [createStep, setCreateStep] = useState<CreateStep>('username');
  
  // Keys login
  const [keyInput, setKeyInput] = useState('');
  const [keyType, setKeyType] = useState<'npub' | 'nsec' | 'unknown'>('unknown');
  
  // Account creation
  const [username, setUsername] = useState('');
  const [newPrivateKey, setNewPrivateKey] = useState('');
  const [newPublicKey, setNewPublicKey] = useState('');
  
  // NIP-55
  const [nip55Url, setNip55Url] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectKeyType = (input: string): 'npub' | 'nsec' | 'unknown' => {
    if (input.startsWith('npub')) return 'npub';
    if (input.startsWith('nsec')) return 'nsec';
    return 'unknown';
  };

  const handleKeyInputChange = (value: string) => {
    setKeyInput(value);
    setKeyType(detectKeyType(value));
  };

  const handleExtensionLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await login();
      onClose();
    } catch (err) {
      console.error('Extension login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeysLogin = async () => {
    if (!keyInput.trim()) {
      setError('Please enter a public or private key');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (keyType === 'nsec') {
        // Private key provided - we can derive the public key
        await loginWithKeys('', keyInput.trim());
      } else if (keyType === 'npub') {
        // Only public key provided - read-only mode
        setError('Public key only provides read-only access. Please provide a private key for full access.');
        return;
      } else {
        setError('Please enter a valid npub or nsec key');
        return;
      }
      
      onClose();
    } catch (err) {
      console.error('Keys login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Generate new key pair
      const privateKey = generateSecretKey();
      const publicKey = getPublicKey(privateKey);
      
      // Encode to nostr format
      const nsec = nip19.nsecEncode(privateKey);
      const npub = nip19.npubEncode(publicKey);
      
      setNewPrivateKey(nsec);
      setNewPublicKey(npub);
      setCreateStep('keys');
    } catch (err) {
      console.error('Account creation failed:', err);
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleUseNewKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Login with the new keys
      await loginWithKeys(newPublicKey, newPrivateKey);
      
      // Update user profile with the username
      await updateUserProfile({
        name: username,
        display_name: username,
      });
      
      onClose();
    } catch (err) {
      console.error('Login with new keys failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNip55Login = async () => {
    if (!nip55Url.trim()) {
      setError('Please enter a NIP-55 URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await loginWithNip55(nip55Url);
      onClose();
    } catch (err) {
      console.error('NIP-55 login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetForm = () => {
    setKeyInput('');
    setKeyType('unknown');
    setUsername('');
    setNewPrivateKey('');
    setNewPublicKey('');
    setNip55Url('');
    setError(null);
    setCreateStep('username');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect to Nostr
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLoginMethod('extension')}
              className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                loginMethod === 'extension'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4 inline mr-1" />
              Extension
            </button>
            <button
              onClick={() => setLoginMethod('keys')}
              className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                loginMethod === 'keys'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Key className="w-4 h-4 inline mr-1" />
              Keys
            </button>
            <button
              onClick={() => setLoginMethod('create')}
              className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                loginMethod === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Create
            </button>
            <button
              onClick={() => setLoginMethod('nip55')}
              className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                loginMethod === 'nip55'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ExternalLink className="w-4 h-4 inline mr-1" />
              NIP-55
            </button>
          </div>

          {loginMethod === 'extension' && (
            <div>
              <p className="text-gray-600 mb-4">
                Connect using your Nostr browser extension (Alby, nos2x, etc.)
              </p>
              <button
                onClick={handleExtensionLogin}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Extension'}
              </button>
            </div>
          )}

          {loginMethod === 'keys' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public or Private Key
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => handleKeyInputChange(e.target.value)}
                  placeholder="npub1... or nsec1..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                {keyType !== 'unknown' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Detected: {keyType === 'npub' ? 'Public Key (Read-only)' : 'Private Key (Full Access)'}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleKeysLogin}
                disabled={loading || keyType === 'unknown'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect with Keys'}
              </button>
            </div>
          )}

          {loginMethod === 'create' && createStep === 'username' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used to identify your account
                </p>
              </div>
              
              <button
                onClick={handleCreateAccount}
                disabled={loading || !username.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          )}

          {loginMethod === 'create' && createStep === 'keys' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Save Your Keys!</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Store these keys safely. You'll need them to access your account.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Private Key (nsec) - Keep Secret!
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPrivateKey}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(newPrivateKey)}
                    className="absolute right-2 top-2 p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Key (npub)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newPublicKey}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(newPublicKey)}
                    className="absolute right-2 top-2 p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleUseNewKeys}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Use These Keys'}
              </button>
            </div>
          )}

          {loginMethod === 'nip55' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIP-55 URL
                </label>
                <input
                  type="url"
                  value={nip55Url}
                  onChange={(e) => setNip55Url(e.target.value)}
                  placeholder="https://example.com/.well-known/nostr.json"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a NIP-55 compatible URL to connect with an external signer
                </p>
              </div>
              
              <button
                onClick={handleNip55Login}
                disabled={loading || !nip55Url.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect with NIP-55'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 