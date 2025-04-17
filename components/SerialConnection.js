import { useState, useEffect } from 'react';

export default function SerialConnection() {
  const [isClient, setIsClient] = useState(false);
  const [ports, setPorts] = useState([]);
  const [connectedPort, setConnectedPort] = useState(null);
  const [scaleData, setScaleData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isSerialSupported = () => {
    return isClient && 'serial' in navigator;
  };

  const listSerialDevices = async () => {
    if (!isSerialSupported()) {
      setError('Web Serial API not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 }); // Adjust baud rate as needed
      setConnectedPort(port);
      startReading(port);
      
      const availablePorts = await navigator.serial.getPorts();
      setPorts(availablePorts);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startReading = async (port) => {
    const reader = port.readable.getReader();
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        setScaleData({
          value: text.trim(),
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      setError(`Reading error: ${err.message}`);
    } finally {
      reader.releaseLock();
    }
  };

  const sendCalibrationCommand = async (command) => {
    if (!connectedPort) {
      setError('No port connected');
      return;
    }

    try {
      const writer = connectedPort.writable.getWriter();
      const commands = {
        zero: 'Z\r\n',
        span: 'S\r\n',
        full: 'C\r\n'
      };
      
      await writer.write(new TextEncoder().encode(commands[command]));
      writer.releaseLock();
    } catch (err) {
      setError(`Command failed: ${err.message}`);
    }
  };

  const disconnect = async () => {
    if (connectedPort) {
      await connectedPort.close();
      setConnectedPort(null);
      setScaleData(null);
    }
  };

  if (!isClient) {
    return <div className="serial-interface">Loading...</div>;
  }

  return (
    <div className="serial-interface">
      <h2>Avery Pathfinder 6140 Calibration</h2>
      
      {!isSerialSupported() ? (
        <div className="error">
          Web Serial API not supported. Use Chrome/Edge 89+ or Opera 76+.
        </div>
      ) : (
        <>
          <div className="controls">
            <button 
              onClick={listSerialDevices} 
              disabled={isLoading || connectedPort}
            >
              {isLoading ? 'Connecting...' : 'Connect to Scale'}
            </button>
            
            {connectedPort && (
              <button onClick={disconnect}>Disconnect</button>
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {connectedPort && (
            <>
              <div className="scale-data">
                <h3>Scale Readings</h3>
                {scaleData ? (
                  <div>
                    <p>Value: {scaleData.value}</p>
                    <p>Last update: {scaleData.timestamp}</p>
                  </div>
                ) : (
                  <p>Waiting for data...</p>
                )}
              </div>

              <div className="calibration">
                <h3>Calibration Controls</h3>
                <div className="cal-buttons">
                  <button onClick={() => sendCalibrationCommand('zero')}>
                    Zero Calibration
                  </button>
                  <button onClick={() => sendCalibrationCommand('span')}>
                    Span Calibration
                  </button>
                  <button onClick={() => sendCalibrationCommand('full')}>
                    Full Calibration
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <style jsx>{`
        .serial-interface {
          margin: 2rem 0;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          max-width: 800px;
        }
        .error {
          color: red;
          margin: 1rem 0;
          padding: 0.5rem;
          background: #ffeeee;
          border-radius: 4px;
        }
        .controls, .cal-buttons {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
          flex-wrap: wrap;
        }
        button {
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .scale-data {
          margin: 1rem 0;
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 4px;
        }
        h3 {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}