// src/routes/locations.js
export const getLocations = async (API_BASE, token) => {
  const res = await fetch(`${API_BASE}/locations/all`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.json();
};

export const deleteLocation = async (API_BASE, id, token) => {
  const res = await fetch(`${API_BASE}/locations/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res;
};

export const createLocation = async (API_BASE, data, token) => {
  const res = await fetch(`${API_BASE}/locations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
  });

  return res.json().catch(() => ({}));
};

export const updateLocation = async (API_BASE, id, data, token) => {
  const res = await fetch(`${API_BASE}/locations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(data),
  });

  return res.json().catch(() => ({}));
};

