import { useLocalStorage } from '../../hooks/useLocalStorage';
import ListView from '../list/ListView';
import DetailView from '../detail/DetailView';
import Titlebar from './Titlebar';

export default function Dashboard() {
  const [viewMode, setViewMode] = useLocalStorage<'list' | 'detail'>('viewMode', 'list');

  return (
    <div className="app-shell">
      <Titlebar />
      {viewMode === 'detail'
        ? <DetailView onBack={() => setViewMode('list')} />
        : <ListView onSelectCoin={() => setViewMode('detail')} />
      }
    </div>
  );
}
