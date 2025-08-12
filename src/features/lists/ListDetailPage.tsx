import { useParams } from 'react-router-dom';
import { TopBar } from '../../components/TopBar';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { getList } from '../../lib/db';

export function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: list, loading } = useLiveQuery(
    () => getList(id!), 
    [id], 
    'lists-changed'
  );

  if (loading) {
    return (
      <>
        <TopBar title="Loading..." />
        <div className="container py-4">
          <div className="text-center">Loading list...</div>
        </div>
      </>
    );
  }

  if (!list) {
    return (
      <>
        <TopBar title="List Not Found" />
        <div className="container py-4">
          <div className="text-center">
            <p className="text-fg-muted">The requested list could not be found.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={list.name} />
      <div className="container py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{list.name}</h2>
          <p className="text-fg-muted">
            List items and shopping functionality will be implemented here.
          </p>
        </div>
      </div>
    </>
  );
}