import React from 'react';

interface SettingsProps {
  isCommuter: boolean;
  setIsCommuter: (isCommuter: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({
  isCommuter,
  setIsCommuter,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isCommuter}
              onChange={(e) => setIsCommuter(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-base font-medium text-gray-700">
              Commuter Mode
            </span>
          </label>
          <p className="text-base text-gray-500 mt-2">
            Speak "memory help" to reveal text, "memory go back" to hide it
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-medium mb-4">How to Use</h3>
        <div className="space-y-3 text-base text-gray-600">
          <p>1. Enter a Bible reference (e.g., "Romans 1", "John 3:16", or "James 1:2-4")</p>
          <p>2. Type the verse in the input box to practice</p>
          <p>3. For commuter mode, use your phone's speak-to-text and the special commands above for help</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
