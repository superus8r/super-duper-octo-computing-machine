import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/TopBar';
import { EmptyState } from '../../components/EmptyState';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { getLists } from '../../lib/db';

const ListIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

export function ListsPage() {
  const navigate = useNavigate();
  const { data: lists, loading } = useLiveQuery(getLists, [], 'lists-changed');

  if (loading) {
    return (
      <>
        <TopBar title="Shopping Lists" />
        <div className="container py-4">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <>
        <TopBar title="Shopping Lists" />
        <div className="container py-4">
          <EmptyState
            icon={<ListIcon />}
            title="No shopping lists yet"
            description="Create your first shopping list to get started organizing your groceries and shopping items."
            action={{
              label: "Create List",
              onClick: () => navigate('/new')
            }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Shopping Lists" />
      <div className="container py-4">
        <div className="grid gap-4">
          {lists.map(list => (
            <div key={list.id} className="card cursor-pointer" onClick={() => navigate(`/list/${list.id}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{list.name}</h3>
                  <p className="text-sm text-fg-muted">
                    Created {list.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-primary">→</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}