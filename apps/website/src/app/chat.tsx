'use client';

import { useChat } from 'ai/react';

type ChatProps = {
  api: NonNullable<Parameters<typeof useChat>['0']>['api'];
};

export const Chat = ({ api }: ChatProps) => {
  const { messages, input, isLoading, handleInputChange, handleSubmit } = useChat({
    api,
    onResponse: response => {
      // biome-ignore lint/suspicious/noConsoleLog:
      console.log('response', response);
    },
  });

  return (
    <div>
      <ul>
        {messages.map((m, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey:
          <li key={index}>
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <label>
          Say something...
          <input value={input} onChange={handleInputChange} />
        </label>
        <button type='submit'>Send</button>
        {isLoading && <span>...</span>}
      </form>
    </div>
  );
};
