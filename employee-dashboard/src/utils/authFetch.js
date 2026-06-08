const originalFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  const token = localStorage.getItem("jwt_token");
  const headers = new Headers(init.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return originalFetch(input, {
    ...init,
    headers,
  });
};
