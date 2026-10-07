/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VideoPresentationPlayer } from './components/VideoPresentationPlayer';
import { BaselineModelChoice } from './data/forecastingData';

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedBaseline, setSelectedBaseline] = useState<BaselineModelChoice>('es05');

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#060B14] text-slate-100 overflow-hidden flex flex-col font-sans select-none">
      <main className="w-full h-full flex-1 relative overflow-hidden flex items-center justify-center">
        <VideoPresentationPlayer
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          selectedBaseline={selectedBaseline}
          onSelectBaseline={setSelectedBaseline}
        />
      </main>
    </div>
  );
}

