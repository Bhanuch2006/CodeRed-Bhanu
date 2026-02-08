'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({
  code,
  onChange,
  language = 'javascript',
  readOnly = false,
  height = '400px',
}: CodeEditorProps) {
  return (
    <Editor
      height={height}
      language={language}
      value={code}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        readOnly,
        automaticLayout: true,
      }}
    />
  );
}
