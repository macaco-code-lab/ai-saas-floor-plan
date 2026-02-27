import Navbar from '../../components/Navbar';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'SaaSFloor - Design Floor Plans with AI' },
    { name: 'description', content: 'The ultimate AI-powered platform for floor plan design.' },
  ];
}

export default function Home() {
  return (
    <div>
      <Navbar />
      <h1 className="text-3xl font-extrabold text-indigo-700">Home</h1>
    </div>
  );
}
