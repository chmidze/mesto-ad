import credentials from "../../../credentials.json";

const { ENDPOINT, TOKEN, GROUP_ID } = credentials;

const missingCredentials = [];
if (typeof ENDPOINT !== "string" || ENDPOINT.trim() === "") {
  missingCredentials.push("ENDPOINT");
}
if (
  typeof TOKEN !== "string" ||
  TOKEN.trim() === "" ||
  TOKEN.startsWith("PASTE_")
) {
  missingCredentials.push("TOKEN");
}
if (
  typeof GROUP_ID !== "string" ||
  GROUP_ID.trim() === "" ||
  GROUP_ID.startsWith("PASTE_")
) {
  missingCredentials.push("GROUP_ID");
}

if (missingCredentials.length > 0) {
  throw new Error(
    `Заполните credentials.json: ${missingCredentials.join(", ")}`
  );
}

const config = {
  baseUrl: `${ENDPOINT}/v1/${GROUP_ID}`,
  headers: {
    authorization: TOKEN,
    "Content-Type": "application/json",
  },
};

const getResponseData = async (res) => {
  let responseData = null;
  try {
    responseData = await res.json();
  } catch {
    responseData = null;
  }

  if (!res.ok) {
    const message =
      responseData && typeof responseData.message === "string"
        ? `: ${responseData.message}`
        : "";
    return Promise.reject(`Ошибка: ${res.status}${message}`);
  }

  return responseData;
};

const request = (url, options = {}) => {
  return fetch(url, {
    headers: config.headers,
    ...options,
  }).then(getResponseData);
};

export const getUserInfo = () => {
  return request(`${config.baseUrl}/users/me`);
};

export const getCardList = () => {
  return request(`${config.baseUrl}/cards`);
};

export const setUserInfo = ({ name, about }) => {
  return request(`${config.baseUrl}/users/me`, {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });
};

export const setUserAvatar = ({ avatar }) => {
  return request(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });
};

export const addCard = ({ name, link }) => {
  return request(`${config.baseUrl}/cards`, {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });
};

export const deleteCard = (cardId) => {
  return request(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
  });
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  return request(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
  });
};
