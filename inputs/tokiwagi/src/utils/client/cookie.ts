export const isCookieEnabled = () => {
  document.cookie = "test_cookie=1";
  const cookiesEnabled = document.cookie.indexOf("test_cookie=") !== -1;
  document.cookie = "test_cookie=1; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
  return cookiesEnabled;
};
