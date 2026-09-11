// src/services/api.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// --- GROUPS ---
export const getGroups = async (search = '', sortBy = '', direction = '', userName = '', userEmail = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);
  if (direction) params.append('direction', direction);
  if (userName) params.append('userName', userName);
  if (userEmail) params.append('userEmail', userEmail);
  const res = await fetch(`${API_BASE}/groups?${params.toString()}`);
  return res.json();
};

export const createGroup = async (data, creatorName = '', creatorEmail = '') => {
  const params = new URLSearchParams();
  if (creatorName) params.append('creatorName', creatorName);
  if (creatorEmail) params.append('creatorEmail', creatorEmail);
  const res = await fetch(`${API_BASE}/groups?${params.toString()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteGroup = async (groupId) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}`, { method: 'DELETE' });
  return res.json();
};

// --- MEMBERS ---
export const getMembers = async (groupId) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/members`);
  return res.json();
};

export const addMember = async (groupId, data) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteMember = async (groupId, memberId) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/members/${memberId}`, { method: 'DELETE' });
  return res.json();
};

// --- EXPENSES ---
export const getGroupExpenses = async (groupId, sortBy = 'expenseDate', direction = 'desc') => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/expenses?sortBy=${sortBy}&direction=${direction}`);
  return res.json();
};

export const createGroupExpense = async (groupId, data) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateGroupExpense = async (groupId, expenseId, data) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/expenses/${expenseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteGroupExpense = async (groupId, expenseId) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/expenses/${expenseId}`, { method: 'DELETE' });
  return res.json();
};

// --- NON-GROUP EXPENSES ---
export const getNonGroupExpenses = async (userEmail = '') => {
  const params = new URLSearchParams();
  if (userEmail) params.append('userEmail', userEmail);
  const res = await fetch(`${API_BASE}/expenses/non-group?${params.toString()}`);
  return res.json();
};

export const createNonGroupExpense = async (data) => {
  const res = await fetch(`${API_BASE}/expenses/non-group`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// --- SETTLEMENTS & BALANCES ---
export const getGroupBalances = async (groupId) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/balances`);
  return res.json();
};

export const getGroupSettlements = async (groupId) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/settlements`);
  return res.json();
};

export const settleDebt = async (groupId, data) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteSettlement = async (groupId, settlementId) => {
  const res = await fetch(`${API_BASE}/groups/${groupId}/settlements/${settlementId}`, { method: 'DELETE' });
  return res.json();
};

// --- CATEGORIES ---
export const getCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
};

// --- USER SUMMARY ---
export const getUserFinancialSummary = async (userName, userEmail = '') => {
  const params = new URLSearchParams();
  if (userName) params.append('name', userName);
  if (userEmail) params.append('email', userEmail);
  const res = await fetch(`${API_BASE}/users/summary?${params.toString()}`);
  return res.json();
};

export const getActivities = async () => {
  const res = await fetch(`${API_BASE}/activities`);
  return res.json();
};

// --- ISSUE REPORTS ---
export const getIssueReports = async () => {
  const res = await fetch(`${API_BASE}/reports`);
  return res.json();
};

export const createIssueReport = async (data) => {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const toggleIssueReportStatus = async (id) => {
  const res = await fetch(`${API_BASE}/reports/${id}/toggle`, { method: 'PUT' });
  return res.json();
};