import { TopBar } from '../../components/TopBar';

export function ProfilePage() {
  return (
    <>
      <TopBar title="Profile" />
      <div className="container py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile & Statistics</h2>
          <p className="text-fg-muted">
            Statistics and theme settings will be implemented here.
          </p>
        </div>
      </div>
    </>
  );
}