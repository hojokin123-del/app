import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Employee } from '../types';

const POSITIONS = ['部長', '課長', 'シニアエンジニア', 'エンジニア', '営業マネージャー', '営業担当', '人事マネージャー', '人事担当', 'その他'];

function getInitials(name: string) {
  const parts = name.replace(/\s+/g, ' ').trim().split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name.slice(0, 2);
}

type ModalProps = {
  employee?: Employee;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id'>) => void;
};

function EmployeeModal({ employee, onClose, onSave }: ModalProps) {
  const { departments, employees } = useApp();
  const [form, setForm] = useState({
    name: employee?.name ?? '',
    nameKana: employee?.nameKana ?? '',
    email: employee?.email ?? '',
    departmentId: employee?.departmentId ?? departments[0]?.id ?? '',
    position: employee?.position ?? POSITIONS[0],
    managerId: employee?.managerId ?? '',
    joinDate: employee?.joinDate ?? new Date().toISOString().slice(0, 10),
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const avatarInitials = getInitials(form.name);
    onSave({ ...form, managerId: form.managerId || null, avatarInitials });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{employee ? '従業員編集' : '従業員追加'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>氏名 *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="田中 太郎" />
            </div>
            <div className="form-group">
              <label>氏名（カナ）</label>
              <input value={form.nameKana} onChange={e => set('nameKana', e.target.value)} placeholder="タナカ タロウ" />
            </div>
          </div>
          <div className="form-group">
            <label>メールアドレス *</label>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tanaka@example.com" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>部署 *</label>
              <select required value={form.departmentId} onChange={e => set('departmentId', e.target.value)}>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>役職 *</label>
              <select value={form.position} onChange={e => set('position', e.target.value)}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>上司</label>
              <select value={form.managerId} onChange={e => set('managerId', e.target.value)}>
                <option value="">なし</option>
                {employees.filter(e => e.id !== employee?.id).map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>入社日 *</label>
              <input required type="date" value={form.joinDate} onChange={e => set('joinDate', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>キャンセル</button>
            <button type="submit" className="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Employees() {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = employees.filter(e => {
    const matchSearch = !search || e.name.includes(search) || e.nameKana.includes(search) || e.email.includes(search);
    const matchDept = !deptFilter || e.departmentId === deptFilter;
    return matchSearch && matchDept;
  });

  const handleSave = (data: Omit<Employee, 'id'>) => {
    if (editTarget) {
      updateEmployee(editTarget.id, data);
    } else {
      addEmployee(data);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('この従業員を削除してもよいですか？')) deleteEmployee(id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>従業員管理</h1>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowModal(true); }}>
          <Plus size={16} /> 従業員追加
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="氏名・メールで検索..." />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="filter-select">
          <option value="">すべての部署</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>従業員</th>
              <th>部署</th>
              <th>役職</th>
              <th>入社日</th>
              <th>上司</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => {
              const dept = departments.find(d => d.id === emp.departmentId);
              const manager = employees.find(e => e.id === emp.managerId);
              return (
                <tr key={emp.id}>
                  <td>
                    <Link to={`/employees/${emp.id}`} className="emp-cell">
                      <div className="avatar">{emp.avatarInitials}</div>
                      <div>
                        <div className="emp-name">{emp.name}</div>
                        <div className="emp-email">{emp.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td>{dept?.name ?? '-'}</td>
                  <td><span className="badge">{emp.position}</span></td>
                  <td>{emp.joinDate}</td>
                  <td>{manager?.name ?? '-'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" title="編集" onClick={() => { setEditTarget(emp); setShowModal(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn danger" title="削除" onClick={() => handleDelete(emp.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-row">従業員が見つかりません</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <EmployeeModal
          employee={editTarget ?? undefined}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
