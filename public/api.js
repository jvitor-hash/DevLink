const API = {
  BASE_URL: window.API_URL_BASE || "",

  get: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "GET",
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
      data: JSON.stringify(payload),
      dataType: "json",
    });
  },

  patch: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
    });
  },

  put: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
    });
  },

  delete: function (endpoint, payload) {
    return $.ajax({
      url: `${this.BASE_URL}${endpoint}`,
      method: "DELETE",
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json",
    });
  }
};
