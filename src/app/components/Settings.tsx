import React from 'react';

interface SettingsProps {
  translation: string;
  setTranslation: (translation: string) => void;
  isCommuter: boolean;
  setIsCommuter: (isCommuter: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({
  translation,
  setTranslation,
  isCommuter,
  setIsCommuter,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bible Translation
          </label>
          <select
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ESV">English Standard Version (ESV)</option>
            <option value="KJV">King James Version (KJV)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isCommuter}
              onChange={(e) => setIsCommuter(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Commuter Mode
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Type "memory help" to reveal text, "memory go back" to hide it
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">How to Use</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Enter a Bible reference (e.g., "John 3:16" or "James 1:2-4")</p>
          <p>2. The verse will be displayed for you to memorize</p>
          <p>3. Type the verse in the input box to practice</p>
          <p>4. For commuter mode, use the special commands above</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
