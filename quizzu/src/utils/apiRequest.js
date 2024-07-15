import axios from "axios";

const ApiRequest = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
});

ApiRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("token");
        const res = await axios.post(
          "http://localhost:4000/api/v1/user/refresh-token",
          { refreshToken: JSON.parse(refreshToken) },
          {
            withCredentials: true,
          }
        );

        if (res.status === 200) {
          return ApiRequest(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default ApiRequest;
