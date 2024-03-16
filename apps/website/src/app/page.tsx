import type { NextPage } from 'next';
import { Chat } from './chat';

const RootPage: NextPage = () => (
  <div className='flex flex-col gap-20'>
    <div className='flex items-center gap-10'>
      <h1 className='text-xl text-sage-12'>GPT</h1>
      <Chat api='https://hanjaemeo-production.up.railway.app/call' />
    </div>
  </div>
);

export default RootPage;

export const runtime = 'edge';
