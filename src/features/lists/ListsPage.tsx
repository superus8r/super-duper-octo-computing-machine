import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/TopBar';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { getLists } from '../../lib/db';

export function ListsPage() {
  const navigate = useNavigate();
  const { data: lists } = useLiveQuery(getLists, [], 'lists-changed');

  return (
    <>
      <TopBar title="Your Lists" />
      <main className="container-page py-4">
        {!lists || lists.length === 0 ? (
          <div className="card p-6 text-center">
            <div className="mb-2 text-3xl">📝</div>
            <h2 className="mb-1 text-xl font-semibold">No lists yet</h2>
            <p className="muted mb-3">Create your first shopping list to get started.</p>
            <button
              type="button"
              className="btn primary"
              onClick={() => navigate('/new')}
              aria-label="Create a new list"
            >
              New List
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="muted">Recent Lists</div>
            {lists.map(list => (
              <div
                key={list.id}
                className="card cursor-pointer p-4"
                onClick={() => navigate(`/list/${list.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' ? navigate(`/list/${list.id}`) : null)}
                aria-label={`Open list ${list.name}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{list.name}</h3>
                    <p className="muted">Created {list.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="text-blue-600" aria-hidden>→</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}