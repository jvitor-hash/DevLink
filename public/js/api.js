const API = {
  BASE_URL: window.API_URL_BASE || "",

  get: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("AccessToken")}`
      },
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
    });
  },

  post: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "POST",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("AccessToken")}`
      },
      data: JSON.stringify(payload),
      dataType: "json",
    });
  },

  patch: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "PATCH",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("AccessToken")}`
      },
      data: JSON.stringify(payload),
      dataType: "json",
    });
  },

  put: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "PUT",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("AccessToken")}`
      },
      data: JSON.stringify(payload),
      dataType: "json",
    });
  },

  delete: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "DELETE",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("AccessToken")}`
      },
      data: JSON.stringify(payload),
      dataType: "json",
    });
  }
};
