import { useState, useCallback } from 'react';
import { departments as initialDepts, employees as initialEmps, evaluationCriteria as initialCriteria, evaluations as initialEvals } from '../data/mockData';
import type { Department, Employee, EvaluationCriteria, Evaluation, EvaluationItem, Goal, RatingScale } from '../types';

let evalIdCounter = 100;
let empIdCounter = 100;
let goalIdCounter = 100;

export function useStore() {
  const [departments, setDepartments] = useState<Department[]>(initialDepts);
  const [employees, setEmployees] = useState<Employee[]>(initialEmps);
  const [criteria] = useState<EvaluationCriteria[]>(initialCriteria);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvals);

  const addEmployee = useCallback((emp: Omit<Employee, 'id'>) => {
    const id = `e${++empIdCounter}`;
    setEmployees(prev => [...prev, { ...emp, id }]);
    return id;
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  const createEvaluation = useCallback((employeeId: string, year: number, period: 'H1' | 'H2') => {
    const id = `ev${++evalIdCounter}`;
    const items: EvaluationItem[] = initialCriteria.map(c => ({
      criteriaId: c.id,
      selfRating: null,
      managerRating: null,
      selfComment: '',
      managerComment: '',
    }));
    const newEval: Evaluation = {
      id,
      employeeId,
      year,
      period,
      status: 'self_evaluation',
      items,
      goals: [],
      overallSelfComment: '',
      overallManagerComment: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvaluations(prev => [...prev, newEval]);
    return id;
  }, []);

  const updateSelfEvaluation = useCallback((evalId: string, items: EvaluationItem[], overallComment: string) => {
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      return { ...ev, items, overallSelfComment: overallComment, status: 'manager_evaluation', updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateManagerEvaluation = useCallback((evalId: string, items: EvaluationItem[], overallComment: string) => {
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      return { ...ev, items, overallManagerComment: overallComment, status: 'completed', updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateItemRating = useCallback((evalId: string, criteriaId: string, field: 'selfRating' | 'managerRating', value: RatingScale) => {
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      const items = ev.items.map(item =>
        item.criteriaId === criteriaId ? { ...item, [field]: value } : item
      );
      return { ...ev, items, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateItemComment = useCallback((evalId: string, criteriaId: string, field: 'selfComment' | 'managerComment', value: string) => {
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      const items = ev.items.map(item =>
        item.criteriaId === criteriaId ? { ...item, [field]: value } : item
      );
      return { ...ev, items, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const addGoal = useCallback((evalId: string, goal: Omit<Goal, 'id'>) => {
    const id = `g${++goalIdCounter}`;
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      return { ...ev, goals: [...ev.goals, { ...goal, id }], updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateGoal = useCallback((evalId: string, goalId: string, updates: Partial<Goal>) => {
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      return {
        ...ev,
        goals: ev.goals.map(g => g.id === goalId ? { ...g, ...updates } : g),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const deleteGoal = useCallback((evalId: string, goalId: string) => {
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      return { ...ev, goals: ev.goals.filter(g => g.id !== goalId), updatedAt: new Date().toISOString() };
    }));
  }, []);

  const updateOverallComment = useCallback((evalId: string, field: 'overallSelfComment' | 'overallManagerComment', value: string) => {
    setEvaluations(prev => prev.map(ev => {
      if (ev.id !== evalId) return ev;
      return { ...ev, [field]: value, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const addDepartment = useCallback((name: string) => {
    const id = `d${departments.length + 10}`;
    setDepartments(prev => [...prev, { id, name }]);
  }, [departments.length]);

  return {
    departments,
    employees,
    criteria,
    evaluations,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    createEvaluation,
    updateSelfEvaluation,
    updateManagerEvaluation,
    updateItemRating,
    updateItemComment,
    addGoal,
    updateGoal,
    deleteGoal,
    updateOverallComment,
    addDepartment,
  };
}

export type StoreType = ReturnType<typeof useStore>;
