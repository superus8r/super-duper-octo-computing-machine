import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/TopBar';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { useLiveQuery } from '../../hooks/useLiveQuery';
import { getLists } from '../../lib/db';

export function ListsPage() {
  const navigate = useNavigate();
  const { data: lists } = useLiveQuery(getLists, [], 'lists-changed');

  return (
    <>
      <TopBar title="Your Lists" />
      <div className="page-content">
        <DisclaimerBanner />

        {!lists || lists.length === 0 ? (
          <div className="card text-center">
            <div className="text-3xl mb-2">📝</div>
            <h2 className="text-xl font-semibold mb-1">No lists yet</h2>
            <p className="text-sm text-fg-muted mb-3">
              Create your first shopping list to get started.
            </p>
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
            <div className="text-sm text-fg-muted">Recent Lists</div>
            {lists.map(list => (
              <div
                key={list.id}
                className="card cursor-pointer"
                onClick={() => navigate(`/list/${list.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' ? navigate(`/list/${list.id}`) : null)}
                aria-label={`Open list ${list.name}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{list.name}</h3>
                    <p className="text-sm text-fg-muted">
                      Created {list.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-primary" aria-hidden>→</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}