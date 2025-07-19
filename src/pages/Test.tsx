import React, { useState } from 'react';
import { useNDK } from '../contexts/NDKContext';
import { useCreateCounter } from '../hooks/useCounters';
import { deriveCounterType } from '../utils/nostr';
import type { CounterFormData } from '../types';
import { NDKEvent } from '@nostr-dev-kit/ndk';

export const Test: React.FC = () => {
  const { isConnected, login, ndk, user } = useNDK();
  const { createCounter, loading, error } = useCreateCounter();
  const [testResult, setTestResult] = useState<string>('');

  const handleTestCounter = async () => {
    try {
      setTestResult('Testing counter creation...');
      
      const testData: CounterFormData = {
        title: 'Test Counter',
        date: '2024-01-01',
        type: 'since', // This will be overridden by auto-derivation
        visibility: 'public',
      };

      console.log('Creating test counter with data:', testData);
      const event = await createCounter(testData);
      console.log('Test counter created:', event);
      
      setTestResult(`✅ Counter created successfully! Event ID: ${event.id}`);
    } catch (err) {
      console.error('Test failed:', err);
      setTestResult(`❌ Test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestResult('Testing NDK connection...');
      
      if (!ndk) {
        setTestResult('❌ NDK not initialized');
        return;
      }
      
      // Test fetching a simple event
      const filter = { kinds: [1], limit: 1 };
      const events = await ndk.fetchEvents(filter);
      
      setTestResult(`✅ NDK connection working! Found ${events.size} events`);
    } catch (err) {
      console.error('Connection test failed:', err);
      setTestResult(`❌ Connection test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSimpleTest = async () => {
    if (!ndk || !user) {
      setTestResult('❌ NDK not initialized or user not logged in');
      return;
    }

    try {
      setTestResult('Creating simple counter...');
      
      // Create the simplest possible counter
      const eventData = {
        kind: 30078,
        content: '',
        tags: [
          ['type', 'since'],
          ['title', 'Simple Test'],
          ['date', '2024-01-01'],
          ['visibility', 'public'],
        ],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: user.pubkey,
      };

      console.log('Simple event data:', eventData);

      const event = new NDKEvent(ndk, eventData);
      console.log('Simple event created:', event);
      console.log('Event tags:', event.tags);
      console.log('Event kind:', event.kind);

      console.log('Signing simple event...');
      await event.sign();
      console.log('Simple event signed successfully');
      
      console.log('Publishing simple event...');
      await event.publish();
      console.log('Simple event published successfully');
      
      setTestResult(`✅ Simple counter created! Event ID: ${event.id}`);
    } catch (err) {
      console.error('Simple test failed:', err);
      setTestResult(`❌ Simple test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleManualCounter = async () => {
    if (!ndk || !user) {
      setTestResult('❌ NDK not initialized or user not logged in');
      return;
    }

    try {
      setTestResult('Creating counter manually...');
      
      const testDate = '2024-01-01';
      const derivedType = deriveCounterType(testDate);
      
      console.log('Test date:', testDate);
      console.log('Derived type:', derivedType);
      
      // Create event manually following counter.md specification
      const eventData = {
        kind: 30078,
        content: '',
        tags: [
          ['type', derivedType],
          ['title', 'Manual Test Counter'],
          ['date', testDate],
          ['visibility', 'public'],
        ],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: user.pubkey,
      };

      console.log('Manual event data:', eventData);

      const event = new NDKEvent(ndk, eventData);
      console.log('Event created with tags:', event.tags);

      console.log('Signing event...');
      await event.sign();
      console.log('Event signed successfully');
      
      console.log('Publishing event...');
      await event.publish();
      console.log('Event published successfully');
      
      setTestResult(`✅ Manual counter created! Event ID: ${event.id}`);
    } catch (err) {
      console.error('Manual test failed:', err);
      setTestResult(`❌ Manual test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleTestTypeDerivation = () => {
    const testDates = [
      { date: '2023-01-01', expected: 'since' },
      { date: '2024-01-01', expected: 'since' },
      { date: '2025-01-01', expected: 'until' },
      { date: new Date().toISOString().split('T')[0], expected: 'since' },
    ];

    let result = 'Testing type derivation:\n';
    testDates.forEach(({ date, expected }) => {
      const derived = deriveCounterType(date);
      const status = derived === expected ? '✅' : '❌';
      result += `${status} ${date} → ${derived} (expected: ${expected})\n`;
    });

    setTestResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">NostrCount Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="mb-4">
            <strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}
          </p>
          
          {!isConnected && (
            <button
              onClick={login}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Connect Nostr Extension
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          
          <button
            onClick={handleTestConnection}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Test NDK Connection
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Type Derivation Test</h2>
          
          <button
            onClick={handleTestTypeDerivation}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Test Type Derivation
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Counter Creation Tests</h2>
          
          {isConnected ? (
            <div className="space-y-4">
              <div>
                <button
                  onClick={handleTestCounter}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mr-2"
                >
                  {loading ? 'Creating...' : 'Create Test Counter (Hook)'}
                </button>
                
                <button
                  onClick={handleManualCounter}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mr-2"
                >
                  Create Manual Counter
                </button>
                
                <button
                  onClick={handleSimpleTest}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  Simple Test
                </button>
              </div>
              
              {error && (
                <p className="text-red-600 mt-2">Error: {error}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Please connect your Nostr extension first.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <p className="text-sm text-gray-600">
            Check the browser console for detailed logs about the counter creation process.
          </p>
          {user && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="text-sm">
                <strong>User Pubkey:</strong> {user.pubkey}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 